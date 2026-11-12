import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { deletePushupAttempt, listPushupAttempts, recordPushupAttempt } from '../src/data/repositories/pushups'
import { pushupProgress } from '../src/domain/calisthenics/pushups'

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
