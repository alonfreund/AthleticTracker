import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, expect, it, vi } from 'vitest'
import { createBackup, restoreBackup, validateBackup } from '../src/data/backup/backup'
import { exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { initializeExerciseLibrary } from '../src/data/repositories/exercises'
import { saveGlobalRest } from '../src/data/repositories/preferences'
import { deleteRoutine, listRoutines, saveRoutine } from '../src/data/repositories/routines'
import { finishWorkout, loadWorkout, saveInlineSet, startRoutine, startWorkout, timerSeconds } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import type { RoutineExercise } from '../src/domain/strength/routines'
import previous from './fixtures/backup-v3-rest-0.7.0.json'

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
  await initializeExerciseLibrary(db)
  const bench = STARTER_EXERCISES[0]
  const hold = (await db.exercises.toArray()).find(exercise => exercise.tracking.measurement === 'duration' && exercise.tracking.load === 'bodyweight')!
  const row = (exercise: typeof bench, sets: RoutineExercise['sets']): RoutineExercise => ({
    id: crypto.randomUUID(), routineId: '', position: 0, exerciseId: exercise.id, tracking: exercise.tracking, sets,
  })
  const exercises = [
    row(bench, [
      { setType: 'warm-up', target: null },
      { setType: 'normal', target: { reps: { min: 8, max: 10 }, load: { mode: 'external', weight: { value: 40, unit: 'kg' } }, durationSeconds: null, rir: null, rpe: null } },
    ]),
    row(hold, [{ setType: 'normal', target: { reps: null, load: null, durationSeconds: { min: 30, max: 40 }, rpe: null, rir: null } }]),
  ]
  const id = await saveRoutine({ title: 'Strength A', notes: 'Brace first' }, exercises, db)
  return { db, id, exercises, bench, hold }
}

it('reopens a routine and starts it with ordered, unchecked sets without copying legacy targets', async () => {
  const { db, id, exercises, bench, hold } = await setup()
  await saveGlobalRest(43, db)
  db.close()
  const reopened = database(db.name)
  const [routine] = await listRoutines(reopened)
  expect(routine.exercises.map(row => row.exerciseId)).toEqual([bench.id, hold.id])
  const sessionId = await startRoutine(id, reopened)
  reopened.close()
  const recovered = database(db.name)
  const workout = await loadWorkout(sessionId, recovered)
  expect(workout.sessions[0]).toMatchObject({ title: 'Strength A', notes: 'Brace first', status: 'active' })
  expect(workout.sessionExercises.map(row => [row.sourceExerciseId, row.restSeconds])).toEqual([[bench.id, 43], [hold.id, 43]])
  const sets = workout.sessionExercises.flatMap(exercise => workout.strengthSets.filter(set => set.sessionExerciseId === exercise.id).sort((a, b) => a.position - b.position))
  expect(sets.map(set => set.setType)).toEqual(exercises.flatMap(row => row.sets.map(set => set.setType)))
  expect(sets.every(set => set.target === null)).toBe(true)
  expect(sets.every(set => !set.completed && set.reps === null && set.durationSeconds === null)).toBe(true)
  expect(sets[1].load).toEqual({ mode: 'external', weight: null })
  expect(workout.restTimers).toEqual([])
  const input = inputFromSet(sets[1])
  input.values.weight = '42.5'; input.values.reps = '8'
  expect((await saveInlineSet(sessionId, sets[1].id, input, true, recovered)).applied).toBe(true)
  const running = (await loadWorkout(sessionId, recovered)).restTimers[0]
  expect(timerSeconds(running, Date.parse(running.updatedAt))).toBe(43)
  await finishWorkout(sessionId, true, recovered)
  const finished = await loadWorkout(sessionId, recovered)
  await saveRoutine({ id, title: 'Edited', notes: '' }, [...routine.exercises].reverse(), recovered)
  expect((await listRoutines(recovered))[0].exercises.map(row => row.exerciseId)).toEqual([hold.id, bench.id])
  await deleteRoutine(id, recovered)
  expect(await listRoutines(recovered)).toEqual([])
  expect(await loadWorkout(sessionId, recovered)).toEqual(finished)
})

it('rejects duplicate starts and protects a pre-existing active workout', async () => {
  const { db, id } = await setup()
  const blank = await startWorkout(db)
  const before = await loadWorkout(blank, db)
  await expect(startRoutine(id, db)).rejects.toThrow('active workout')
  expect(await loadWorkout(blank, db)).toEqual(before)
  await db.sessions.delete(blank)
  await db.sessionActivities.where('sessionId').equals(blank).delete()
  const result = await Promise.allSettled([startRoutine(id, db), startRoutine(id, db)])
  expect(result.map(row => row.status).sort()).toEqual(['fulfilled', 'rejected'])
  expect(await db.sessions.count()).toBe(1)
})

it('rejects stale tracking and rolls back a failed set write', async () => {
  const { db, id, bench } = await setup()
  await db.exercises.update(bench.id, { archived: true })
  await expect(startRoutine(id, db)).rejects.toThrow('routine editor')
  await db.exercises.update(bench.id, { archived: false, tracking: { ...bench.tracking, measurement: 'duration' } })
  await expect(startRoutine(id, db)).rejects.toThrow('routine editor')
  await db.exercises.update(bench.id, { tracking: bench.tracking })
  vi.spyOn(db.strengthSets, 'bulkAdd').mockRejectedValueOnce(new Error('Disk full'))
  await expect(startRoutine(id, db)).rejects.toThrow('Disk full')
  for (const table of [db.sessions, db.sessionActivities, db.sessionExercises, db.strengthSets]) expect(await table.count()).toBe(0)
  expect(await listRoutines(db)).toHaveLength(1)
})

it('restores routines together with an active session and raw set draft', async () => {
  const { db, id } = await setup()
  const sessionId = await startRoutine(id, db)
  const set = (await loadWorkout(sessionId, db)).strengthSets.find(row => row.load.mode === 'external')!
  const input = inputFromSet(set)
  input.values.reps = '.'
  expect((await saveInlineSet(sessionId, set.id, input, undefined, db)).applied).toBe(false)
  const { blob } = await exportBackupFile(db)
  const backup = JSON.parse(await blob.text())
  expect(backup.formatVersion).toBe(15)
  const restored = database()
  await verifyLocalStorage(restored)
  const incoming = await stageImport(blob, restored)
  expect(incoming.counts.routines).toBe(1)
  const safety = await stageSnapshot(restored)
  await restoreStagedBackup(incoming, safety, restored)
  expect((await createBackup(restored)).data).toEqual((await createBackup(db)).data)
  expect((await loadWorkout(sessionId, restored)).editorDrafts[0].values.reps).toBe('.')
})

it('rejects invalid targets, orphan routine rows and duplicate positions before restore', async () => {
  const { db, id, exercises } = await setup()
  const before = await createBackup(db)
  exercises[1].sets[0].target!.reps = { min: 5, max: 10 }
  await expect(saveRoutine({ id, title: 'Invalid', notes: '' }, exercises, db)).rejects.toThrow('timed hold')
  const orphan = structuredClone(before)
  orphan.data.routineExercises[0].routineId = crypto.randomUUID()
  const duplicate = structuredClone(before)
  duplicate.data.routineExercises[0].position = duplicate.data.routineExercises[1].position
  for (const invalid of [orphan, duplicate]) {
    expect(() => validateBackup(invalid)).toThrow()
    await expect(stageImport(new Blob([JSON.stringify(invalid)]), db)).rejects.toThrow()
  }
  expect((await createBackup(db)).data).toEqual(before.data)
})

it('adds routine tables to schema 5 without changing saved workout rows or preferences', async () => {
  const source = database()
  await restoreBackup(previous, source)
  const backup = await createBackup(source)
  const name = crypto.randomUUID()
  const old = new Dexie(name)
  const schema = Object.fromEntries(source.tables.filter(table => !['routines', 'routineExercises'].includes(table.name))
    .map(table => [table.name, [table.schema.primKey.src, ...table.schema.indexes.map(index => index.src)].join(',')]))
  old.version(5).stores(schema)
  for (const [table, rows] of Object.entries(backup.data)) {
    if (table in schema) await old.table(table).bulkAdd(rows)
  }
  old.close()
  const upgraded = database(name)
  await upgraded.open()
  expect(upgraded.verno).toBe(14)
  expect((await createBackup(upgraded)).data).toEqual(backup.data)
})
