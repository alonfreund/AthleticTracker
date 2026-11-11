import { analyticsExerciseKey, isWorkingSet, type AnalyticsExercise, type AnalyticsSession } from '../../domain/strength/analytics'
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

export function readExerciseAnalytics(database = db): Promise<AnalyticsExercise[]> {
  const { sessions, sessionActivities, sessionExercises, strengthSets } = database
  return database.transaction('r', [sessions, sessionActivities, sessionExercises, strengthSets], async () => {
    const finished = await sessions.where('status').equals('finished').toArray()
    if (!finished.length) return []
    finished.sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id))
    const activities = await sessionActivities.where('sessionId').anyOf(finished.map(row => row.id)).toArray()
    if (!activities.length) return []
    const cards = await sessionExercises.where('sessionActivityId').anyOf(activities.map(row => row.id)).sortBy('position')
    if (!cards.length) return []
    const sets = await strengthSets.where('sessionExerciseId').anyOf(cards.map(row => row.id)).filter(isWorkingSet).sortBy('position')
    const setsByCard = groupBy(sets, row => row.sessionExerciseId)
    const sessionByActivity = new Map(activities.map(row => [row.id, row.sessionId]))
    const cardsBySession = groupBy(cards, row => sessionByActivity.get(row.sessionActivityId))
    const exercises = new Map<string, AnalyticsExercise>()
    for (const { id, title, startedAt } of finished) {
      const entries = new Map<string, AnalyticsSession>()
      for (const card of cardsBySession.get(id) ?? []) {
        const workingSets = setsByCard.get(card.id)
        if (!workingSets?.length) continue
        const key = analyticsExerciseKey(card.snapshot)
        let exercise = exercises.get(key)
        if (!exercise) {
          exercise = { key, snapshot: card.snapshot, sessions: [] }
          exercises.set(key, exercise)
        }
        exercise.snapshot = card.snapshot
        let entry = entries.get(key)
        if (!entry) {
          entry = { id, title, startedAt, sets: [] }
          entries.set(key, entry)
          exercise.sessions.push(entry)
        }
        entry.sets.push(...workingSets)
      }
    }
    return [...exercises.values()].sort((a, b) => exerciseDisplayName(a.snapshot).localeCompare(exerciseDisplayName(b.snapshot)))
  })
}
