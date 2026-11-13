import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { deleteHandstandAttempt, listHandstandAttempts, recordHandstandAttempt } from '../src/data/repositories/handstand'
import { recordPlancheAttempt } from '../src/data/repositories/planche'
import { HANDSTAND_MOVEMENTS, isHandstandMovement } from '../src/domain/calisthenics/handstand'
import { parseMeasurement } from '../src/domain/calisthenics/measurement'
import { attemptProgress } from '../src/domain/calisthenics/pushups'

it('uses fewer positive hand steps for wall walks and longer holds for handstands', () => {
  expect(parseMeasurement('0', 'steps')).toBeUndefined()
  expect(parseMeasurement('4.5', 'steps')).toBeUndefined()
  expect(parseMeasurement('4', 'steps')).toBe(4)
  expect(isHandstandMovement('finger-press-balance')).toBe(false)
  const wallWalk = HANDSTAND_MOVEMENTS['wall-walks']
  const progress = (values: number[]) => attemptProgress(values.map(value => ({ value })), row => row.value, wallWalk.milestones, wallWalk.lowerIsBetter)
  expect(progress([])).toMatchObject({ best: undefined, next: 8 })
  expect(progress([9, 5, 7])).toMatchObject({ latest: 7, best: 5, next: 4 })
  expect(progress([9, 5, 7]).timeline.map(row => row.best)).toEqual([9, 5, 5])
  expect(progress([9, 4]).next).toBeUndefined()
  const handstand = HANDSTAND_MOVEMENTS['freestanding-handstand']
  expect(attemptProgress([{ value: 30 }, { value: 25 }], row => row.value, handstand.milestones))
    .toMatchObject({ latest: 25, best: 30, next: undefined })
})

it('round-trips handstand attempts and older progress and rejects invalid wall walk backups', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    await recordPlancheAttempt('tuck-planche-hold', 12, '', source)
    await recordHandstandAttempt('wall-walks', 6, 'Same starting position', source)
    await recordHandstandAttempt('wall-handstand-hold', 20, '', source)
    await recordHandstandAttempt('freestanding-handstand', 30, '', source)
    vi.setSystemTime(new Date('2026-01-02T09:00:00Z'))
    await recordHandstandAttempt('wall-walks', 9, '', source)
    const walks = await listHandstandAttempts('wall-walks', source)
    const snapshot = await createBackup(source)
    const { challenges: _challenges, challengeAttempts: _challengeAttempts, frontLeverAttempts: _frontLever, handstandAttempts: _handstand, ...legacyData } = snapshot.data
    expect(validateBackup({ ...snapshot, formatVersion: 13, data: legacyData }).data)
      .toMatchObject({ handstandAttempts: [], frontLeverAttempts: [], challenges: [], challengeAttempts: [], plancheAttempts: snapshot.data.plancheAttempts })
    const exported = await exportBackupFile(source)
    await deleteHandstandAttempt(walks[0].id, source)
    expect(await listHandstandAttempts('wall-walks', source)).toEqual([walks[1]])
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    await discardStage(exported.snapshot.id, source)
    expect(await listHandstandAttempts('wall-walks', target)).toEqual(walks)
    expect((await listHandstandAttempts('wall-handstand-hold', target))[0].value).toBe(20)
    expect((await listHandstandAttempts('freestanding-handstand', target))[0].value).toBe(30)
    expect((await createBackup(target)).data.plancheAttempts).toEqual(snapshot.data.plancheAttempts)
    const invalid = structuredClone(snapshot)
    invalid.data.handstandAttempts.find(row => row.movement === 'wall-walks')!.value = 0
    await expect(stageImport(new Blob([JSON.stringify(invalid)]), target)).rejects.toThrow('Invalid handstand attempt')
    expect(await listHandstandAttempts('wall-walks', target)).toEqual(walks)
  } finally {
    vi.useRealTimers()
    await source.delete()
    await target.delete()
  }
})
