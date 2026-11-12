import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readTrainingTrends } from '../src/data/repositories/analytics'
import { addSet, addWorkoutExercise, cancelWorkout, changeSetType, deleteFinishedWorkout, editFinishedWorkout, finishWorkout, loadWorkout, saveInlineSet, startWorkout } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import { TREND_WINDOWS, trendCalendar } from '../src/domain/strength/trainingTrends'

it('includes the partial current week and uses local Monday boundaries across clock changes', () => {
  const today = new Date(2026, 10, 4, 12)
  for (const size of TREND_WINDOWS) {
    const { weeks, range } = trendCalendar(size, today)
    expect(weeks).toHaveLength(size)
    expect(weeks.at(-1)).toEqual({
      from: new Date(2026, 10, 2).toISOString(),
      before: new Date(2026, 10, 9).toISOString(),
    })
    expect(range).toEqual({ from: weeks[0].from, before: new Date(2026, 10, 5).toISOString() })
    for (const [i, week] of weeks.entries()) {
      expect(new Date(week.from).getHours()).toBe(0)
      expect(new Date(week.from).getDay()).toBe(1)
      if (i) expect(week.from).toBe(weeks[i - 1].before)
    }
  }
})

it('counts workouts and distinct days, uses saved pattern tags, and rebuilds after edits, deletion and restore', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const [bench, squat] = STARTER_EXERCISES
  const now = new Date(2026, 10, 4, 12)
  try {
    await verifyLocalStorage(db)
    await db.exercises.bulkAdd([
      { ...bench, metadata: { ...bench.metadata!, movementPatternIds: ['horizontal-push', 'elbow-extension'] } },
      { ...squat, metadata: { ...squat.metadata!, movementPatternIds: ['unknown'] } },
    ])

    async function log(date: Date, exerciseId: string, status = 'finished', withWarmup = false) {
      vi.setSystemTime(date)
      const id = await startWorkout(db)
      await addWorkoutExercise(id, exerciseId, db)
      const workout = await loadWorkout(id, db)
      const set = workout.strengthSets[0]
      const input = inputFromSet(set)
      input.values.reps = '8'
      input.values.weight = '40'
      expect((await saveInlineSet(id, set.id, input, true, db)).applied).toBe(true)
      if (withWarmup) {
        const card = workout.sessionExercises[0].id
        const warmup = await addSet(id, card, db)
        await changeSetType(id, warmup, 'warm-up', db)
        expect((await saveInlineSet(id, warmup, input, true, db)).applied).toBe(true)
        await addSet(id, card, db)
      }
      if (status === 'finished') await finishWorkout(id, true, db)
      if (status === 'cancelled') await cancelWorkout(id, db)
      return id
    }

    const sunday = await log(new Date(2026, 10, 1, 23, 59), bench.id, 'finished', true)
    const monday = await log(new Date(2026, 10, 2, 0, 0), bench.id)
    await log(new Date(2026, 10, 2, 18), squat.id)
    await log(new Date(2026, 10, 3, 9), bench.id, 'cancelled')
    await log(new Date(2026, 10, 5, 9), bench.id) // After the report's local day.
    await log(new Date(2026, 10, 4, 9), bench.id, 'active')
    await db.exercises.update(bench.id, { metadata: { ...bench.metadata!, movementPatternIds: ['vertical-push'] } })

    const report = await readTrainingTrends(8, db, now)
    expect(report.weeks.map(row => [row.workouts, row.days, row.sets])).toEqual([
      [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1], [2, 1, 2],
    ])
    expect(report.unclassifiedSets).toBe(1)
    expect(report.patterns.map(row => [row.id, row.sets, row.weeklySets.slice(-2)])).toEqual([
      ['elbow-extension', 2, [1, 1]], ['horizontal-push', 2, [1, 1]],
    ])
    expect(report.patterns[0].exercises).toEqual([{ exerciseId: bench.id, name: bench.name, sets: 2 }])
    const workout = await loadWorkout(sunday, db)
    await editFinishedWorkout(workout, {
      title: 'Moved to Monday', notes: '', startedAt: new Date(2026, 10, 2, 11).toISOString(), sets: [], removedSetIds: [],
    }, db)
    const edited = await readTrainingTrends(8, db, now)
    expect(edited.weeks.at(-1)).toMatchObject({ workouts: 3, days: 1, sets: 3 })
    expect(edited.patterns[0].weeklySets.slice(-2)).toEqual([0, 2])
    const backup = await createBackup(db)
    await deleteFinishedWorkout(await loadWorkout(monday, db), db)
    expect((await readTrainingTrends(8, db, now)).patterns[0].sets).toBe(1)
    await restoreBackup(backup, db)
    expect(await readTrainingTrends(8, db, now)).toEqual(edited)
  } finally {
    vi.useRealTimers()
    await db.delete()
  }
})
