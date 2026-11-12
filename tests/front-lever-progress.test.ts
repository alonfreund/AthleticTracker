import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { listFrontLeverAttempts, recordFrontLeverAttempt } from '../src/data/repositories/frontLever'
import { recordHandstandAttempt } from '../src/data/repositories/handstand'
import { FRONT_LEVER_MOVEMENTS, FRONT_LEVER_ORDER } from '../src/domain/calisthenics/frontLever'
import { attemptProgress } from '../src/domain/calisthenics/pushups'

it('tracks exactly the five requested holds with independent milestones', () => {
  expect(FRONT_LEVER_ORDER.map(movement => FRONT_LEVER_MOVEMENTS[movement].milestones)).toEqual([
    [5, 10, 15, 20], [3, 5, 8, 12, 15], [3, 5, 8, 10], [3, 5, 8, 10], [1, 3, 5, 8, 10],
  ])
  expect(FRONT_LEVER_ORDER.every(movement => FRONT_LEVER_MOVEMENTS[movement].unit === 'seconds')).toBe(true)
  const full = FRONT_LEVER_MOVEMENTS['full-front-lever-hold']
  const progress = attemptProgress([8, 12, 7], value => value, full.milestones)
  expect(progress).toMatchObject({ latest: 7, best: 12, next: undefined })
  expect(progress.timeline.map(row => row.best)).toEqual([8, 12, 12])
})

it('restores front lever holds alongside existing progress and rejects invalid measurements', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    await recordHandstandAttempt('wall-walks', 6, '', source)
    await recordFrontLeverAttempt('tuck-front-lever-hold', 15, '', source)
    await recordFrontLeverAttempt('full-front-lever-hold', 8, 'First attempt', source)
    vi.setSystemTime(new Date('2026-01-02T09:00:00Z'))
    await recordFrontLeverAttempt('full-front-lever-hold', 12, '', source)
    const full = await listFrontLeverAttempts('full-front-lever-hold', source)
    const snapshot = await createBackup(source)
    const { frontLeverAttempts: _holds, ...legacyData } = snapshot.data
    expect(validateBackup({ ...snapshot, formatVersion: 14, data: legacyData }).data)
      .toMatchObject({ frontLeverAttempts: [], handstandAttempts: snapshot.data.handstandAttempts })
    const exported = await exportBackupFile(source)
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    await discardStage(exported.snapshot.id, source)
    expect(await listFrontLeverAttempts('full-front-lever-hold', target)).toEqual(full)
    expect((await listFrontLeverAttempts('tuck-front-lever-hold', target))[0].value).toBe(15)
    expect((await createBackup(target)).data.handstandAttempts).toEqual(snapshot.data.handstandAttempts)
    const invalid = structuredClone(snapshot)
    invalid.data.frontLeverAttempts[0].value = 1.5
    await expect(stageImport(new Blob([JSON.stringify(invalid)]), target)).rejects.toThrow('Invalid front lever attempt')
    expect(await listFrontLeverAttempts('full-front-lever-hold', target)).toEqual(full)
  } finally {
    vi.useRealTimers()
    await source.delete()
    await target.delete()
  }
})
