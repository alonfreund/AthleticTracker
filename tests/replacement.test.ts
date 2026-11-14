import 'fake-indexeddb/auto'
import { afterEach, expect, it, vi } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { saveRoutine, listRoutines } from '../src/data/repositories/routines'
import { addSet, changeSetType, finishWorkout, loadWorkout, moveSupersetExercise, previousPerformance, removeWorkoutExercise, replaceWorkoutExercise, saveInlineSet, saveSetDraft, saveSuperset, startRoutine } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import { replacementPlan } from '../src/domain/strength/replacement'
import { groupProgress, supersetRound, supersetSlots } from '../src/domain/strength/supersets'

const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) {
  const db = new AthleticDatabase(name)
  databases.push(db)
  return db
}
afterEach(async () => {
  vi.restoreAllMocks()
  for (const db of databases.splice(0)) await db.delete()
})

async function setup() {
  const db = database()
  await verifyLocalStorage(db)
  const sources = [STARTER_EXERCISES[0], STARTER_EXERCISES[1], STARTER_EXERCISES[11]]
  await db.exercises.bulkAdd(sources)
  const routineId = await saveRoutine({ title: 'Test routine', notes: '' }, sources.slice(0, 2).map((exercise, position) => ({
    id: crypto.randomUUID(), routineId: '', exerciseId: exercise.id, position, tracking: exercise.tracking,
    sets: Array.from({ length: 3 }, () => ({ setType: 'normal', target: null })),
  })), db)
  const id = await startRoutine(routineId, db)
  const workout = await loadWorkout(id, db)
  const [original, partner] = workout.sessionExercises
  const plan = () => loadWorkout(id, db).then(workout => replacementPlan(workout, original.id)!)
  const swap = async () => replaceWorkoutExercise(id, original.id, sources[2].id, (await plan()).revision, db)
  async function complete(exerciseId: string, index: number) {
    const set = (await loadWorkout(id, db)).strengthSets.filter(set => set.sessionExerciseId === exerciseId)
      .sort((a, b) => a.position - b.position)[index]
    const input = inputFromSet(set)
    if (set.load.mode === 'none') input.values.durationSeconds = '30'
    else { input.values.reps = '8'; input.values.weight = '40' }
    expect((await saveInlineSet(id, set.id, input, true, db)).applied).toBe(true)
  }
  return { db, id, original, partner, sources, plan, swap, complete, routineId }
}

it('replaces a blank exercise in place with the substitute tracking and the original set types', async () => {
  const { db, id, original, partner, plan, swap } = await setup()
  await changeSetType(id, (await plan()).remaining[0].id, 'warm-up', db)
  await changeSetType(id, (await plan()).remaining[2].id, 'drop-set', db)
  const substitute = await swap()
  const workout = await loadWorkout(id, db)
  expect(workout.sessionExercises.map(row => row.id)).toEqual([substitute, partner.id])
  expect(workout.sessionExercises[0].snapshot.tracking.measurement).toBe('duration')
  const sets = workout.strengthSets.filter(set => set.sessionExerciseId === substitute).sort((a, b) => a.position - b.position)
  expect(sets.map(set => set.setType)).toEqual(['warm-up', 'normal', 'drop-set'])
  expect(sets.every(set => !set.completed && set.load.mode === 'none' && set.reps === null && set.durationSeconds === null)).toBe(true)
  expect(await db.sessionExercises.get(original.id)).toBeUndefined()
})

it('keeps completed values and their drafts with the original and discards only the confirmed unfinished rows', async () => {
  const { db, id, original, plan, swap, complete, routineId, sources } = await setup()
  const beforeRoutines = await listRoutines(db)
  await complete(original.id, 0)
  const completed = (await loadWorkout(id, db)).strengthSets.find(set => set.completed)!
  const pending = (await plan()).remaining[0]
  for (const set of [completed, pending]) {
    const draft = inputFromSet(set)
    draft.values.weight = '.'
    await saveSetDraft(id, set.id, draft, db)
  }
  await db.sessionExercises.update(original.id, { notes: 'Original note' })
  expect((await plan()).entered).toBe(1)
  const substitute = await swap()
  const saved = await loadWorkout(id, db)
  expect(saved.strengthSets.filter(set => set.sessionExerciseId === original.id)).toEqual([completed])
  expect(saved.editorDrafts.map(draft => draft.setId)).toEqual([completed.id])
  expect(saved.sessionExercises.find(row => row.id === original.id)?.notes).toBe('Original note')
  expect(saved.restTimers[0]).toMatchObject({ status: 'skipped', sourceSetId: null })
  expect(await listRoutines(db)).toEqual(beforeRoutines)
  await complete(original.id, 0)
  await complete(substitute, 0)
  await finishWorkout(id, true, db)
  const next = await startRoutine(routineId, db)
  const nextOriginal = (await loadWorkout(next, db)).sessionExercises.find(row => row.sourceExerciseId === sources[0].id)!
  expect((await previousPerformance(next, db))[nextOriginal.id].sets.map(set => set.id)).toEqual([completed.id])
})

it('preserves out-of-order superset rounds through replacement, reopening and format 6 restore', async () => {
  const { db, id, original, partner, swap, complete } = await setup()
  const group = await saveSuperset(id, [original.id, partner.id], null, db)
  await complete(original.id, 1)
  await complete(partner.id, 0)
  const substitute = await swap()
  const workout = await loadWorkout(id, db)
  const members = workout.sessionExercises.filter(row => row.supersetGroupId === group)
  expect(supersetSlots(members).map(slot => slot.map(row => row.id))).toEqual([[original.id, substitute], [partner.id]])
  const sets = workout.strengthSets.filter(set => set.sessionExerciseId === substitute).sort((a, b) => a.position - b.position)
  expect(sets.map(set => set.supersetRoundIndex)).toEqual([0, 2])
  expect(supersetRound(workout, sets[0])?.entries.map(entry => entry.set.completed)).toEqual([false, true])
  expect(groupProgress(workout, members)).toMatchObject({ round: 1, participants: 2, next: { id: substitute } })
  await complete(substitute, 0)
  const after = await loadWorkout(id, db)
  expect(after.restTimers[0].sourceSetId).toBe(sets[0].id)
  expect(supersetRound(after, after.strengthSets.find(set => set.id === sets[0].id)!)?.complete).toBe(true)
  db.close()
  const reopened = database(db.name)
  expect(await loadWorkout(id, reopened)).toEqual(after)
  const { blob } = await exportBackupFile(reopened)
  const target = database()
  await verifyLocalStorage(target)
  const incoming = await stageImport(blob, target)
  expect(incoming.header.formatVersion).toBe(19)
  await restoreStagedBackup(incoming, await stageSnapshot(target), target)
  expect(await loadWorkout(id, target)).toEqual(after)
  expect(await listRoutines(target)).toEqual(await listRoutines(reopened))
})

it('keeps linked members together on reorder and clears their round assignments when the group dissolves', async () => {
  const { db, id, original, partner, swap, complete } = await setup()
  const group = await saveSuperset(id, [original.id, partner.id], null, db)
  await complete(original.id, 0)
  const substitute = await swap()
  await moveSupersetExercise(id, group, substitute, 1, db)
  expect((await loadWorkout(id, db)).sessionExercises.map(row => row.id)).toEqual([partner.id, original.id, substitute])
  const extra = await addSet(id, substitute, db)
  expect((await db.strengthSets.get(extra))?.supersetRoundIndex).toBe(3)
  await changeSetType(id, extra, 'warm-up', db)
  expect((await db.strengthSets.get(extra))?.supersetRoundIndex).toBeUndefined()
  await removeWorkoutExercise(id, partner.id, db)
  const workout = await loadWorkout(id, db)
  expect(workout.supersetGroups).toEqual([])
  expect(workout.strengthSets.every(set => set.supersetRoundIndex === undefined)).toBe(true)
  expect(workout.sessionExercises.every(row => row.supersetSlotId === undefined)).toBe(true)
})

it('rejects stale confirmation and rolls back a failed write without losing rows', async () => {
  const { db, id, original, sources, plan, swap } = await setup()
  const preview = await plan()
  await addSet(id, original.id, db)
  await expect(replaceWorkoutExercise(id, original.id, sources[2].id, preview.revision, db)).rejects.toThrow('changed')
  const before = await loadWorkout(id, db)
  vi.spyOn(db.strengthSets, 'bulkPut').mockRejectedValueOnce(new Error('Disk full'))
  await expect(swap()).rejects.toThrow('Disk full')
  expect(await loadWorkout(id, db)).toEqual(before)
})

it('rejects duplicate rounds and prevents importing replacement metadata as an older format', async () => {
  const { db, id, original, partner, swap, complete } = await setup()
  await saveSuperset(id, [original.id, partner.id], null, db)
  await complete(original.id, 0)
  const substitute = await swap()
  const backup = await createBackup(db)
  backup.data.strengthSets.find(set => set.sessionExerciseId === substitute)!.supersetRoundIndex = 0
  expect(() => validateBackup(backup)).toThrow('duplicate round')
  await expect(stageImport(new Blob([JSON.stringify(backup)]), db)).rejects.toThrow()
  const current = await createBackup(db)
  const { cardioDetails: _details, cardioDrafts: _drafts, cardioTiming: _timing, cardioLive: _live, challenges: _challenges, challengeAttempts: _challengeAttempts, frontLeverAttempts: _frontLever, handstandAttempts: _handstand, plancheAttempts: _planche, muscleupAttempts: _muscleups, pullupAttempts: _pullups, pushupAttempts: _attempts, ...legacyData } = current.data
  const legacy = { ...current, data: legacyData, formatVersion: 5 }
  expect(() => validateBackup(legacy)).toThrow('format 6')
  await expect(stageImport(new Blob([JSON.stringify(legacy)]), db)).rejects.toThrow('format 6')
})
