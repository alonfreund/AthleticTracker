import type { Safety } from './updateSafety'

export const DESTINATIONS = ['strength', 'performance', 'analytics', 'settings'] as const
export type Destination = typeof DESTINATIONS[number]
export type Screen = Destination | 'strength/history' | 'strength/library'
export type AppRoute = { screen: Screen; workoutId?: string }
export const routeTab = (screen: Screen): Destination => screen === 'strength/history' || screen === 'strength/library' ? 'strength' : screen

export function routeFromHash(hash: string): AppRoute {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (path === 'history' || path === 'strength/history') return { screen: 'strength/history' }
  if (path === 'library' || path === 'strength/library') return { screen: 'strength/library' }
  const workout = /^strength\/(history|workout)\/([\w-]+)$/.exec(path)
  if (workout) return { screen: workout[1] === 'history' ? 'strength/history' : 'strength', workoutId: workout[2] }
  return { screen: (DESTINATIONS as readonly string[]).includes(path) ? path as Destination : 'strength' }
}

export function routeHash({ screen, workoutId }: AppRoute): string {
  if (workoutId && screen === 'strength') return `#/strength/workout/${workoutId}`
  if (workoutId && screen === 'strength/history') return `#/strength/history/${workoutId}`
  return `#/${screen}`
}

export function navigationDecision(safety: Safety & { applying: boolean }): 'allow' | 'wait' | 'confirm' {
  if (safety.busy || safety.restoring || safety.loading || safety.applying) return 'wait'
  return safety.dirty ? 'confirm' : 'allow'
}
