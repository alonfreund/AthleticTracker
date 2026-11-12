import type { FinishedSession } from './analyticsHistory'
import { exerciseDisplayName } from './exerciseDisplayName'
import { MOVEMENT_PATTERNS } from './taxonomy'

export const TREND_WINDOWS = [8, 12, 26] as const
export type TrendWindow = typeof TREND_WINDOWS[number]
export type TrendWeek = {
  from: string
  before: string
  workouts: number
  days: number
  sets: number
}

function localDay(date: Date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset)
}

export function trendCalendar(size: TrendWindow, now = new Date()) {
  const monday = localDay(now, -((now.getDay() + 6) % 7))
  const weeks = Array.from({ length: size }, (_, index) => {
    const offset = (index - size + 1) * 7
    return {
      from: localDay(monday, offset).toISOString(),
      before: localDay(monday, offset + 7).toISOString(),
    }
  })
  return { weeks, range: { from: weeks[0].from, before: localDay(now, 1).toISOString() } }
}

type Contribution = { exerciseId: string; name: string; sets: number }
type Pattern = { id: string; label: string; sets: number; weeklySets: number[]; exercises: Contribution[] }

export function buildTrainingTrends(calendar: ReturnType<typeof trendCalendar>, sessions: FinishedSession[]) {
  const weeks: TrendWeek[] = calendar.weeks.map(week => ({ ...week, workouts: 0, days: 0, sets: 0 }))
  const days = weeks.map(() => new Set<number>())
  const patterns = new Map<string, Omit<Pattern, 'exercises'> & { exercises: Map<string, Contribution> }>()
  let unclassifiedSets = 0
  for (const session of sessions) {
    if (session.startedAt < calendar.range.from || session.startedAt >= calendar.range.before) continue
    const index = weeks.findIndex(week => session.startedAt < week.before)
    const week = weeks[index]
    week.workouts++
    days[index].add(new Date(session.startedAt).getDay())
    for (const { snapshot, sets } of session.cards) {
      if (!sets.length) continue
      week.sets += sets.length
      const ids = new Set(snapshot.metadata?.movementPatternIds.filter(id => Object.hasOwn(MOVEMENT_PATTERNS, id)))
      if (!ids.size) unclassifiedSets += sets.length
      for (const id of ids) {
        let pattern = patterns.get(id)
        if (!pattern) {
          pattern = { id, label: MOVEMENT_PATTERNS[id], sets: 0, weeklySets: weeks.map(() => 0), exercises: new Map() }
          patterns.set(id, pattern)
        }
        pattern.sets += sets.length
        pattern.weeklySets[index] += sets.length
        const previous = pattern.exercises.get(snapshot.id)
        pattern.exercises.set(snapshot.id, {
          exerciseId: snapshot.id, name: exerciseDisplayName(snapshot), sets: (previous?.sets ?? 0) + sets.length,
        })
      }
    }
  }

  const ranked = [...patterns.values()].map(pattern => ({
    ...pattern,
    exercises: [...pattern.exercises.values()].sort((a, b) => b.sets - a.sets || a.name.localeCompare(b.name)),
  })).sort((a, b) => b.sets - a.sets || a.label.localeCompare(b.label))
  return { weeks: weeks.map((week, index) => ({ ...week, days: days[index].size })), patterns: ranked, unclassifiedSets }
}

export type TrainingTrends = ReturnType<typeof buildTrainingTrends>
