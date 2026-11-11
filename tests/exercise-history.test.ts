import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { addWorkoutExercise, cancelWorkout, finishWorkout, loadWorkout, recentExerciseHistory, saveInlineSet, startWorkout } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'

it('shows five finished sessions by saved exercise identity, including restored snapshots and repeated cards', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const restored = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(db)
    const [exercise, otherExercise] = STARTER_EXERCISES
    await db.exercises.bulkAdd([exercise, otherExercise])

    async function addCard(workoutId: string, exerciseId: string, reps?: number) {
      const cardId = await addWorkoutExercise(workoutId, exerciseId, db)
      const workout = await loadWorkout(workoutId, db)
      const set = workout.strengthSets.find(row => row.sessionExerciseId === cardId)!
      if (reps !== undefined) {
        const input = inputFromSet(set)
        input.values.reps = String(reps)
        input.values.weight = '30'
        await saveInlineSet(workoutId, set.id, input, true, db)
      }
      return cardId
    }

    const finished: string[] = []
    for (let day = 1; day <= 6; day++) {
      vi.setSystemTime(new Date(Date.UTC(2026, 0, day, 12)))
      const workoutId = await startWorkout(db)
      const card = await addCard(workoutId, exercise.id, day)
      if (day === 6) {
        await addCard(workoutId, exercise.id, 9)
        await addCard(workoutId, exercise.id)
        await db.sessionExercises.update(card, { sourceExerciseId: null })
      }
      await finishWorkout(workoutId, true, db)
      finished.push(workoutId)
    }
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 7, 12)))
    const incomplete = await startWorkout(db)
    await addCard(incomplete, exercise.id)
    await addCard(incomplete, otherExercise.id, 10)
    await finishWorkout(incomplete, true, db)

    vi.setSystemTime(new Date(Date.UTC(2026, 0, 8, 12)))
    const cancelled = await startWorkout(db)
    await addCard(cancelled, exercise.id, 11)
    await cancelWorkout(cancelled, db)
    const active = await startWorkout(db)
    await addCard(active, exercise.id, 12)

    const history = await recentExerciseHistory(exercise.id, db)
    expect(history.map(session => session.id)).toEqual(finished.slice(1).reverse())
    expect(history[0].sets.map(set => set.reps)).toEqual([6, 9])
    expect(await recentExerciseHistory(crypto.randomUUID(), db)).toEqual([])
    await restoreBackup(await createBackup(db), restored)
    expect(await recentExerciseHistory(exercise.id, restored)).toEqual(history)
  } finally {
    vi.useRealTimers()
    await db.delete()
    await restored.delete()
  }
})
