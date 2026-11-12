import { isCardioActivity, type CardioActivity } from '../features/performance/cardioActivities'
import type { Safety } from './updateSafety'

export const DESTINATIONS = ['strength', 'performance', 'analytics', 'settings'] as const
export type Destination = typeof DESTINATIONS[number]
export type Screen = Destination | 'strength/history' | 'strength/library' | 'performance/cardio' | 'performance/cardio/history' | 'performance/cardio/activity'
export type AppRoute = { screen: Screen; workoutId?: string; cardioActivity?: CardioActivity }
export function routeTab(screen: Screen): Destination {
  if (screen === 'performance/cardio' || screen === 'performance/cardio/history' || screen === 'performance/cardio/activity') return 'performance'
  if (screen === 'strength/history' || screen === 'strength/library') return 'strength'
  return screen
}

export function routeFromHash(hash: string): AppRoute {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (path === 'history' || path === 'strength/history') return { screen: 'strength/history' }
  if (path === 'library' || path === 'strength/library') return { screen: 'strength/library' }
  if (path === 'performance/cardio/history') return { screen: 'performance/cardio/history' }
  if (path.startsWith('performance/cardio/')) {
    const activity = path.slice('performance/cardio/'.length)
    return isCardioActivity(activity) ? { screen: 'performance/cardio/activity', cardioActivity: activity } : { screen: 'performance/cardio' }
  }
  if (path === 'performance/cardio') return { screen: 'performance/cardio' }
  const workout = /^strength\/(history|workout)\/([\w-]+)$/.exec(path)
  if (workout) return { screen: workout[1] === 'history' ? 'strength/history' : 'strength', workoutId: workout[2] }
  return { screen: (DESTINATIONS as readonly string[]).includes(path) ? path as Destination : 'strength' }
}

export function routeHash({ screen, workoutId, cardioActivity }: AppRoute): string {
  if (workoutId && screen === 'strength') return `#/strength/workout/${workoutId}`
  if (workoutId && screen === 'strength/history') return `#/strength/history/${workoutId}`
  if (screen === 'performance/cardio/activity') return cardioActivity ? `#/performance/cardio/${cardioActivity}` : '#/performance/cardio'
  return `#/${screen}`
}

export function navigationDecision(safety: Safety & { applying: boolean }): 'allow' | 'wait' | 'confirm' {
  if (safety.busy || safety.restoring || safety.loading || safety.applying) return 'wait'
  return safety.dirty ? 'confirm' : 'allow'
}
