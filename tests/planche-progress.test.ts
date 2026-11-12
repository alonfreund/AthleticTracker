import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { recordMuscleupAttempt } from '../src/data/repositories/muscleups'
import { deletePlancheAttempt, listPlancheAttempts, recordPlancheAttempt } from '../src/data/repositories/planche'
import { parsePlancheValue, PLANCHE_MOVEMENTS, PLANCHE_ORDER } from '../src/domain/calisthenics/planche'
import { attemptProgress } from '../src/domain/calisthenics/pushups'

it('accepts decimal weights and whole reps or seconds beyond the milestones', () => {
  expect(PLANCHE_ORDER).toHaveLength(8)
  expect(parsePlancheValue('12,5', 'kg')).toBe(12.5)
  expect(parsePlancheValue('12.5', 'kg')).toBe(12.5)
  expect(parsePlancheValue('24', 'reps')).toBe(24)
  expect(parsePlancheValue('42', 'seconds')).toBe(42)
  expect(parsePlancheValue('3.5', 'reps')).toBeUndefined()
  expect(parsePlancheValue('-2', 'kg')).toBeUndefined()
  expect(parsePlancheValue('', 'seconds')).toBeUndefined()
})

it('keeps measurements independent and restores Planche and older progression records', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    await recordMuscleupAttempt('hanging-l-sit', 15, '', source)
    await recordPlancheAttempt('straight-arm-dumbbell-flies', 12.5, '5/5/5', source)
    await recordPlancheAttempt('full-planche-raises', 4, '', source)
    await recordPlancheAttempt('reverse-leg-raises', 24, '', source)
    vi.setSystemTime(new Date('2026-01-02T09:00:00Z'))
    await recordPlancheAttempt('straight-arm-dumbbell-flies', 8, '', source)
    await expect(recordPlancheAttempt('tuck-planche-hold', 1.5, '', source)).rejects.toThrow('Invalid planche attempt')
    const flies = await listPlancheAttempts('straight-arm-dumbbell-flies', source)
    const progress = attemptProgress(flies, row => row.value, PLANCHE_MOVEMENTS['straight-arm-dumbbell-flies'].milestones)
    expect(progress).toMatchObject({ latest: 8, best: 12.5, next: undefined })
    expect(progress.timeline.map(row => row.best)).toEqual([12.5, 12.5])

    const snapshot = await createBackup(source)
    const { plancheAttempts: _planche, ...legacyData } = snapshot.data
    expect(validateBackup({ ...snapshot, formatVersion: 12, data: legacyData }).data)
      .toMatchObject({ plancheAttempts: [], muscleupAttempts: snapshot.data.muscleupAttempts })
    const exported = await exportBackupFile(source)
    await deletePlancheAttempt(flies[0].id, source)
    expect(await listPlancheAttempts('straight-arm-dumbbell-flies', source)).toEqual([flies[1]])
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    await discardStage(exported.snapshot.id, source)
    expect(await listPlancheAttempts('straight-arm-dumbbell-flies', target)).toEqual(flies)
    expect((await listPlancheAttempts('full-planche-raises', target))[0].value).toBe(4)
    expect((await createBackup(target)).data.muscleupAttempts).toEqual(snapshot.data.muscleupAttempts)
    const invalid = structuredClone(snapshot)
    invalid.data.plancheAttempts.find(row => row.movement === 'reverse-leg-raises')!.value = 3.5
    await expect(stageImport(new Blob([JSON.stringify(invalid)]), target)).rejects.toThrow('Invalid planche attempt')
    expect(await listPlancheAttempts('straight-arm-dumbbell-flies', target)).toEqual(flies)
  } finally {
    vi.useRealTimers()
    await source.delete()
    await target.delete()
  }
})
