import { massInKilograms, type Exercise, type Session, type StrengthSet } from './models'

export type AnalyticsSession = Pick<Session, 'id' | 'title' | 'startedAt'> & { sets: StrengthSet[] }
export type AnalyticsExercise = { key: string; snapshot: Exercise; sessions: AnalyticsSession[] }

export const METRIC_LABELS = {
  load: 'Heaviest load',
  reps: 'Most reps in a set',
  estimatedMax: 'Estimated 1RM',
  volume: 'Session volume',
  hold: 'Longest hold',
  assistance: 'Least assistance',
} as const
export type Metric = keyof typeof METRIC_LABELS
export type MetricPoint = { session: AnalyticsSession; value: number; set?: StrengthSet }
type MetricSeries = { metric: Metric; points: MetricPoint[]; record: MetricPoint }

export function analyticsExerciseKey(snapshot: Exercise): string {
  const { measurement, load, weightConvention } = snapshot.tracking
  return [snapshot.id, measurement, load, weightConvention, snapshot.metadata?.repetitionConvention === 'per-side' ? 'per-side' : 'total'].join(':')
}

export function isWorkingSet(set: StrengthSet): boolean {
  return set.completed && set.setType !== 'warm-up'
}

export function improvesMetric(metric: Metric, value: number, previous: number): boolean {
  return metric === 'assistance' ? value < previous : value > previous
}

export type SetMetric = Exclude<Metric, 'volume'>
export type SetMetrics = Partial<Record<SetMetric, number>>

export function setMetrics(set: StrengthSet, snapshot: Exercise): SetMetrics {
  const values: SetMetrics = {}
  if (!isWorkingSet(set)) return values
  if (set.reps !== null) values.reps = set.reps
  if (set.durationSeconds !== null) values.hold = set.durationSeconds
  if (set.load.mode === 'assisted' && set.load.assistance) values.assistance = massInKilograms(set.load.assistance)
  const mass = set.load.mode === 'external' ? set.load.weight : set.load.mode === 'added' ? set.load.addedWeight : null
  if (mass) {
    values.load = massInKilograms(mass)
    if (snapshot.tracking.load === 'external' && snapshot.tracking.measurement === 'reps'
      && values.load > 0 && set.reps !== null && set.reps >= 1 && set.reps <= 10) {
      values.estimatedMax = set.reps === 1 ? values.load : values.load * (1 + set.reps / 30)
    }
  }
  return values
}

export function setMetricEntries(metrics: SetMetrics) {
  return Object.entries(metrics) as [SetMetric, number][]
}

export function exerciseProgress({ snapshot, sessions }: AnalyticsExercise): MetricSeries[] {
  const series = new Map<Metric, MetricSeries>()
  const { measurement, weightConvention } = snapshot.tracking
  const massMultiplier = weightConvention === 'per-hand' || snapshot.metadata?.repetitionConvention === 'per-side' ? 2 : 1
  for (const session of sessions) {
    const best = new Map<Metric, MetricPoint>()
    const count = (metric: Metric, value: number, set?: StrengthSet) => {
      const previous = best.get(metric)
      if (!previous || improvesMetric(metric, value, previous.value)) best.set(metric, { session, value, set })
    }
    let volume = 0
    let hasVolume = false
    for (const set of session.sets) {
      const values = setMetrics(set, snapshot)
      for (const [metric, value] of setMetricEntries(values)) count(metric, value, set)
      if (values.load !== undefined && measurement === 'reps' && set.reps !== null) {
        volume += values.load * set.reps * massMultiplier
        hasVolume = true
      }
    }
    if (hasVolume) count('volume', volume)
    for (const [metric, point] of best) {
      const entry = series.get(metric)
      if (!entry) series.set(metric, { metric, points: [point], record: point })
      else {
        entry.points.push(point)
        if (improvesMetric(metric, point.value, entry.record.value)) entry.record = point
      }
    }
  }
  return (Object.keys(METRIC_LABELS) as Metric[]).flatMap(metric => {
    const entry = series.get(metric)
    return entry ? [entry] : []
  })
}
