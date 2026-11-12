import { analyticsExerciseKey, improvesMetric, setMetricEntries, setMetrics, type SetMetric, type SetMetrics } from './analytics'
import type { StrengthData } from './models'

export type SetRecordBaselines = Map<string, SetMetrics>

export function completedSetRecords(workout: Pick<StrengthData, 'sessionExercises' | 'strengthSets'>, baselines: SetRecordBaselines) {
  const cards = new Map(workout.sessionExercises.map(({ id, snapshot }) => [id, { snapshot, key: analyticsExerciseKey(snapshot) }]))
  const bestByExercise = new Map([...baselines].map(([key, values]) => [key, { ...values }]))
  const records = new Map<string, SetMetric[]>()
  const completed = workout.strengthSets.filter(set => set.completedAt !== null)
    .sort((a, b) => a.completedAt!.localeCompare(b.completedAt!) || a.id.localeCompare(b.id))
  for (const set of completed) {
    const card = cards.get(set.sessionExerciseId)
    if (!card) continue
    const baseline = baselines.get(card.key)
    const best = bestByExercise.get(card.key)
    if (!best || !baseline) continue
    for (const [metric, value] of setMetricEntries(setMetrics(set, card.snapshot))) {
      // A first result establishes a baseline in a finished workout.
      if (baseline[metric] === undefined || !improvesMetric(metric, value, best[metric]!)) continue
      const earned = records.get(set.id) ?? []
      earned.push(metric)
      records.set(set.id, earned)
      best[metric] = value
    }
  }
  return records
}
