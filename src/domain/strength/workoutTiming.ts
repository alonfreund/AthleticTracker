import type { Session } from './models'

export function workoutElapsedMs(session: Pick<Session, 'startedAt' | 'endedAt' | 'workoutTiming'>, now = Date.now()) {
  const end = session.workoutTiming?.pausedAt ?? session.endedAt
  return Math.max(0, (end ? Date.parse(end) : now) - Date.parse(session.startedAt) - (session.workoutTiming?.pausedMs ?? 0))
}
