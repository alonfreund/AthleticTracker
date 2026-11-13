import { analyticsExerciseKey, type AnalyticsExercise, type AnalyticsSession } from './analytics'
import type { Exercise, Session, StrengthSet } from './models'
import { muscleDistribution } from './muscleDistribution'

export type FinishedSession = Pick<Session, 'id' | 'title' | 'startedAt' | 'endedAt' | 'workoutTiming'> & {
  cards: { snapshot: Exercise; sets: StrengthSet[] }[]
}

export function countSessionMuscles(sessions: FinishedSession[]) {
  return muscleDistribution(sessions.flatMap(session => session.cards.map(({ snapshot, sets }) => ({
    primary: snapshot.primaryMuscleGroupIds,
    secondary: snapshot.secondaryMuscleGroupIds,
    count: sets.length,
  }))))
}

export function collectExerciseHistory(finished: FinishedSession[]): AnalyticsExercise[] {
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
  return [...exercises.values()]
}
