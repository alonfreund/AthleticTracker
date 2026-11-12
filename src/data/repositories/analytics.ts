import { buildAnalyticsOverview } from '../../domain/strength/analyticsOverview'
import { workoutRecapRecords } from '../../domain/strength/workoutRecap'
import type { MovementDiscipline, StrengthData } from '../../domain/strength/models'
import { buildTrainingTrends, trendCalendar, type TrendWindow } from '../../domain/strength/trainingTrends'
import { buildMonthlyReport, monthBounds, type TrainingMonth } from '../../domain/strength/monthlyReport'
import { collectExerciseHistory, countSessionMuscles, type FinishedSession } from '../../domain/strength/analyticsHistory'
import { analyticsExerciseKey, improvesMetric, setMetrics, setMetricEntries, isWorkingSet, type AnalyticsExercise } from '../../domain/strength/analytics'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import type { SetRecordBaselines } from '../../domain/strength/setRecords'
import { db } from '../db/database'

function groupBy<T, K>(rows: T[], keyOf: (row: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const row of rows) {
    const key = keyOf(row)
    const group = groups.get(key)
    if (group) group.push(row)
    else groups.set(key, [row])
  }
  return groups
}

async function readFinishedWorkingSets(database: typeof db, range?: { from?: string; before: string }, exerciseKeys?: ReadonlySet<string>, discipline: MovementDiscipline = 'strength'): Promise<FinishedSession[]> {
  const { sessions, sessionActivities, sessionExercises, strengthSets } = database
  return database.transaction('r', [sessions, sessionActivities, sessionExercises, strengthSets], async () => {
    const finished = await sessions.where('status').equals('finished')
      .filter(row => !range || ((!range.from || row.startedAt >= range.from) && row.startedAt < range.before)).toArray()
    if (!finished.length) return []
    finished.sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id))
    const activities = await sessionActivities.where('sessionId').anyOf(finished.map(row => row.id)).toArray()
    const activityTypes = new Map(activities.map(row => [row.sessionId, row.activityType]))
    const cards = activities.length ? await sessionExercises.where('sessionActivityId').anyOf(activities.map(row => row.id))
      .filter(row => !exerciseKeys || exerciseKeys.has(analyticsExerciseKey(row.snapshot))).sortBy('position') : []
    const sets = cards.length ? await strengthSets.where('sessionExerciseId').anyOf(cards.map(row => row.id)).filter(isWorkingSet).sortBy('position') : []
    const setsByCard = groupBy(sets, row => row.sessionExerciseId)
    const sessionByActivity = new Map(activities.map(row => [row.id, row.sessionId]))
    const cardsBySession = groupBy(cards, row => sessionByActivity.get(row.sessionActivityId))
    return finished.filter(row => (activityTypes.get(row.id) ?? 'strength') === discipline).map(({ id, title, startedAt, endedAt }) => ({
      id, title, startedAt, endedAt,
      cards: (cardsBySession.get(id) ?? []).flatMap(({ id, snapshot }) => {
        const sets = setsByCard.get(id)
        return sets?.length ? [{ snapshot, sets }] : []
      }),
    }))
  })
}

export async function readMuscleDistribution(range?: { from: string; before: string }, database = db) {
  return countSessionMuscles(await readFinishedWorkingSets(database, range))
}

export async function readExerciseAnalytics(database = db): Promise<AnalyticsExercise[]> {
  return collectExerciseHistory(await readFinishedWorkingSets(database))
    .sort((a, b) => exerciseDisplayName(a.snapshot).localeCompare(exerciseDisplayName(b.snapshot)))
}

export async function readMonthlyReport(month: TrainingMonth, database = db) {
  const { before } = monthBounds(month)
  return buildMonthlyReport(month, await readFinishedWorkingSets(database, { before }))
}

export async function readTrainingTrends(size: TrendWindow, database = db, now = new Date()) {
  const calendar = trendCalendar(size, now)
  return buildTrainingTrends(calendar, await readFinishedWorkingSets(database, calendar.range))
}

export async function readSetRecordBaselines(keys: ReadonlySet<string>, startedAt: string, database = db, discipline: MovementDiscipline = 'strength'): Promise<SetRecordBaselines> {
  const baselines: SetRecordBaselines = new Map()
  if (!keys.size) return baselines
  // A finished workout can share a millisecond with the start of the next workout.
  const before = new Date(Date.parse(startedAt) + 1).toISOString()
  for (const session of await readFinishedWorkingSets(database, { before }, keys, discipline)) {
    for (const { snapshot, sets } of session.cards) {
      const key = analyticsExerciseKey(snapshot)
      const best = baselines.get(key) ?? {}
      for (const set of sets) {
        for (const [metric, value] of setMetricEntries(setMetrics(set, snapshot))) {
          const previous = best[metric]
          if (previous === undefined || improvesMetric(metric, value, previous)) best[metric] = value
        }
      }
      baselines.set(key, best)
    }
  }
  return baselines
}

export async function readWorkoutRecapRecords(workout: StrengthData, database = db) {
  const session = workout.sessions[0]
  const setsByCard = groupBy(workout.strengthSets.filter(isWorkingSet), set => set.sessionExerciseId)
  const cards = workout.sessionExercises.flatMap(({ id, snapshot }) => {
    const sets = setsByCard.get(id)
    return sets?.length ? [{ snapshot, sets }] : []
  })
  if (!cards.length) return []
  const keys = new Set(cards.map(card => analyticsExerciseKey(card.snapshot)))
  const before = new Date(Date.parse(session.startedAt) + 1).toISOString()
  const discipline = workout.sessionActivities[0]?.activityType === 'calisthenics' ? 'calisthenics' : 'strength'
  const history = await readFinishedWorkingSets(database, { before }, keys, discipline)
  return workoutRecapRecords({ ...session, cards }, history.filter(row => row.id !== session.id))
}

export async function readAnalyticsOverview(size: TrendWindow, database = db, now = new Date()) {
  const calendar = trendCalendar(size, now)
  return buildAnalyticsOverview(calendar, await readFinishedWorkingSets(database, calendar.range))
}
