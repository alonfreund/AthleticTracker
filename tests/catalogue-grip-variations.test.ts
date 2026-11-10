import 'fake-indexeddb/auto'
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { installCatalogue, validateCatalogue } from '../src/data/catalogue'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { createCustomExercise, filterExercises } from '../src/data/repositories/exercises'
import { setFavourite } from '../src/data/repositories/preferences'
import { addWorkoutExercise, commitSet, finishWorkout, loadWorkout, startWorkout } from '../src/data/repositories/workouts'
import { BUILTIN_EXERCISES, CATALOGUE_BATCHES } from '../src/domain/strength/catalog'
import { GRIP_VARIATIONS } from '../src/domain/strength/catalogue/gripVariations'
import history from './fixtures/backup-v3-rest-0.7.0.json'

const released = CATALOGUE_BATCHES.filter(batch => batch.id !== 'grip-variations')
  .flatMap(batch => [...batch.exercises])

it('adds 15 unique grip variants alongside the exact 432 released definitions', () => {
  const fingerprint = createHash('sha256').update(JSON.stringify(released)).digest('hex')
  expect(fingerprint).toBe('44f1b702afe02895b44276c3d45d8a8596edf15567a5b63f216921a17a55876d')
  expect(released).toHaveLength(432)
  expect(GRIP_VARIATIONS).toHaveLength(15)
  expect(BUILTIN_EXERCISES).toHaveLength(447)
  expect(() => validateCatalogue(BUILTIN_EXERCISES)).not.toThrow()
  for (const exercise of GRIP_VARIATIONS) {
    expect(exercise.id).toMatch(/^ba51c600-0000-4000-8000-\d{12}$/)
    expect(released.some(row => row.metadata?.familyId === exercise.metadata?.familyId)).toBe(true)
  }
  expect(filterExercises(BUILTIN_EXERCISES, { query: 'weighted parallel-grip pull-up' })
    .map(row => row.name)).toContain('Weighted neutral-grip pull-up')
})

it('adds only the new definitions and preserves user data across repeat installs and restore', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const restored = new AthleticDatabase(crypto.randomUUID())
  try {
    await restoreBackup(history, db)
    await installCatalogue(released, db)
    const custom = await createCustomExercise({
      ...released[6], name: GRIP_VARIATIONS[0].name, defaultRestSeconds: 107,
    }, db)
    await setFavourite(custom.id, true, db)
    await setFavourite(released[6].id, true, db)
    const before = (await createBackup(db)).data

    expect(await installCatalogue(undefined, db)).toEqual({ added: 15, updated: 0, preserved: [] })
    expect(await installCatalogue(undefined, db)).toEqual({ added: 0, updated: 0, preserved: [] })
    const backup = await createBackup(db)
    const added = new Set(GRIP_VARIATIONS.map(row => row.id))
    expect({
      ...backup.data,
      exercises: backup.data.exercises.filter(row => !added.has(row.id)),
      catalogueState: backup.data.catalogueState.filter(row => !added.has(row.exerciseId)),
    }).toEqual(before)
    await restoreBackup(backup, restored)
    expect((await createBackup(restored)).data).toEqual(backup.data)
  } finally {
    await db.delete()
    await restored.delete()
  }
})

it('logs every new variant with its prescribed load and retains the exercise snapshots in history', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(db)
    await installCatalogue(undefined, db)
    const session = await startWorkout(db)
    for (const exercise of GRIP_VARIATIONS) {
      const instance = await addWorkoutExercise(session, exercise.id, db)
      const set = await db.strengthSets.where('sessionExerciseId').equals(instance).first()
      expect(set).toBeDefined()
      await commitSet(session, set!.id, {
        weightUnit: 'kg',
        values: {
          weight: exercise.tracking.load === 'bodyweight' ? '' : '10',
          bodyweight: '', reps: '8', durationSeconds: '', rpe: '', rir: '',
        },
      }, true, db)
    }
    await finishWorkout(session, true, db)
    const workout = await loadWorkout(session, db)
    expect(workout.strengthSets).toHaveLength(15)
    expect(workout.strengthSets.every(set => set.completed)).toBe(true)
    expect(workout.sessionExercises.map(row => row.snapshot)).toEqual(GRIP_VARIATIONS)
  } finally {
    await db.delete()
  }
})
