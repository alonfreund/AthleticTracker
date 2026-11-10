export const DEFAULT_REST_SECONDS = 90
export const GLOBAL_REST_KEY = 'defaultRestSeconds'
// A practical ceiling protects timer dates and accidental oversized input: 7 days.
export const MAX_REST_SECONDS = 7 * 24 * 60 * 60
export function validateRestSeconds(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_REST_SECONDS) throw new Error('Enter a duration from 0 to 10,080 minutes, in whole seconds.')
  return value
}
export function durationFromFields(minutes: string, seconds: string): number {
  if (!/^\d+$/.test(minutes || '0') || !/^\d+$/.test(seconds || '0')) throw new Error('Enter whole minutes and seconds.')
  return validateRestSeconds(Number(minutes || 0) * 60 + Number(seconds || 0))
}
export function restText(seconds: number): string { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
