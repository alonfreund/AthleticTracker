import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { initializeExerciseLibrary, createCustomExercise } from '../src/data/repositories/exercises'
import { addSet, addWorkoutExercise, cancelWorkout, changeSetType, commitSet, discardSetDraft, finishWorkout, listWorkouts, loadWorkout, moveWorkoutItem, removeSet, removeWorkoutExercise, saveSetDraft, saveWorkoutDetails, startWorkout } from '../src/data/repositories/workouts'
import { createBackup, parseBackup, restoreBackup, serializeBackup } from '../src/data/backup/backup'
import { convertInputUnit, inputFromSet, performanceText, type SetInput } from '../src/domain/strength/logging'
import type { Tracking } from '../src/domain/strength/models'
import { BUILTIN_EXERCISES, STARTER_EXERCISES } from '../src/domain/strength/catalog'
import fixture from './fixtures/backup-v2-strength-0.2.0.json'

const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) { const value = new AthleticDatabase(name); databases.push(value); return value }
async function setup() {
  const db = database(); await verifyLocalStorage(db); await initializeExerciseLibrary(db)
  const id = await startWorkout(db); const exerciseId = await addWorkoutExercise(id, STARTER_EXERCISES[0].id, db)
  const set = (await loadWorkout(id, db)).strengthSets[0]
  return { db, id, exerciseId, set }
}
function input(): SetInput { return { weightUnit: 'kg', values: { weight: '40', bodyweight: '', reps: '8', durationSeconds: '', rpe: '8.5', rir: '1' } } }
afterEach(async () => { vi.restoreAllMocks(); for (const db of databases.splice(0)) await db.delete() })

describe('core workout lifecycle', () => {
  it('starts atomically, resumes the one existing active session, and preserves prior data', async () => {
    const db = database(); await verifyLocalStorage(db)
    const metadata = await db.metadata.toArray()
    const [first, second] = await Promise.all([startWorkout(db), startWorkout(db)])
    expect(second).toBe(first)
    expect(await db.sessions.count()).toBe(1)
    expect(await db.sessionActivities.count()).toBe(1)
    expect(await db.metadata.toArray()).toEqual(metadata)
    await saveWorkoutDetails(first, 'Upper body', 'A note\nSecond line', db)
    expect((await loadWorkout(first, db)).sessions[0]).toMatchObject({ title: 'Upper body', notes: 'A note\nSecond line', status: 'active' })
  })
  it('adds independent exercise instances and snapshots with a first incomplete set', async () => {
    const { db, id } = await setup()
    await addWorkoutExercise(id, STARTER_EXERCISES[0].id, db)
    const source = await db.exercises.get(STARTER_EXERCISES[0].id)
    await db.exercises.put({ ...source!, name: 'Renamed source', revision: 2 })
    const workout = await loadWorkout(id, db)
    expect(workout.sessionExercises.map(row => row.snapshot.name)).toEqual(['Barbell bench press', 'Barbell bench press'])
    expect(new Set(workout.sessionExercises.map(row => row.id)).size).toBe(2)
    expect(workout.strengthSets.every(row => !row.completed)).toBe(true)
    await expect(createBackup(db)).resolves.toBeDefined()
  })
  it('saves raw partial input and resumes it through a fresh connection and backup restore', async () => {
    const { db, id, set } = await setup()
    const draft = input(); draft.values.weight = '.'; draft.values.reps = ''
    await saveSetDraft(id, set.id, draft, db)
    db.close(); const reopened = database(db.name)
    expect((await loadWorkout(id, reopened)).editorDrafts[0].values.weight).toBe('.')
    const backup = parseBackup(serializeBackup(await createBackup(reopened)))
    const restored = database(); await restoreBackup(backup, restored)
    expect((await loadWorkout(id, restored)).editorDrafts[0]).toMatchObject(draft)
    expect((await loadWorkout(id, restored)).strengthSets[0].completed).toBe(false)
  })
  it('logs values, completes a set, finishes with review, and retains incomplete rows in history', async () => {
    const { db, id, exerciseId, set } = await setup()
    await commitSet(id, set.id, input(), false, db)
    expect((await loadWorkout(id, db)).strengthSets[0].completed).toBe(false)
    await changeSetType(id, set.id, 'back-off', db)
    await commitSet(id, set.id, input(), true, db)
    await addSet(id, exerciseId, db)
    await expect(finishWorkout(id, false, db)).rejects.toThrow('Review unfinished')
    await finishWorkout(id, true, db)
    const history = await loadWorkout(id, db)
    expect(history.sessions[0].status).toBe('finished')
    expect(history.strengthSets.filter(row => row.completed)).toHaveLength(1)
    expect(history.strengthSets).toHaveLength(2)
    expect(history.strengthSets.find(row => row.id === set.id)?.setType).toBe('back-off')
    expect((await listWorkouts(db))[0].endedAt).not.toBeNull()
    await expect(addSet(id, exerciseId, db)).rejects.toThrow('Only active')
    const restored = database(); await restoreBackup(await createBackup(db), restored)
    expect(await loadWorkout(id, restored)).toEqual(history)
  })
  it('requires saved/applied set edits and at least one completed set to finish', async () => {
    const { db, id, set } = await setup()
    await expect(finishWorkout(id, true, db)).rejects.toThrow('at least one')
    await commitSet(id, set.id, input(), true, db)
    await saveSetDraft(id, set.id, input(), db)
    await expect(finishWorkout(id, true, db)).rejects.toThrow('pending set edits')
    await discardSetDraft(id, set.id, db)
    await finishWorkout(id, true, db)
  })
  it('never rewrites another finished workout while a new one is logged', async () => {
    const { db, id, set } = await setup()
    await commitSet(id, set.id, input(), true, db)
    await finishWorkout(id, true, db)
    const original = await loadWorkout(id, db)
    const next = await startWorkout(db)
    await addWorkoutExercise(next, STARTER_EXERCISES[11].id, db)
    await saveWorkoutDetails(next, 'New session', 'New notes', db)
    expect(await loadWorkout(id, db)).toEqual(original)
    expect(await db.exercises.count()).toBe(BUILTIN_EXERCISES.length)
  })
  it('cancels explicitly, preserving recorded data while removing drafts and allowing a new session', async () => {
    const { db, id, set } = await setup()
    await saveSetDraft(id, set.id, input(), db)
    await cancelWorkout(id, db)
    const cancelled = await loadWorkout(id, db)
    expect(cancelled.sessions[0].status).toBe('cancelled')
    expect(cancelled.editorDrafts).toEqual([])
    expect(cancelled.strengthSets).toHaveLength(1)
    expect(await startWorkout(db)).not.toBe(id)
  })
})

describe('all strength tracking modes', () => {
  it.each([
    ['bodyweight reps', { measurement: 'reps', load: 'bodyweight', weightConvention: null }, { weight: '', bodyweight: '80', reps: '12', durationSeconds: '' }],
    ['added reps', { measurement: 'reps', load: 'added', weightConvention: 'total' }, { weight: '10', bodyweight: '', reps: '5', durationSeconds: '' }],
    ['assisted reps', { measurement: 'reps', load: 'assisted', weightConvention: 'machine-display' }, { weight: '40', bodyweight: '80', reps: '6', durationSeconds: '' }],
    ['timed hold', { measurement: 'duration', load: 'none', weightConvention: null }, { weight: '', bodyweight: '', reps: '', durationSeconds: '60' }],
    ['weighted hold', { measurement: 'duration', load: 'added', weightConvention: 'total' }, { weight: '5', bodyweight: '', reps: '', durationSeconds: '30' }],
  ] as [string, Tracking, Partial<SetInput['values']>][])('completes and round-trips %s', async (_name, tracking, values) => {
    const { db, id } = await setup()
    const exercise = await createCustomExercise({ name: _name, primaryMuscleGroupIds: ['core'], secondaryMuscleGroupIds: [], equipmentIds: [], category: 'strength', instructions: '', notes: '', tracking, defaultRestSeconds: null }, db)
    const added = await addWorkoutExercise(id, exercise.id, db)
    const set = (await loadWorkout(id, db)).strengthSets.find(row => row.sessionExerciseId === added)!
    const draft = input(); Object.assign(draft.values, values)
    await commitSet(id, set.id, draft, true, db)
    expect((await loadWorkout(id, db)).strengthSets.find(row => row.id === set.id)?.completed).toBe(true)
    await expect(createBackup(db)).resolves.toBeDefined()
  })
  it.each([
    ['missing reps', { reps: '' }], ['fractional reps', { reps: '1.5' }], ['missing weight', { weight: '' }],
    ['negative load', { weight: '-5' }], ['invalid partial number', { weight: '.' }], ['out-of-range effort', { rpe: '11' }], ['negative RIR', { rir: '-1' }],
  ])('rejects %s without changing saved performance', async (_name, change) => {
    const { db, id, set } = await setup()
    const before = await createBackup(db)
    const draft = input(); Object.assign(draft.values, change)
    await expect(commitSet(id, set.id, draft, true, db)).rejects.toThrow()
    expect((await createBackup(db)).data).toEqual(before.data)
  })
  it('converts entered units rather than relabelling the same number', () => {
    const original = input(); original.values.bodyweight = '80'
    const converted = convertInputUnit(original, 'lb')
    expect(Number(converted.values.weight)).toBeCloseTo(88.18490487, 7)
    expect(Number(converted.values.bodyweight)).toBeCloseTo(176.36980975, 7)
    expect(convertInputUnit(converted, 'kg').values.weight).toBe('40')
    original.values.weight = '.'
    expect(() => convertInputUnit(original, 'lb')).toThrow('valid')
  })
  it('preserves kg/lb mass and optional effort in display/input recovery', async () => {
    const { db, id, set } = await setup()
    const draft = input(); draft.weightUnit = 'lb'
    await commitSet(id, set.id, draft, true, db)
    const saved = (await loadWorkout(id, db)).strengthSets[0]
    expect(inputFromSet(saved)).toEqual(draft)
    expect(performanceText(saved)).toContain('40 lb')
  })
})

describe('atomic workout changes', () => {
  it('reorders exercises and sets, removes data and leaves backup relationships valid', async () => {
    const { db, id, exerciseId, set } = await setup()
    const otherExercise = await addWorkoutExercise(id, STARTER_EXERCISES[11].id, db)
    await moveWorkoutItem(id, 'exercise', otherExercise, -1, db)
    expect((await loadWorkout(id, db)).sessionExercises[0].id).toBe(otherExercise)
    const otherSet = await addSet(id, exerciseId, db)
    await moveWorkoutItem(id, 'set', otherSet, -1, db)
    expect((await loadWorkout(id, db)).strengthSets.find(row => row.id === otherSet)?.position).toBe(0)
    await saveSetDraft(id, set.id, input(), db)
    await removeSet(id, set.id, db)
    expect((await loadWorkout(id, db)).editorDrafts).toEqual([])
    await removeWorkoutExercise(id, exerciseId, db)
    expect((await loadWorkout(id, db)).strengthSets.every(row => row.sessionExerciseId !== exerciseId)).toBe(true)
    await expect(createBackup(db)).resolves.toBeDefined()
  })
  it('keeps imported superset/timer relationships valid when removing an exercise', async () => {
    const db = database(); await restoreBackup(fixture, db)
    const id = fixture.data.sessions[0].id
    await removeWorkoutExercise(id, fixture.data.sessionExercises[0].id, db)
    const saved = await loadWorkout(id, db)
    expect(saved.supersetGroups).toEqual([])
    expect(saved.restTimers[0]).toMatchObject({ status: 'skipped', sourceSetId: null })
    await expect(createBackup(db)).resolves.toBeDefined()
  })
  it('rolls back an entire mutation if a late draft write fails', async () => {
    const { db, id, set } = await setup()
    const before = await createBackup(db)
    vi.spyOn(db.editorDrafts, 'bulkPut').mockRejectedValueOnce(new Error('Storage full'))
    await expect(saveSetDraft(id, set.id, input(), db)).rejects.toThrow('Storage full')
    expect((await createBackup(db)).data).toEqual(before.data)
  })
  it('serializes rapid draft writes so the last requested value is recovered', async () => {
    const { db, id, set } = await setup()
    const first = input(), last = input(); first.values.reps = '1'; last.values.reps = '12'
    await Promise.all([saveSetDraft(id, set.id, first, db), saveSetDraft(id, set.id, last, db)])
    expect((await loadWorkout(id, db)).editorDrafts[0].values.reps).toBe('12')
  })
})
