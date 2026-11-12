import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { deletePushupAttempt, listPushupAttempts, recordPushupAttempt } from '../src/data/repositories/pushups'
import { pushupProgress } from '../src/domain/calisthenics/pushups'
import { listRepAttempts, recordRepAttempt } from '../src/data/repositories/repAttempts'
import { REP_TRACKS } from '../src/domain/calisthenics/repTracks'

it('keeps the latest attempt distinct from the best, advances milestones, and restores saved attempts', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    await recordPushupAttempt(26, 'First benchmark', source)
    vi.setSystemTime(new Date('2026-01-02T09:00:00Z'))
    await recordPushupAttempt(20, '', source)
    await expect(recordPushupAttempt(2.5, '', source)).rejects.toThrow('Invalid push-up attempt')
    const attempts = await listPushupAttempts(source)
    expect(pushupProgress(attempts)).toMatchObject({ latest: 20, best: 26, next: 50 })
    expect(pushupProgress(attempts).timeline.map(row => row.best)).toEqual([26, 26])
    const exported = await exportBackupFile(source)
    await deletePushupAttempt(attempts[0].id, source)
    expect(pushupProgress(await listPushupAttempts(source))).toMatchObject({ best: 20, next: 25 })
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    expect(await listPushupAttempts(target)).toEqual(attempts)
    await discardStage(exported.snapshot.id, source)
    const bad = await createBackup(target)
    bad.data.pushupAttempts[0].reps = -1
    expect(() => validateBackup(bad)).toThrow('Invalid push-up attempt')
    await expect(stageImport(new Blob([JSON.stringify(bad)]), target)).rejects.toThrow('Invalid push-up attempt')
    expect(await listPushupAttempts(target)).toEqual(attempts)
  } finally { vi.useRealTimers(); await source.delete(); await target.delete() }
})

it('keeps pull-up progress independent and restores both tracks', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    await recordPushupAttempt(26, '', source)
    await recordRepAttempt('pullups', 9, 'Strict reps', source)
    vi.setSystemTime(new Date('2026-01-02T09:00:00Z'))
    await recordRepAttempt('pullups', 6, '', source)
    const attempts = await listRepAttempts('pullups', source)
    const progress = pushupProgress(attempts, REP_TRACKS.pullups.milestones)
    expect(progress).toMatchObject({ latest: 6, best: 9, next: 15 })
    expect(progress.timeline.map(row => row.best)).toEqual([9, 9])
    const snapshot = await createBackup(source)
    const { plancheAttempts: _planche, muscleupAttempts: _muscleups, pullupAttempts: _pullups, ...legacyData } = snapshot.data
    const legacy = { ...snapshot, formatVersion: 10, data: legacyData }
    expect(validateBackup(legacy).data).toMatchObject({ pushupAttempts: legacyData.pushupAttempts, pullupAttempts: [], muscleupAttempts: [], plancheAttempts: [] })
    const exported = await exportBackupFile(source)
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    expect(await listRepAttempts('pullups', target)).toEqual(attempts)
    expect(await listPushupAttempts(target)).toEqual(await listPushupAttempts(source))
    const bad = await createBackup(target)
    bad.data.pullupAttempts[0].reps = -1
    await expect(stageImport(new Blob([JSON.stringify(bad)]), target)).rejects.toThrow('Invalid repetition attempt')
    expect(await listRepAttempts('pullups', target)).toEqual(attempts)
  } finally { vi.useRealTimers(); await source.delete(); await target.delete() }
})
