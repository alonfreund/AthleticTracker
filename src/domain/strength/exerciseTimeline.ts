import type { AnalyticsSession } from './analytics'

export const EXERCISE_RANGES = { '1': '1 month', '3': '3 months', '6': '6 months', '12': '1 year', all: 'All time' } as const
export type ExerciseRange = keyof typeof EXERCISE_RANGES

export function timelineRange(range: ExerciseRange, now = new Date()) {
  const before = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const target = new Date(now.getFullYear(), now.getMonth() - Number(range), 1)
  const from = range === 'all' ? undefined : new Date(target.getFullYear(), target.getMonth(),
    Math.min(now.getDate(), new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()))
  return { from, before }
}

export function frequencyTimeline(sessions: AnalyticsSession[], range: ExerciseRange, now = new Date()) {
  const { from, before } = timelineRange(range, now)
  const monthly = range === '12' || range === 'all'
  const inRange = sessions.filter(session => {
    const date = new Date(session.startedAt)
    return date < before && (!from || date >= from)
  })
  const start = from ?? (inRange[0] && new Date(inRange[0].startedAt))
  if (!start) return []
  const bucketStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(),
    monthly ? 1 : date.getDate() - (date.getDay() + 6) % 7)
  const buckets = new Map<number, { at: number; sessions: AnalyticsSession[] }>()
  for (let date = bucketStart(start); date < before;) {
    const at = date.getTime()
    buckets.set(at, { at, sessions: [] })
    date = monthly ? new Date(date.getFullYear(), date.getMonth() + 1, 1)
      : new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
  }
  for (const session of inRange) buckets.get(bucketStart(new Date(session.startedAt)).getTime())?.sessions.push(session)
  return [...buckets.values()]
}
