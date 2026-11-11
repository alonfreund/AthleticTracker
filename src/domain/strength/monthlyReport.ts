import { analyticsExerciseKey, exerciseProgress, improvesMetric, type AnalyticsExercise, type Metric, type MetricPoint } from './analytics'
import { collectExerciseHistory, countSessionMuscles, type FinishedSession } from './analyticsHistory'
import { exerciseDisplayName } from './exerciseDisplayName'

export type TrainingMonth = { year: number; month: number }

export function trainingMonth(date = new Date()): TrainingMonth {
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function shiftTrainingMonth({ year, month }: TrainingMonth, offset: number): TrainingMonth {
  return trainingMonth(new Date(year, month + offset, 1))
}

export function monthBounds({ year, month }: TrainingMonth) {
  return { from: new Date(year, month, 1).toISOString(), before: new Date(year, month + 1, 1).toISOString() }
}

type MonthlyRecord = { exercise: Pick<AnalyticsExercise, 'key' | 'snapshot'>; metric: Metric; point: MetricPoint }

export function buildMonthlyReport(month: TrainingMonth, history: FinishedSession[]) {
  const { from, before } = monthBounds(month)
  const inMonth = (date: string) => date >= from && date < before
  const sessions = history.filter(session => inMonth(session.startedAt))
  const dayCount = new Date(month.year, month.month + 1, 0).getDate()
  const firstDay = new Date(month.year, month.month, 1).getDay()
  const daysBeforeMonday = (firstDay + 6) % 7
  const weeks: { first: number; last: number; sets: number }[] = []
  for (let first = 1; first <= dayCount;) {
    const last = Math.min(dayCount, first === 1 ? 7 - daysBeforeMonday : first + 6)
    weeks.push({ first, last, sets: 0 })
    first = last + 1
  }

  let durationMs = 0
  let workingSets = 0
  const trainingDays = new Set<number>()
  for (const session of sessions) {
    const day = new Date(session.startedAt).getDate()
    trainingDays.add(day)
    if (session.endedAt) durationMs += Math.max(0, Date.parse(session.endedAt) - Date.parse(session.startedAt))
    const sets = session.cards.reduce((sum, card) => sum + card.sets.length, 0)
    workingSets += sets
    weeks[Math.floor((day - 1 + daysBeforeMonday) / 7)].sets += sets
  }

  const mainExercises = collectExerciseHistory(sessions).map(({ key, snapshot, sessions }) => ({
    key, snapshot,
    workoutCount: sessions.length,
    workingSets: sessions.reduce((total, session) => total + session.sets.length, 0),
  })).sort((a, b) => b.workingSets - a.workingSets || exerciseDisplayName(a.snapshot).localeCompare(exerciseDisplayName(b.snapshot))).slice(0, 5)

  const records: MonthlyRecord[] = []
  const relevantKeys = new Set(sessions.flatMap(session => session.cards.map(card => analyticsExerciseKey(card.snapshot))))
  const relevantHistory = relevantKeys.size ? history.filter(session => session.startedAt < before)
    .map(session => ({ ...session, cards: session.cards.filter(card => relevantKeys.has(analyticsExerciseKey(card.snapshot))) }))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id)) : []
  for (const exercise of collectExerciseHistory(relevantHistory)) {
    for (const { metric, points } of exerciseProgress(exercise)) {
      let best: number | undefined
      for (const point of points) {
        if (best !== undefined && !improvesMetric(metric, point.value, best)) continue
        if (best !== undefined && inMonth(point.session.startedAt)) {
          records.push({ exercise: { key: exercise.key, snapshot: exercise.snapshot }, metric, point })
        }
        best = point.value
      }
    }
  }
  records.sort((a, b) => b.point.session.startedAt.localeCompare(a.point.session.startedAt) || b.point.session.id.localeCompare(a.point.session.id))
  return { workoutCount: sessions.length, trainingDays: trainingDays.size, workingSets, durationMs, weeks,
    mainExercises, primaryMuscles: countSessionMuscles(sessions).primary, records }
}

export type MonthlyReport = ReturnType<typeof buildMonthlyReport>
