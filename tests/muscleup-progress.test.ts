import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { listMuscleupAttempts, muscleupRequirements, recordMuscleupAttempt } from '../src/data/repositories/muscleups'
import { deleteRepAttempt, listRepAttempts, recordRepAttempt } from '../src/data/repositories/repAttempts'
import { attemptProgress } from '../src/domain/calisthenics/pushups'

it('tracks requirements independently, shares pull-ups, and restores the final goal with the requirements', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    await recordRepAttempt('pullups', 15, 'Shared attempt', source)
    await recordMuscleupAttempt('hanging-l-sit', 9, 'Timed hold', source)
    await recordMuscleupAttempt('straight-bar-dips', 15, '', source)
    await recordMuscleupAttempt('toes-to-bar', 10, '', source)
    expect((await muscleupRequirements(source)).map(({ movement, best, met }) => [movement, best, met])).toEqual([
      ['pullups', 15, true], ['hanging-l-sit', 9, false], ['straight-bar-dips', 15, true], ['toes-to-bar', 10, true],
    ])
    await recordMuscleupAttempt('hanging-l-sit', 15, '', source)
    expect((await muscleupRequirements(source)).every(row => row.met)).toBe(true)
    await recordMuscleupAttempt('muscleups', 3, 'Goal reached', source)
    const backup = await exportBackupFile(source)
    const incoming = await stageImport(backup.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    expect((await muscleupRequirements(target)).every(row => row.met)).toBe(true)
    const final = await listMuscleupAttempts('muscleups', target)
    expect(final).toMatchObject([{ value: 3, notes: 'Goal reached' }])
    expect(attemptProgress(final, row => row.value, [3])).toMatchObject({ best: 3, next: undefined })
    const saved = await createBackup(target)
    const { frontLeverAttempts: _frontLever, handstandAttempts: _handstand, plancheAttempts: _planche, muscleupAttempts: _attempts, ...legacyData } = saved.data
    expect(validateBackup({ ...saved, formatVersion: 11, data: legacyData }).data)
      .toMatchObject({ muscleupAttempts: [], plancheAttempts: [], handstandAttempts: [], frontLeverAttempts: [], pullupAttempts: legacyData.pullupAttempts })
    const invalid = structuredClone(saved)
    invalid.data.muscleupAttempts[0].value = -1
    await expect(stageImport(new Blob([JSON.stringify(invalid)]), target)).rejects.toThrow('Invalid muscle-up progression attempt')
    const [pullup] = await listRepAttempts('pullups', target)
    expect(pullup.notes).toBe('Shared attempt')
    await deleteRepAttempt('pullups', pullup.id, target)
    expect((await muscleupRequirements(target)).find(row => row.movement === 'pullups')?.met).toBe(false)
    expect(await listMuscleupAttempts('muscleups', target)).toEqual(final)
  } finally {
    await source.delete()
    await target.delete()
  }
})
