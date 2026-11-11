import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readMonthlyReport } from '../src/data/repositories/analytics'
import { addSet, addWorkoutExercise, cancelWorkout, changeSetType, deleteFinishedWorkout, editFinishedWorkout, finishWorkout, loadWorkout, saveInlineSet, startWorkout } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import { buildMonthlyReport, monthBounds, shiftTrainingMonth } from '../src/domain/strength/monthlyReport'

it('uses local month boundaries and Monday weeks clipped to the selected month', () => {
  const month = { year: 2026, month: 10 }
  expect(monthBounds(month)).toEqual({
    from: new Date(2026, 10, 1).toISOString(),
    before: new Date(2026, 11, 1).toISOString(),
  })
  expect(shiftTrainingMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 })
  expect(buildMonthlyReport(month, []).weeks.map(week => [week.first, week.last])).toEqual([
    [1, 1], [2, 8], [9, 15], [16, 22], [23, 29], [30, 30],
  ])
})

it('uses earlier baselines, skips ties and first results, and rebuilds after correcting history and restoring', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const [bench, squat] = STARTER_EXERCISES
  try {
    await verifyLocalStorage(db)
    await db.exercises.bulkAdd([bench, squat])
    async function log(start: Date, loads: number[], status = 'finished', withSquat = false) {
      vi.setSystemTime(start)
      const id = await startWorkout(db)
      async function complete(setId: string, kg: number) {
        const set = (await loadWorkout(id, db)).strengthSets.find(row => row.id === setId)!
        const input = inputFromSet(set)
        input.values.weight = String(kg)
        input.values.reps = '8'
        expect((await saveInlineSet(id, setId, input, true, db)).applied).toBe(true)
      }
      for (const kg of loads) {
        const card = await addWorkoutExercise(id, bench.id, db)
        const set = (await loadWorkout(id, db)).strengthSets.find(row => row.sessionExerciseId === card)!
        await complete(set.id, kg)
        if (withSquat) {
          const warmup = await addSet(id, card, db)
          await changeSetType(id, warmup, 'warm-up', db)
          await complete(warmup, 100)
          await addSet(id, card, db)
        }
      }
      if (withSquat) {
        const card = await addWorkoutExercise(id, squat.id, db)
        const set = (await loadWorkout(id, db)).strengthSets.find(row => row.sessionExerciseId === card)!
        await complete(set.id, 80)
      }
      vi.setSystemTime(new Date(start.getTime() + 30 * 60000))
      if (status === 'finished') await finishWorkout(id, true, db)
      if (status === 'cancelled') await cancelWorkout(id, db)
      return id
    }

    // This session ends in January, but its PR baseline belongs to December.
    const baselineId = await log(new Date(2025, 11, 31, 23, 50), [40])
    const improvement = await log(new Date(2026, 0, 2, 9), [50, 30], 'finished', true)
    const tie = await log(new Date(2026, 0, 2, 15), [50, 30])
    await log(new Date(2026, 0, 3, 9), [200], 'cancelled')
    await log(new Date(2026, 1, 1, 0), [500])
    await log(new Date(2026, 1, 2, 9), [250], 'active')
    const january = { year: 2026, month: 0 }
    const report = await readMonthlyReport(january, db)
    expect(report).toMatchObject({ workoutCount: 2, trainingDays: 1, workingSets: 5, durationMs: 3600000 })
    expect(report.weeks.map(week => week.sets)).toEqual([5, 0, 0, 0, 0])
    expect(report.mainExercises.map(row => [row.snapshot.id, row.workingSets, row.workoutCount])).toEqual([
      [bench.id, 4, 2], [squat.id, 1, 1],
    ])
    expect(report.primaryMuscles).toEqual([{ region: 'chest', count: 4 }, { region: 'glutes', count: 1 }, { region: 'quadriceps', count: 1 }])
    expect(report.records.map(({ metric, point }) => [metric, point.session.id])).toEqual([
      ['load', improvement], ['estimatedMax', improvement], ['volume', improvement],
    ])
    expect(report.records.some(row => row.point.session.id === tie)).toBe(false)

    const baseline = await loadWorkout(baselineId, db)
    const set = baseline.strengthSets[0]
    const input = inputFromSet(set)
    input.values.weight = '100'
    await editFinishedWorkout(baseline, {
      title: 'Corrected baseline', notes: '', startedAt: baseline.sessions[0].startedAt, removedSetIds: [],
      sets: [{ id: set.id, exerciseId: set.sessionExerciseId, input, setType: 'normal', completed: true }],
    }, db)
    expect((await readMonthlyReport(january, db)).records).toEqual([])
    const backup = await createBackup(db)
    await deleteFinishedWorkout(await loadWorkout(improvement, db), db)
    expect((await readMonthlyReport(january, db)).workingSets).toBe(2)
    await restoreBackup(backup, db)
    expect(await readMonthlyReport(january, db)).toEqual({ ...report, records: [] })
  } finally {
    vi.useRealTimers()
    await db.delete()
  }
})
