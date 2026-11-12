import { exerciseProgress, improvesMetric, type Metric } from './analytics'
import { collectExerciseHistory, type FinishedSession } from './analyticsHistory'
import type { Exercise } from './models'

export function workoutRecapRecords(current: FinishedSession, earlier: FinishedSession[]) {
  const history = new Map(collectExerciseHistory(earlier).map(exercise => [exercise.key, exercise]))
  const records: { exerciseKey: string; snapshot: Exercise; metric: Metric; previous: number; current: number }[] = []
  for (const exercise of collectExerciseHistory([current])) {
    const prior = history.get(exercise.key)
    if (!prior) continue
    const baselines = new Map(exerciseProgress(prior).map(series => [series.metric, series.record.value]))
    for (const { metric, record } of exerciseProgress(exercise)) {
      const previous = baselines.get(metric)
      if (previous !== undefined && improvesMetric(metric, record.value, previous)) {
        records.push({ exerciseKey: exercise.key, snapshot: exercise.snapshot, metric, previous, current: record.value })
      }
    }
  }
  return records
}

export type WorkoutRecapRecord = ReturnType<typeof workoutRecapRecords>[number]
