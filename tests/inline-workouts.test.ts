import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { initializeExerciseLibrary } from '../src/data/repositories/exercises'
import { addSet, addWorkoutExercise, cancelWorkout, changeSetType, controlRest, finishWorkout, loadWorkout, previousPerformance, saveInlineSet, setExerciseRest, startWorkout, timerSeconds } from '../src/data/repositories/workouts'
import { createBackup, parseBackup, restoreBackup, serializeBackup } from '../src/data/backup/backup'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet, type SetInput } from '../src/domain/strength/logging'
import { InlineSetStore } from '../src/features/workouts/InlineSetStore'
const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) { const db = new AthleticDatabase(name); databases.push(db); return db }
async function setup() {
  const db = database(); await verifyLocalStorage(db); await initializeExerciseLibrary(db)
  const id = await startWorkout(db); const exerciseId = await addWorkoutExercise(id, STARTER_EXERCISES[0].id, db)
  const set = (await loadWorkout(id, db)).strengthSets[0]
  const input = inputFromSet(set); input.values.weight = '60'; input.values.reps = '8'
  return { db, id, exerciseId, set, input }
}
afterEach(async () => { vi.useRealTimers(); vi.restoreAllMocks(); for (const db of databases.splice(0)) await db.delete() })
describe('inline persistence and timers', () => {
  it('keeps invalid text and last valid completed measurements through reopening and backup restore', async () => {
    const { db, id, set, input } = await setup()
    await saveInlineSet(id, set.id, input, true, db)
    input.values.reps = '.'
    expect((await saveInlineSet(id, set.id, input, undefined, db)).applied).toBe(false)
    db.close(); const reopened = database(db.name)
    const saved = await loadWorkout(id, reopened)
    expect(saved.strengthSets[0]).toMatchObject({ completed: true, reps: 8 })
    expect(saved.editorDrafts[0].values.reps).toBe('.')
    const restored = database(); await restoreBackup(parseBackup(serializeBackup(await createBackup(reopened))), restored)
    expect(await loadWorkout(id, restored)).toEqual(saved)
    await expect(finishWorkout(id, true, restored)).rejects.toThrow('pending set edits')
    input.values.reps = '9'; await saveInlineSet(id, set.id, input, undefined, restored)
    expect((await loadWorkout(id, restored)).editorDrafts).toEqual([])
    expect((await loadWorkout(id, restored)).strengthSets[0]).toMatchObject({ completed: true, reps: 9 })
  })
  it('completes atomically with rest, never restarts on corrections, and stops on unchecking', async () => {
    const { db, id, exerciseId, set, input } = await setup()
    await setExerciseRest(id, exerciseId, 90, db)
    await saveInlineSet(id, set.id, input, true, db)
    const timer = (await loadWorkout(id, db)).restTimers[0]
    expect(timer).toMatchObject({ status: 'running', sourceSetId: set.id, remainingSeconds: null })
    expect(timerSeconds(timer, Date.parse(timer.updatedAt))).toBe(90)
    input.values.reps = '10'; await saveInlineSet(id, set.id, input, undefined, db)
    expect((await loadWorkout(id, db)).restTimers[0]).toEqual(timer)
    await saveInlineSet(id, set.id, input, false, db)
    expect((await loadWorkout(id, db)).restTimers[0]).toMatchObject({ status: 'skipped', sourceSetId: null })
    expect((await loadWorkout(id, db)).strengthSets[0]).toMatchObject({ completed: false, reps: 10 })
  })
  it('rolls back completion and its timer if the timer write fails', async () => {
    const { db, id, exerciseId, set, input } = await setup()
    await setExerciseRest(id, exerciseId, 90, db)
    const before = (await createBackup(db)).data
    vi.spyOn(db.restTimers, 'bulkPut').mockRejectedValueOnce(new Error('Storage full'))
    await expect(saveInlineSet(id, set.id, input, true, db)).rejects.toThrow('Storage full')
    expect((await createBackup(db)).data).toEqual(before)
  })
  it('does not complete invalid input or start rest, but preserves the attempted values', async () => {
    const { db, id, exerciseId, set, input } = await setup(); await setExerciseRest(id, exerciseId, 60, db)
    input.values.weight = ''
    expect((await saveInlineSet(id, set.id, input, true, db)).applied).toBe(false)
    const saved = await loadWorkout(id, db)
    expect(saved.strengthSets[0].completed).toBe(false); expect(saved.restTimers).toEqual([])
    expect(saved.editorDrafts[0].values.weight).toBe('')
  })
  it('uses snapshot defaults, allows rest off and replaces the one timer on a new completion', async () => {
    const { db, id, exerciseId, set, input } = await setup()
    const exercise = (await loadWorkout(id, db)).sessionExercises[0]
    await db.sessionExercises.update(exerciseId, { restSeconds: null, snapshot: { ...exercise.snapshot, defaultRestSeconds: 120 } })
    await saveInlineSet(id, set.id, input, true, db)
    expect(timerSeconds((await loadWorkout(id, db)).restTimers[0])).toBe(120)
    const next = await addSet(id, exerciseId, db); await setExerciseRest(id, exerciseId, 0, db)
    await saveInlineSet(id, next, input, true, db)
    const timers = (await loadWorkout(id, db)).restTimers
    expect(timers).toHaveLength(1); expect(timers[0]).toMatchObject({ sourceSetId: next, status: 'skipped' })
  })
  it('persists pause, adjustment, resume, expiry and skip, including backup restore', async () => {
    const { db, id, exerciseId, set, input } = await setup()
    await setExerciseRest(id, exerciseId, 90, db); await saveInlineSet(id, set.id, input, true, db)
    await controlRest(id, 'pause', 0, db)
    const paused = (await loadWorkout(id, db)).restTimers[0]
    expect(paused.status).toBe('paused'); expect(timerSeconds(paused, Date.now()+999999)).toBe(paused.remainingSeconds)
    await controlRest(id, 'adjust', 15, db)
    expect((await loadWorkout(id, db)).restTimers[0].remainingSeconds).toBe(paused.remainingSeconds!+15)
    const restored = database(); await restoreBackup(await createBackup(db), restored)
    await controlRest(id, 'resume', 0, restored)
    expect((await loadWorkout(id, restored)).restTimers[0].status).toBe('running')
    await controlRest(id, 'adjust', -999, restored)
    expect((await loadWorkout(id, restored)).restTimers[0]).toMatchObject({ status: 'finished', remainingSeconds: 0 })
    await expect(createBackup(restored)).resolves.toBeDefined()
  })
})
describe('previous performance', () => {
  it('uses compatible finished exercises, ignores cancelled/incomplete data and keeps set types', async () => {
    const { db, id, exerciseId, set, input } = await setup()
    await changeSetType(id, set.id, 'warm-up', db); await saveInlineSet(id, set.id, input, true, db)
    const second = await addSet(id, exerciseId, db); input.values.reps = '6'; await saveInlineSet(id, second, input, true, db)
    await addSet(id, exerciseId, db); await finishWorkout(id, true, db)
    const cancelled = await startWorkout(db); await addWorkoutExercise(cancelled, STARTER_EXERCISES[0].id, db); await cancelWorkout(cancelled, db)
    const next = await startWorkout(db); const currentExercise = await addWorkoutExercise(next, STARTER_EXERCISES[0].id, db)
    const prior = (await previousPerformance(next, db))[currentExercise]
    expect(prior.sets.map(set => [set.setType, set.reps])).toEqual([['warm-up',8],['normal',6]])
    const exercise = (await loadWorkout(next, db)).sessionExercises[0]
    await db.sessionExercises.update(currentExercise, { snapshot: { ...exercise.snapshot, tracking: { ...exercise.snapshot.tracking, load: 'added' } } })
    expect((await previousPerformance(next, db))[currentExercise]).toBeUndefined()
  })
})
describe('inline write coordinator', () => {
  it('flushes latest keystrokes and serializes blur, completion and later edits', async () => {
    const { db, id, set, input } = await setup()
    const store = new InlineSetStore(await loadWorkout(id, db), (setId, value, complete) => saveInlineSet(id, setId, value, complete, db))
    store.change(set.id, input); const blur = store.save(set.id); const complete = store.save(set.id, true)
    const next: SetInput = structuredClone(input); next.values.reps = '12'; store.change(set.id, next)
    await store.flush(); await Promise.all([blur,complete])
    expect((await loadWorkout(id, db)).strengthSets[0]).toMatchObject({ reps: 12, completed: true })
    expect(store.getSnapshot()).toMatchObject({ dirty: false, saving: false })
    store.dispose()
  })
  it('preserves dirty input after storage failure, retries and recovers multiple raw drafts', async () => {
    const { db, id, exerciseId, set, input } = await setup(); const next = await addSet(id, exerciseId, db)
    let fail = true
    const store = new InlineSetStore(await loadWorkout(id, db), async (setId, value, complete) => {
      if (fail) throw new Error('Storage full'); return saveInlineSet(id, setId, value, complete, db)
    })
    input.values.weight = '.'; store.change(set.id, input)
    await expect(store.flush()).rejects.toThrow('Storage full')
    expect(store.getSnapshot().dirty).toBe(true)
    fail = false; store.change(next, input); await store.flush()
    expect(store.getSnapshot().dirty).toBe(false)
    const recovered = new InlineSetStore(await loadWorkout(id, db), async () => ({ applied:false,error:'' }))
    expect(recovered.getSnapshot().rows[set.id].input.values.weight).toBe('.')
    expect(recovered.getSnapshot().rows[next].pending).toBe(true)
    store.dispose(); recovered.dispose()
  })
})
