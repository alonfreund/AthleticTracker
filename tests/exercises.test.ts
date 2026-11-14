import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { createCustomExercise, filterExercises, initializeExerciseLibrary, listExercises, loadExerciseBrowseData, type ExerciseInput } from '../src/data/repositories/exercises'
import { BUILTIN_EXERCISES, STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { createBackup, parseBackup, restoreBackup, serializeBackup } from '../src/data/backup/backup'
import type { Tracking } from '../src/domain/strength/models'
import { setFavourite } from '../src/data/repositories/preferences'
import { addWorkoutExercise, cancelWorkout, commitSet, finishWorkout, startWorkout } from '../src/data/repositories/workouts'
import fixture from './fixtures/backup-v2-strength-0.2.0.json'

const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) { const value = new AthleticDatabase(name); databases.push(value); return value }
const input = (): ExerciseInput => ({
  name: 'My weighted hold', primaryMuscleGroupIds: ['core'], secondaryMuscleGroupIds: ['shoulders'], equipmentIds: ['mat'],
  category: 'isometric', instructions: 'Hold a stable position.\nRecord seconds.', notes: 'My personal notes',
  tracking: { measurement: 'duration', load: 'added', weightConvention: 'total' }, defaultRestSeconds: 75,
})
afterEach(async () => { vi.useRealTimers(); vi.restoreAllMocks(); for (const value of databases.splice(0)) await value.delete() })

describe('starter library and preservation', () => {
  it('seeds once, preserving imported rows, user changes, archive state and historical snapshots', async () => {
    const value = database()
    await restoreBackup(fixture, value)
    const custom = await createCustomExercise(input(), value)
    await initializeExerciseLibrary(value)
    const bundled = structuredClone(STARTER_EXERCISES[0]); bundled.notes = 'Existing note'; bundled.archived = true
    await value.exercises.put(bundled)
    await initializeExerciseLibrary(value)
    expect(await value.exercises.count()).toBe(BUILTIN_EXERCISES.length + fixture.data.exercises.length + 1)
    expect(await value.exercises.get(custom.id)).toEqual(custom)
    expect(await value.exercises.get(bundled.id)).toEqual(bundled)
    expect(await value.sessionExercises.toArray()).toEqual(fixture.data.sessionExercises)
  })
  it('serializes simultaneous initializations without duplicate starter entries', async () => {
    const value = database()
    await Promise.all([initializeExerciseLibrary(value), initializeExerciseLibrary(value)])
    expect(await value.exercises.count()).toBe(BUILTIN_EXERCISES.length)
  })
})

describe('exercise search', () => {
  it('matches case-insensitive multiword name, muscle, equipment and category searches', () => {
    const rows = structuredClone([...STARTER_EXERCISES])
    expect(filterExercises(rows, { query: '  BENCH barbell chest  ' }).map(row => row.name)).toEqual(['Barbell bench press'])
    expect(filterExercises(rows, { query: 'forearms dumbbells' }).map(row => row.name)).toEqual(['Dumbbell curl'])
    expect(filterExercises(rows, { query: 'isometric' }).map(row => row.name)).toEqual(['Plank'])
    expect(filterExercises(rows, { query: 'no-such-exercise' })).toEqual([])
  })
  it('combines source, muscle and equipment filters and excludes archived rows', () => {
    const rows = structuredClone([...STARTER_EXERCISES])
    rows[0].archived = true
    expect(filterExercises(rows, { query: 'bench' })).toEqual([])
    expect(filterExercises(rows, { origin: 'custom' })).toEqual([])
    expect(filterExercises(rows, { muscle: 'triceps', equipment: 'dumbbells', origin: 'bundled' }).map(row => row.name)).toEqual(['Dumbbell shoulder press'])
  })
  it('finds custom names with accents and unknown equipment labels', async () => {
    const value = database()
    const exercise = await createCustomExercise({ ...input(), name: 'Élévation hold', equipmentIds: ['home-pulley'] }, value)
    expect(filterExercises(await listExercises(value), { query: 'elevation home pulley', origin: 'custom' })).toEqual([exercise])
  })
})

describe('custom creation and backup', () => {
  it.each([
    ['external reps', { measurement: 'reps', load: 'external', weightConvention: 'per-hand' }],
    ['bodyweight reps', { measurement: 'reps', load: 'bodyweight', weightConvention: null }],
    ['added weight reps', { measurement: 'reps', load: 'added', weightConvention: 'total' }],
    ['assisted reps', { measurement: 'reps', load: 'assisted', weightConvention: 'machine-display' }],
    ['timed hold', { measurement: 'duration', load: 'none', weightConvention: null }],
    ['weighted hold', { measurement: 'duration', load: 'added', weightConvention: 'total' }],
  ] as [string, Tracking][])('saves %s with complete details and survives reopening/export/restore', async (_name, tracking) => {
    const value = database()
    await verifyLocalStorage(value)
    const data = input(); data.tracking = tracking
    const exercise = await createCustomExercise(data, value)
    expect(exercise).toMatchObject({ ...data, defaultRestSeconds: null, origin: 'custom', revision: 1, archived: false })
    expect((await value.exercisePreferences.get(exercise.id))?.restSeconds).toBe(data.defaultRestSeconds)
    expect(exercise.id).toMatch(/^[0-9a-f-]{36}$/)
    value.close()
    const reopened = database(value.name)
    expect(await reopened.exercises.get(exercise.id)).toEqual(exercise)
    const target = database()
    await restoreBackup(parseBackup(serializeBackup(await createBackup(reopened))), target)
    expect(await target.exercises.get(exercise.id)).toEqual(exercise)
  })
  it('rejects missing muscles, overlaps and invalid tracking without writing', async () => {
    const value = database()
    await expect(createCustomExercise({ ...input(), primaryMuscleGroupIds: [] }, value)).rejects.toThrow('primary')
    await expect(createCustomExercise({ ...input(), secondaryMuscleGroupIds: ['core'] }, value)).rejects.toThrow('overlap')
    await expect(createCustomExercise({ ...input(), tracking: { measurement: 'reps', load: 'bodyweight', weightConvention: 'total' } }, value)).rejects.toThrow('convention')
    await expect(createCustomExercise({ ...input(), defaultRestSeconds: -5 }, value)).rejects.toThrow()
    await expect(createCustomExercise({ ...input(), name: '   ' }, value)).rejects.toThrow()
    expect(await value.exercises.count()).toBe(0)
  })
  it('returns a write error without modifying existing exercise data', async () => {
    const value = database()
    const existing = await createCustomExercise(input(), value)
    vi.spyOn(value.exercises, 'add').mockRejectedValueOnce(new Error('Storage full'))
    await expect(createCustomExercise(input(), value)).rejects.toThrow('Storage full')
    expect(await listExercises(value)).toEqual([existing])
  })
})

it('combines alias search with muscle, equipment, type, movement pattern and favourite filters', () => {
  const target = BUILTIN_EXERCISES.find(row => row.name === 'Weighted neutral-grip pull-up')!
  const browse = { favourites: new Set([target.id]), lastUsed: new Map() }
  const filters = {
    query: 'weighted parallel-grip pull-up', muscle: 'back', equipment: 'neutral-pull-up-bar',
    exerciseType: 'compound', movementPattern: 'vertical-pull', favouritesOnly: true,
  }
  expect(filterExercises(BUILTIN_EXERCISES, filters, browse)).toEqual([target])
  expect(filterExercises(BUILTIN_EXERCISES, { ...filters, movementPattern: 'horizontal-pull' }, browse)).toEqual([])
  expect(filterExercises(BUILTIN_EXERCISES, { ...filters, origin: 'custom' }, browse)).toEqual([])
  expect(filterExercises(BUILTIN_EXERCISES, { muscle: 'back', equipment: 'cable' })
    .some(row => row.name === 'Neutral-grip lat pulldown')).toBe(true)
})

it('sorts by logged use and saved favourites without counting cancelled workouts or empty sets', async () => {
  const db = database()
  await verifyLocalStorage(db)
  await db.exercises.bulkAdd([...STARTER_EXERCISES])
  const [bench, squat, deadlift] = STARTER_EXERCISES
  await setFavourite(deadlift.id, true, db)

  async function log(session: string, exerciseId: string) {
    const instance = await addWorkoutExercise(session, exerciseId, db)
    const set = await db.strengthSets.where('sessionExerciseId').equals(instance).first()
    await commitSet(session, set!.id, {
      weightUnit: 'kg', values: { weight: '10', reps: '8', bodyweight: '', durationSeconds: '', rpe: '', rir: '' },
    }, true, db)
  }

  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-01T01:00:00.000Z'))
  const finished = await startWorkout(db)
  await log(finished, squat.id)
  await finishWorkout(finished, true, db)
  vi.setSystemTime(new Date('2026-11-03T01:00:00.000Z'))
  const cancelled = await startWorkout(db)
  await log(cancelled, deadlift.id)
  await cancelWorkout(cancelled, db)
  vi.setSystemTime(new Date('2026-11-02T01:00:00.000Z'))
  const active = await startWorkout(db)
  await log(active, bench.id)
  await addWorkoutExercise(active, deadlift.id, db)

  const before = (await createBackup(db)).data
  const browse = await loadExerciseBrowseData(db)
  const rows = [bench, squat, deadlift]
  expect(browse.lastUsed.has(deadlift.id)).toBe(false)
  expect(filterExercises(rows, { sort: 'recent' }, browse)).toEqual([bench, squat, deadlift])
  expect(filterExercises(rows, { sort: 'favourites' }, browse)).toEqual([deadlift, squat, bench])
  expect(filterExercises(rows, { sort: 'az' }, browse)).toEqual([squat, bench, deadlift])
  expect(filterExercises(rows, { sort: 'za' }, browse)).toEqual([deadlift, bench, squat])
  const pickerSearch = { query: 'barbell', sort: 'za' } as const
  expect(filterExercises(rows, pickerSearch, browse, { prioritizeUsed: true })).toEqual([bench, squat, deadlift])
  expect(filterExercises(rows, pickerSearch, browse)).toEqual([deadlift, bench, squat])
  expect(filterExercises(rows, { ...pickerSearch, sort: 'favourites' }, browse, { prioritizeUsed: true })).toEqual([squat, bench, deadlift])
  expect(filterExercises(rows, { sort: 'za' }, browse, { prioritizeUsed: true })).toEqual([deadlift, bench, squat])
  expect((await createBackup(db)).data).toEqual(before)
})
