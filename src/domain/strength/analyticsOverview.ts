import { collectExerciseHistory, countSessionMuscles, type FinishedSession } from './analyticsHistory'
import { exerciseDisplayName } from './exerciseDisplayName'
import { buildTrainingTrends, trendCalendar } from './trainingTrends'

export function buildAnalyticsOverview(calendar: ReturnType<typeof trendCalendar>, sessions: FinishedSession[]) {
  const withinRange = sessions.filter(session => session.startedAt >= calendar.range.from && session.startedAt < calendar.range.before)
  const { weeks } = buildTrainingTrends(calendar, withinRange)
  const muscles = countSessionMuscles(withinRange).primary
  const exercises = collectExerciseHistory(withinRange).map(({ key, snapshot, sessions }) => ({
    key, snapshot, sets: sessions.reduce((count, session) => count + session.sets.length, 0),
  })).sort((a, b) => b.sets - a.sets || exerciseDisplayName(a.snapshot).localeCompare(exerciseDisplayName(b.snapshot)))
  return { weeks, muscles, exercises: exercises.slice(0, 5) }
}

export type AnalyticsOverview = ReturnType<typeof buildAnalyticsOverview>
