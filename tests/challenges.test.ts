import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { createChallenge, listChallenges, recordChallengeAttempt } from '../src/data/repositories/challenges'
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
