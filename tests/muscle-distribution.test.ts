import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readMuscleDistribution } from '../src/data/repositories/analytics'
import { addSet, addWorkoutExercise, changeSetType, deleteFinishedWorkout, editFinishedWorkout, finishWorkout, loadWorkout, saveInlineSet, startWorkout } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import { muscleDateRange, muscleDistribution, muscleRegion } from '../src/domain/strength/muscleDistribution'
import { MUSCLES } from '../src/domain/strength/taxonomy'
import { heatLevel, sideForRegion } from '../src/features/analytics/MuscleBodyMap'

it('counts a working set once, deduplicates related tags, and gives primary precedence per set', () => {
  expect(Object.keys(MUSCLES).filter(tag => !muscleRegion(tag))).toEqual([])
  expect(muscleDistribution([
    { primary: ['shoulders', 'anterior-deltoid', 'chest'], secondary: ['posterior-deltoid', 'triceps'], count: 3 },
    { primary: ['upper-back', 'traps'], secondary: ['rhomboids', 'biceps', 'unknown'], count: 2 },
    { primary: [], secondary: ['glutes'], count: 1 },
  ])).toEqual({
    workingSets: 6, unmappedSets: 3,
    primary: [{ region: 'chest', count: 3 }, { region: 'shoulders', count: 3 }, { region: 'upper-back', count: 2 }],
    secondary: [{ region: 'triceps', count: 3 }, { region: 'biceps', count: 2 }, { region: 'glutes', count: 1 }],
  })
})

it('uses inclusive local days and places every muscle region on the front or back map', () => {
  const today = new Date(2026, 2, 10, 16, 30)
  expect(muscleDateRange(7, today)).toEqual({ from: new Date(2026, 2, 4).toISOString(), before: new Date(2026, 2, 11).toISOString() })
  expect(muscleDateRange('all', today)).toBeUndefined()
  expect(sideForRegion('front', 'hamstrings')).toBe('back')
  expect(sideForRegion('back', 'chest')).toBe('front')
  expect(sideForRegion('back', 'shoulders')).toBe('back')
  expect([0, 1, 2, 3, 4].map(count => heatLevel(count, 4))).toEqual([0, 1, 2, 3, 4])
})

it('reads original cards and updates counts after a date correction, deletion and backup restore', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const now = new Date(2026, 0, 20, 12)
  try {
    vi.setSystemTime(now)
    await verifyLocalStorage(db)
    const source = { ...STARTER_EXERCISES[0], primaryMuscleGroupIds: ['chest'], secondaryMuscleGroupIds: ['triceps'] }
    await db.exercises.add(source)
    const id = await startWorkout(db)
    const original = await addWorkoutExercise(id, source.id, db)
    await db.exercises.update(source.id, { primaryMuscleGroupIds: ['shoulders'], secondaryMuscleGroupIds: ['biceps'] })
    const newer = await addWorkoutExercise(id, source.id, db)
    const warmup = await addSet(id, original, db)
    await changeSetType(id, warmup, 'warm-up', db)
    await addSet(id, newer, db) // Leave this set unfinished.
    const workout = await loadWorkout(id, db)
    for (const row of workout.strengthSets.filter(set => set.position === 0 || set.id === warmup)) {
      const input = inputFromSet(row)
      input.values.weight = '40'
      input.values.reps = '8'
      expect((await saveInlineSet(id, row.id, input, true, db)).applied).toBe(true)
    }
    expect((await readMuscleDistribution(undefined, db)).workingSets).toBe(0)
    await finishWorkout(id, true, db)
    const range = muscleDateRange(7, now)
    const expected = {
      workingSets: 2, unmappedSets: 0,
      primary: [{ region: 'chest', count: 1 }, { region: 'shoulders', count: 1 }],
      secondary: [{ region: 'biceps', count: 1 }, { region: 'triceps', count: 1 }],
    }
    expect(await readMuscleDistribution(range, db)).toEqual(expected)
    const baseline = await loadWorkout(id, db)
    const corrected = await editFinishedWorkout(baseline, {
      title: 'Older workout', notes: '', startedAt: new Date(2026, 0, 1, 12).toISOString(),
      sets: [], removedSetIds: [],
    }, db)
    expect((await readMuscleDistribution(range, db)).workingSets).toBe(0)
    expect(await readMuscleDistribution(undefined, db)).toEqual(expected)
    const backup = await createBackup(db)
    await deleteFinishedWorkout(corrected, db)
    expect((await readMuscleDistribution(undefined, db)).workingSets).toBe(0)
    await restoreBackup(backup, db)
    expect(await readMuscleDistribution(undefined, db)).toEqual(expected)
  } finally {
    vi.useRealTimers()
    await db.delete()
  }
})
