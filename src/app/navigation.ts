import { isMuscleupRequirement, type MuscleupRequirement } from '../domain/calisthenics/muscleups'
import { isCardioActivity, type CardioActivity } from '../domain/cardio/activities'
import type { Safety } from './updateSafety'

export const DESTINATIONS = ['strength', 'performance', 'analytics', 'settings'] as const
export type Destination = typeof DESTINATIONS[number]
export type Screen = Destination | 'performance/calisthenics' | 'performance/calisthenics/history' | 'performance/calisthenics/pushups' | 'performance/calisthenics/pullups' | 'performance/calisthenics/muscleups' | 'performance/calisthenics/muscleups/requirement' | 'performance/calisthenics/muscleups/practice' | 'strength/history' | 'strength/library' | 'performance/cardio' | 'performance/cardio/history' | 'performance/cardio/activity' | 'performance/cardio/session' | 'performance/cardio/live'
export type AppRoute = { screen: Screen; workoutId?: string; cardioActivity?: CardioActivity; requirement?: MuscleupRequirement }
export function routeTab(screen: Screen): Destination {
  if (screen === 'performance/calisthenics/muscleups' || screen === 'performance/calisthenics/muscleups/requirement' || screen === 'performance/calisthenics/muscleups/practice' || screen === 'performance/calisthenics/pullups' || screen === 'performance/calisthenics/pushups' || screen === 'performance/calisthenics' || screen === 'performance/calisthenics/history' || screen === 'performance/cardio' || screen === 'performance/cardio/history' || screen === 'performance/cardio/activity' || screen === 'performance/cardio/session' || screen === 'performance/cardio/live') return 'performance'
  if (screen === 'strength/history' || screen === 'strength/library') return 'strength'
  return screen
}

export function routeFromHash(hash: string): AppRoute {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (path === 'history' || path === 'strength/history') return { screen: 'strength/history' }
  if (path === 'library' || path === 'strength/library') return { screen: 'strength/library' }
  const cardioSession = /^performance\/cardio\/history\/([\w-]+)$/.exec(path)
  if (cardioSession) return { screen: 'performance/cardio/session', workoutId: cardioSession[1] }
  if (path === 'performance/cardio/live') return { screen: 'performance/cardio/live' }
  if (path === 'performance/cardio/history') return { screen: 'performance/cardio/history' }
  if (path.startsWith('performance/cardio/')) {
    const activity = path.slice('performance/cardio/'.length)
    return isCardioActivity(activity) ? { screen: 'performance/cardio/activity', cardioActivity: activity } : { screen: 'performance/cardio' }
  }
  const calisthenicsWorkout = /^performance\/calisthenics\/(history|workout)\/([\w-]+)$/.exec(path)
  if (calisthenicsWorkout) return { screen: calisthenicsWorkout[1] === 'history' ? 'performance/calisthenics/history' : 'performance/calisthenics', workoutId: calisthenicsWorkout[2] }
  if (path === 'performance/calisthenics/pushups' || path === 'performance/calisthenics/pullups') return { screen: path }
  if (path === 'performance/calisthenics/muscleups' || path === 'performance/calisthenics/muscleups/practice') return { screen: path }
  const requirement = /^performance\/calisthenics\/muscleups\/requirement\/([^/]+)$/.exec(path)?.[1]
  if (requirement && isMuscleupRequirement(requirement)) return { screen: 'performance/calisthenics/muscleups/requirement', requirement }
  if (path.startsWith('performance/calisthenics/muscleups/')) return { screen: 'performance/calisthenics/muscleups' }
  if (path === 'performance/calisthenics/history') return { screen: 'performance/calisthenics/history' }
  if (path === 'performance/calisthenics') return { screen: 'performance/calisthenics' }
  if (path === 'performance/cardio') return { screen: 'performance/cardio' }
  const workout = /^strength\/(history|workout)\/([\w-]+)$/.exec(path)
  if (workout) return { screen: workout[1] === 'history' ? 'strength/history' : 'strength', workoutId: workout[2] }
  return { screen: (DESTINATIONS as readonly string[]).includes(path) ? path as Destination : 'strength' }
}

export function routeHash({ screen, workoutId, cardioActivity, requirement }: AppRoute): string {
  if (screen === 'performance/calisthenics/muscleups/requirement') return requirement ? `#/${screen}/${requirement}` : '#/performance/calisthenics/muscleups'
  if (workoutId && screen === 'performance/calisthenics') return `#/performance/calisthenics/workout/${workoutId}`
  if (workoutId && screen === 'performance/calisthenics/history') return `#/performance/calisthenics/history/${workoutId}`
  if (workoutId && screen === 'strength') return `#/strength/workout/${workoutId}`
  if (workoutId && screen === 'strength/history') return `#/strength/history/${workoutId}`
  if (screen === 'performance/cardio/session') return workoutId ? `#/performance/cardio/history/${workoutId}` : '#/performance/cardio/history'
  if (screen === 'performance/cardio/activity') return cardioActivity ? `#/performance/cardio/${cardioActivity}` : '#/performance/cardio'
  return `#/${screen}`
}

export function navigationDecision(safety: Safety & { applying: boolean }): 'allow' | 'wait' | 'confirm' {
  if (safety.busy || safety.restoring || safety.loading || safety.applying) return 'wait'
  return safety.dirty ? 'confirm' : 'allow'
}
