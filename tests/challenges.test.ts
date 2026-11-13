import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { createChallenge, deleteChallenge, deleteChallengeAttempt, listChallengeAttempts, listChallenges, listChallengeVersions, recordChallengeAttempt, updateChallenge, updateChallengeAttempt } from '../src/data/repositories/challenges'
import { formatResult, isBetter, parseResult, type ChallengeMetric } from '../src/domain/challenges/models'
import { routeFromHash, routeHash, routeTab } from '../src/app/navigation'

const rounds: ChallengeMetric = { name: 'Rounds completed', type: 'rounds-reps', unit: '', direction: 'higher' }
const score: ChallengeMetric = { name: 'Technique', type: 'custom', unit: 'points', direction: 'trend' }

it('routes to challenge details under Performance and compares rounds before extra reps', () => {
  const route = { screen: 'performance/challenges/detail', challengeId: crypto.randomUUID() } as const
  expect(routeFromHash(routeHash(route))).toEqual(route)
  expect(routeTab(route.screen)).toBe('performance')
  expect(parseResult({ value: '7', extra: '' }, rounds)).toEqual({ rounds: 7, reps: 0 })
  expect(formatResult({ rounds: 7, reps: 12 }, rounds)).toBe('7 rounds + 12 reps')
  expect(isBetter({ rounds: 8, reps: 0 }, { rounds: 7, reps: 99 }, 'higher')).toBe(true)
  expect(isBetter({ rounds: 7, reps: 12 }, { rounds: 7, reps: 8 }, 'higher')).toBe(true)
  expect(isBetter(30, 35, 'lower')).toBe(true)
  expect(isBetter(-1, -3, 'trend')).toBe(false)
  expect(parseResult({ value: '-3,5', extra: '' }, score)).toBe(-3.5)
  expect(() => parseResult({ value: '7', extra: '1.5' }, rounds)).toThrow()
})

it('restores definitions and attempts, accepts older backups, and rejects missing parents and wrong metric types', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    const challenge = await createChallenge({
      name: '10-minute finisher', kind: 'Finisher', rules: 'Use the same circuit.',
      metrics: [rounds, score], target: { rounds: 8, reps: 0 },
    }, source)
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    await recordChallengeAttempt(challenge.id, [{ rounds: 8, reps: 0 }, -3.5], 'First attempt', source)
    vi.setSystemTime(new Date('2026-01-02T09:00:00Z'))
    await recordChallengeAttempt(challenge.id, [{ rounds: 7, reps: 12 }, null], '', source)
    await expect(recordChallengeAttempt(challenge.id, [null, 5], '', source)).rejects.toThrow()
    await expect(recordChallengeAttempt(challenge.id, [7.12, null], '', source)).rejects.toThrow()
    expect(await listChallenges(source)).toMatchObject([{ latest: { rounds: 7, reps: 12 }, best: { rounds: 8, reps: 0 } }])

    const snapshot = await createBackup(source)
    const { challenges: _definitions, challengeAttempts: _attempts, ...legacyData } = snapshot.data
    expect(validateBackup({ ...snapshot, formatVersion: 15, data: legacyData }).data)
      .toEqual({ ...legacyData, challenges: [], challengeAttempts: [] })
    const exported = await exportBackupFile(source)
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    await discardStage(exported.snapshot.id, source)
    expect((await createBackup(target)).data).toEqual(snapshot.data)
    const orphan = structuredClone(snapshot)
    orphan.data.challenges = []
    expect(() => validateBackup(orphan)).toThrow()
    await expect(stageImport(new Blob([JSON.stringify(orphan)]), target)).rejects.toThrow()
    const wrongType = structuredClone(snapshot)
    wrongType.data.challengeAttempts[0].results[0] = 7.12
    await expect(stageImport(new Blob([JSON.stringify(wrongType)]), target)).rejects.toThrow('Attempt measurements do not match')
    expect((await createBackup(target)).data).toEqual(snapshot.data)
  } finally {
    vi.useRealTimers()
    await source.delete()
    await target.delete()
  }
})

it('preserves version-specific rules and metrics and transactionally deletes the entire challenge', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    const setup = { name: 'Finisher', kind: 'Finisher' as const, rules: '10 minutes', metrics: [rounds, score] }
    const first = await createChallenge(setup, source)
    await recordChallengeAttempt(first.id, [{ rounds: 8, reps: 1 }, null], '', source)
    await recordChallengeAttempt(first.id, [{ rounds: 4, reps: 0 }, null], '', source)
    const clarified = await updateChallenge(first.id, { ...setup, rules: 'Exactly 10 minutes',
      metrics: [{ ...rounds, name: 'Circuit result', direction: 'lower' }, score] }, false, source)
    expect(clarified.id).toBe(first.id)
    expect((await listChallenges(source))[0].best).toEqual({ rounds: 4, reps: 0 })
    const next = await updateChallenge(first.id, { ...setup, name: 'Updated finisher', rules: '12 minutes',
      metrics: [score] }, true, source)
    expect(next).toMatchObject({ rootId: first.id, version: 2 })
    expect((await listChallengeVersions(first.id, source)).map(row => row.rules)).toEqual(['12 minutes', 'Exactly 10 minutes'])
    expect(await listChallengeAttempts(next.id, source)).toEqual([])
    await expect(recordChallengeAttempt(first.id, [{ rounds: 9, reps: 0 }, null], '', source)).rejects.toThrow('current version')
    const [attempt, other] = await listChallengeAttempts(first.id, source)
    await updateChallengeAttempt(attempt.id, [{ rounds: 5, reps: 1 }, -3], 'Corrected', source)
    expect((await listChallengeAttempts(first.id, source)).find(row => row.id === attempt.id))
      .toMatchObject({ challengeId: first.id, recordedAt: attempt.recordedAt, notes: 'Corrected' })
    await deleteChallengeAttempt(other.id, source)
    await recordChallengeAttempt(next.id, [2], '', source)
    const latest = await updateChallenge(next.id, { ...setup, metrics: [{ ...score, unit: 'marks' }] }, false, source)
    expect(latest).toMatchObject({ rootId: first.id, version: 3 })
    expect(await listChallenges(source)).toHaveLength(1)

    const exported = await exportBackupFile(source)
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    await discardStage(exported.snapshot.id, source)
    const restored = await createBackup(target)
    expect(restored.data).toEqual((await createBackup(source)).data)
    const invalid = structuredClone(restored)
    invalid.data.challenges.find(row => row.id === latest.id)!.version = 2
    expect(() => validateBackup(invalid)).toThrow('Invalid challenge version history')
    await expect(stageImport(new Blob([JSON.stringify(invalid)]), target)).rejects.toThrow()
    await expect(deleteChallenge(first.id, 1, target)).rejects.toThrow('attempt count changed')
    await deleteChallenge(first.id, 2, target)
    expect(await target.challenges.count()).toBe(0)
    expect(await target.challengeAttempts.count()).toBe(0)
  } finally {
    await source.delete()
    await target.delete()
  }
})
