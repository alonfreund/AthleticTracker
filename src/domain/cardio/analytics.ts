import type { CardioActivity } from './activities'
import type { CardioDetails } from './models'
import type { Session } from '../strength/models'

export const CARDIO_METRICS = {
  duration: 'Duration', distance: 'Distance', pace: 'Average pace', speed: 'Average speed',
  elevation: 'Elevation gain', heartRate: 'Average heart rate', maxHeartRate: 'Maximum heart rate', frequency: 'Session frequency',
} as const
export type CardioMetric = keyof typeof CARDIO_METRICS
export type CardioAnalyticsSession = {
  session: Pick<Session, 'id' | 'title' | 'startedAt'>
  details: CardioDetails
  timing?: unknown
}
export type TimingSource = 'live' | 'manual'
export const timingSource = (row: CardioAnalyticsSession): TimingSource => row.timing ? 'live' : 'manual'

export function cardioMetric(row: CardioAnalyticsSession, metric: Exclude<CardioMetric, 'frequency'>) {
  const { details } = row
  switch (metric) {
    case 'duration': return details.durationSeconds
    case 'distance': return details.distanceMeters
    case 'elevation': return details.elevationGainMeters
    case 'heartRate': return details.averageHeartRate
    case 'maxHeartRate': return details.maxHeartRate
    case 'pace': return details.sport !== 'cycling' && details.sport !== 'other' && details.distanceMeters
      ? details.durationSeconds / details.distanceMeters : null
    case 'speed': return details.sport === 'cycling' && details.distanceMeters ? details.distanceMeters / details.durationSeconds : null
  }
}

export function filterCardio(rows: CardioAnalyticsSession[], sport: CardioActivity, setting: string | null, source: TimingSource | 'all') {
  return rows.filter(row => row.details.sport === sport && (setting === null || row.details.setting === setting)
    && (source === 'all' || timingSource(row) === source))
    .sort((a, b) => a.session.startedAt.localeCompare(b.session.startedAt) || a.session.id.localeCompare(b.session.id))
}

export function cardioChartPoints(rows: CardioAnalyticsSession[], metric: Exclude<CardioMetric, 'frequency'>) {
  let gap = false
  return rows.flatMap(row => {
    const value = cardioMetric(row, metric)
    if (value === null || !Number.isFinite(value)) { gap = true; return [] }
    const point = { row, value, breakBefore: gap }
    gap = false
    return [point]
  })
}

export function cardioTotals(rows: CardioAnalyticsSession[]) {
  let duration = 0
  let distance = 0
  let distances = 0
  for (const { details } of rows) {
    duration += details.durationSeconds
    if (details.distanceMeters !== null) { distance += details.distanceMeters; distances++ }
  }
  return { duration, distance, distances, count: rows.length }
}

type Benchmark = { key: string; label: string; row: CardioAnalyticsSession; value: number; metric: Exclude<CardioMetric, 'frequency'> }
const targets: Partial<Record<CardioActivity, [number, string][]>> = {
  running: [[5000, '5 km'], [10000, '10 km']],
  swimming: [[100, '100 m'], [400, '400 m'], [100 * .9144, '100 yd'], [400 * .9144, '400 yd']],
  rowing: [[500, '500 m'], [2000, '2,000 m']],
}

export function cardioBenchmarks(rows: CardioAnalyticsSession[]): Benchmark[] {
  const best = new Map<string, Benchmark>()
  function add(key: string, label: string, row: CardioAnalyticsSession, metric: Benchmark['metric'], lower = false) {
    const value = cardioMetric(row, metric)
    if (value === null || !Number.isFinite(value)) return
    const old = best.get(key)
    if (!old || (lower ? value < old.value : value > old.value) || (value === old.value && row.session.startedAt < old.row.session.startedAt)) {
      best.set(key, { key, label, row, value, metric })
    }
  }
  for (const row of rows) {
    const { sport, setting, distanceMeters, poolLength, distanceUnit } = row.details
    add('longest-duration', 'Longest duration', row, 'duration')
    add('longest-distance', 'Longest distance', row, 'distance')
    if (sport === 'hiking' || sport === 'cycling') add('highest-ascent', 'Biggest ascent', row, 'elevation')
    const pool = sport === 'swimming' && setting === 'Pool' ? (poolLength === null ? 'unknown' : poolLength * (distanceUnit === 'yd' ? .9144 : 1)) : ''
    const group = JSON.stringify([setting, timingSource(row), pool])
    if (sport === 'cycling') add(`speed:${group}`, 'Highest average speed', row, 'speed')
    for (const [meters, label] of targets[sport] ?? []) {
      // Allow floating-point conversion noise, not a distance tolerance.
      if (distanceMeters !== null && Math.abs(distanceMeters - meters) < 1e-7) {
        add(`fastest:${meters}:${group}`, `Fastest logged ${label}`, row, 'duration', true)
      }
    }
  }
  return [...best.values()]
}
