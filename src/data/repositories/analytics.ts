import { buildMonthlyReport, monthBounds, type TrainingMonth } from '../../domain/strength/monthlyReport'
import { collectExerciseHistory, countSessionMuscles, type FinishedSession } from '../../domain/strength/analyticsHistory'
import { isWorkingSet, type AnalyticsExercise } from '../../domain/strength/analytics'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
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

async function readFinishedWorkingSets(database: typeof db, range?: { from?: string; before: string }): Promise<FinishedSession[]> {
  const { sessions, sessionActivities, sessionExercises, strengthSets } = database
  return database.transaction('r', [sessions, sessionActivities, sessionExercises, strengthSets], async () => {
    const finished = await sessions.where('status').equals('finished')
      .filter(row => !range || ((!range.from || row.startedAt >= range.from) && row.startedAt < range.before)).toArray()
    if (!finished.length) return []
    finished.sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id))
    const activities = await sessionActivities.where('sessionId').anyOf(finished.map(row => row.id)).toArray()
    const cards = activities.length ? await sessionExercises.where('sessionActivityId').anyOf(activities.map(row => row.id)).sortBy('position') : []
    const sets = cards.length ? await strengthSets.where('sessionExerciseId').anyOf(cards.map(row => row.id)).filter(isWorkingSet).sortBy('position') : []
    const setsByCard = groupBy(sets, row => row.sessionExerciseId)
    const sessionByActivity = new Map(activities.map(row => [row.id, row.sessionId]))
    const cardsBySession = groupBy(cards, row => sessionByActivity.get(row.sessionActivityId))
    return finished.map(({ id, title, startedAt, endedAt }) => ({
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
