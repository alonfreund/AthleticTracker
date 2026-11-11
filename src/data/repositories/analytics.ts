import { muscleDistribution } from '../../domain/strength/muscleDistribution'
import { analyticsExerciseKey, isWorkingSet, type AnalyticsExercise, type AnalyticsSession } from '../../domain/strength/analytics'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import type { SessionExercise, StrengthSet } from '../../domain/strength/models'
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

type FinishedSession = Omit<AnalyticsSession, 'sets'> & { cards: { snapshot: SessionExercise['snapshot']; sets: StrengthSet[] }[] }

async function readFinishedWorkingSets(database: typeof db, range?: { from: string; before: string }): Promise<FinishedSession[]> {
  const { sessions, sessionActivities, sessionExercises, strengthSets } = database
  return database.transaction('r', [sessions, sessionActivities, sessionExercises, strengthSets], async () => {
    const finished = await sessions.where('status').equals('finished')
      .filter(row => !range || (row.startedAt >= range.from && row.startedAt < range.before)).toArray()
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
    return finished.map(({ id, title, startedAt }) => ({
      id, title, startedAt,
      cards: (cardsBySession.get(id) ?? []).flatMap(({ id, snapshot }) => {
        const sets = setsByCard.get(id)
        return sets?.length ? [{ snapshot, sets }] : []
      }),
    }))
  })
}

export async function readMuscleDistribution(range?: { from: string; before: string }, database = db) {
  const sessions = await readFinishedWorkingSets(database, range)
  return muscleDistribution(sessions.flatMap(session => session.cards.map(({ snapshot, sets }) => ({
    primary: snapshot.primaryMuscleGroupIds,
    secondary: snapshot.secondaryMuscleGroupIds,
    count: sets.length,
  }))))
}

export async function readExerciseAnalytics(database = db): Promise<AnalyticsExercise[]> {
  const finished = await readFinishedWorkingSets(database)
  const exercises = new Map<string, AnalyticsExercise>()
  for (const { id, title, startedAt, cards } of finished) {
    const entries = new Map<string, AnalyticsSession>()
    for (const { snapshot, sets } of cards) {
      const key = analyticsExerciseKey(snapshot)
      let exercise = exercises.get(key)
      if (!exercise) {
        exercise = { key, snapshot, sessions: [] }
        exercises.set(key, exercise)
      }
      exercise.snapshot = snapshot
      let entry = entries.get(key)
      if (!entry) {
        entry = { id, title, startedAt, sets: [] }
        entries.set(key, entry)
        exercise.sessions.push(entry)
      }
      for (const set of sets) entry.sets.push(set)
    }
  }
  return [...exercises.values()].sort((a, b) => exerciseDisplayName(a.snapshot).localeCompare(exerciseDisplayName(b.snapshot)))
}
