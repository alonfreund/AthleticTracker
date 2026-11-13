import 'fake-indexeddb/auto'
import { afterEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { setFavourite } from '../src/data/repositories/preferences'
import { saveRoutine } from '../src/data/repositories/routines'
import { addSet, addWorkoutExercise, cancelWorkout, deleteActiveWorkout, deleteCancelledWorkout, deleteFinishedWorkout, editFinishedWorkout, finishWorkout, loadWorkout, recentExerciseHistory, saveInlineSet, saveSetDraft, saveSuperset, startWorkout } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import { supersetRound } from '../src/domain/strength/supersets'
import { WorkoutHistory } from '../src/features/workouts/WorkoutHistory'

const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) {
  const db = new AthleticDatabase(name)
  databases.push(db)
  return db
}
afterEach(async () => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  for (const db of databases.splice(0)) await db.delete()
})
const noop = () => {}

async function setup() {
  vi.setSystemTime(new Date('2026-01-06T10:00:00.123Z'))
  const db = database()
  await verifyLocalStorage(db)
  const [source, partner] = STARTER_EXERCISES
  await db.exercises.bulkAdd([source, partner])
  await setFavourite(source.id, true, db)
  await saveRoutine({ title: 'Routine to keep', notes: '' }, [{ id: crypto.randomUUID(), routineId: '', position: 0, exerciseId: source.id, tracking: source.tracking, sets: [{ setType: 'normal', target: null }] }], db)
  const id = await startWorkout(db)
  const a = await addWorkoutExercise(id, source.id, db)
  const b = await addWorkoutExercise(id, partner.id, db)
  await saveSuperset(id, [a, b], null, db)
  const second = await addSet(id, a, db)
  const before = await loadWorkout(id, db)
  const first = before.strengthSets.find(row => row.sessionExerciseId === a && row.id !== second)!
  const other = before.strengthSets.find(row => row.sessionExerciseId === b)!
  for (const [index, set] of [first, other, before.strengthSets.find(row => row.id === second)!].entries()) {
    vi.setSystemTime(new Date(Date.parse('2026-01-06T10:01:00Z') + index * 60000))
    const input = inputFromSet(set)
    input.values.reps = '8'
    input.values.weight = '30'
    expect((await saveInlineSet(id, set.id, input, true, db)).applied).toBe(true)
  }
  vi.setSystemTime(new Date('2026-01-06T10:09:00Z'))
  await finishWorkout(id, false, db)
  return { db, id, a, source, first, second, other, baseline: await loadWorkout(id, db) }
}

it('saves historical corrections, preserves original rounds and duration, and round-trips through backup', async () => {
  const { db, id, a, source, first, second, other, baseline } = await setup()
  const savedSecond = baseline.strengthSets.find(set => set.id === second)!
  const input = inputFromSet(savedSecond)
  input.weightUnit = 'lb'
  input.values.weight = '70'
  input.values.reps = '10'
  const oldStart = baseline.sessions[0].startedAt
  const delta = -86_400_000
  const moved = (value: string) => new Date(Date.parse(value) + delta).toISOString()
  const edited = await editFinishedWorkout(baseline, {
    title: '  Corrected session  ', notes: 'History note', startedAt: moved(oldStart), removedSetIds: [first.id],
    sets: [
      { id: second, exerciseId: a, input, setType: 'back-off', completed: true },
      { exerciseId: a, input, setType: 'normal', completed: true },
    ],
  }, db)
  db.close()
  const reopened = database(db.name)
  const actual = await loadWorkout(id, reopened)
  expect(actual.sessions[0]).toMatchObject({ id, status: 'finished', title: 'Corrected session', notes: 'History note', startedAt: moved(oldStart), endedAt: moved(baseline.sessions[0].endedAt!) })
  expect(actual.sessionExercises.map(row => row.snapshot)).toEqual(baseline.sessionExercises.map(row => row.snapshot))
  expect(actual.supersetGroups).toEqual(baseline.supersetGroups)
  expect(actual.strengthSets.some(set => set.id === first.id)).toBe(false)
  const corrected = actual.strengthSets.find(set => set.id === second)!
  expect(corrected).toMatchObject({ reps: 10, load: { weight: { value: 70, unit: 'lb' } }, completedAt: moved(savedSecond.completedAt!), setType: 'back-off' })
  expect(supersetRound(actual, corrected)?.index).toBe(1)
  expect(supersetRound(actual, actual.strengthSets.find(set => set.id === other.id)!)?.index).toBe(0)
  expect(actual.strengthSets.find(set => set.sessionExerciseId === a && set.id !== second)).toMatchObject({ supersetRoundIndex: 2, completedAt: actual.sessions[0].endedAt })
  expect((await recentExerciseHistory(source.id, reopened))[0]).toMatchObject({ title: 'Corrected session', startedAt: moved(oldStart) })
  await expect(editFinishedWorkout(baseline, { ...baseline.sessions[0], sets: [], removedSetIds: [] }, reopened)).rejects.toThrow('changed')
  const target = database()
  await restoreBackup(await createBackup(reopened), target)
  expect(await loadWorkout(id, target)).toEqual(actual)
  // The immediate post-save view can delete without requiring a reload or set ordering.
  await deleteFinishedWorkout(edited, reopened)
  expect(await recentExerciseHistory(source.id, reopened)).toEqual([])
})

it('rolls back invalid corrections and failed cascading deletes without touching the active draft, routine or preferences', async () => {
  const { db, id, source, a, second, baseline } = await setup()
  const active = await startWorkout(db)
  const card = await addWorkoutExercise(active, source.id, db)
  const activeSet = (await loadWorkout(active, db)).strengthSets.find(row => row.sessionExerciseId === card)!
  const draft = inputFromSet(activeSet); draft.values.weight = '.'
  await saveSetDraft(active, activeSet.id, draft, db)
  const activeBefore = await loadWorkout(active, db)
  const before = (await createBackup(db)).data
  const invalid = inputFromSet(baseline.strengthSets.find(row => row.id === second)!)
  invalid.values.reps = '0'
  await expect(editFinishedWorkout(baseline, { ...baseline.sessions[0], title: 'Should roll back', sets: [{ id: second, exerciseId: a, input: invalid, setType: 'normal', completed: true }], removedSetIds: [] }, db)).rejects.toThrow('missing its performance')
  await expect(deleteFinishedWorkout(activeBefore, db)).rejects.toThrow('Only finished')
  vi.spyOn(db.strengthSets, 'bulkDelete').mockRejectedValueOnce(new Error('Disk error'))
  await expect(deleteFinishedWorkout(baseline, db)).rejects.toThrow('Disk error')
  expect((await createBackup(db)).data).toEqual(before)

  await deleteFinishedWorkout(baseline, db)
  await expect(loadWorkout(id, db)).rejects.toThrow('no longer exists')
  expect(await loadWorkout(active, db)).toEqual(activeBefore)
  const backup = await createBackup(db)
  expect(backup.data.exercises).toEqual(before.exercises)
  expect(backup.data.exercisePreferences).toEqual(before.exercisePreferences)
  expect(backup.data.routines).toEqual(before.routines)
  expect(backup.data.routineExercises).toEqual(before.routineExercises)
  expect(backup.data.supersetGroups).toEqual([])
  expect(backup.data.restTimers).toEqual([])
  expect(backup.data.sessionExercises).toEqual(activeBefore.sessionExercises)
  const restored = database()
  await restoreBackup(backup, restored)
  expect(await loadWorkout(active, restored)).toEqual(activeBefore)
  await expect(loadWorkout(id, restored)).rejects.toThrow('no longer exists')
})

it('exposes deletion for finished and cancelled workouts and editing for finished workouts', async () => {
  const { db, baseline } = await setup()
  const render = (workout: typeof baseline) => renderToStaticMarkup(<WorkoutHistory workout={workout} onBack={noop} onEdit={noop} onDelete={noop} />)
  expect(render(baseline)).toMatch(/Edit workout.*Delete workout/)
  const cancelled = await startWorkout(db)
  await cancelWorkout(cancelled, db)
  const cancelledMarkup = render(await loadWorkout(cancelled, db))
  expect(cancelledMarkup).toContain('Delete workout')
  expect(cancelledMarkup).not.toContain('Edit workout')
})

it('removes active and cancelled workouts with their dependent data', async () => {
  const { db, source } = await setup()
  const before = (await createBackup(db)).data
  const active = await startWorkout(db)
  await addWorkoutExercise(active, source.id, db)
  const activeSet = (await loadWorkout(active, db)).strengthSets[0]
  await saveSetDraft(active, activeSet.id, inputFromSet(activeSet), db)
  await deleteActiveWorkout(active, db)
  await expect(loadWorkout(active, db)).rejects.toThrow('no longer exists')
  const cancelled = await startWorkout(db)
  await addWorkoutExercise(cancelled, source.id, db)
  await cancelWorkout(cancelled, db)
  await deleteCancelledWorkout(await loadWorkout(cancelled, db), db)
  const after = (await createBackup(db)).data
  expect(after).toEqual(before)
})
