import type { Safety } from './updateSafety'
export const DESTINATIONS = ['train', 'history', 'library', 'settings'] as const
export type Destination = typeof DESTINATIONS[number]
export function destinationFromHash(hash: string): Destination {
  const value = hash.replace(/^#\/?/, '')
  return (DESTINATIONS as readonly string[]).includes(value) ? value as Destination : 'train'
}
export function destinationHash(destination: Destination): string { return `#/${destination}` }
export function navigationDecision(safety: Safety & { applying: boolean }): 'allow' | 'wait' | 'confirm' {
  if (safety.busy || safety.restoring || safety.loading || safety.applying) return 'wait'
  return safety.dirty ? 'confirm' : 'allow'
}
