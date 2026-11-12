import { isMeasurementValue } from './measurement'
import { validateRepAttempt } from './pushups'

export const FRONT_LEVER_MOVEMENTS = {
  'tuck-front-lever-hold': { heading: 'Tuck front lever hold', unit: 'seconds', milestones: [5, 10, 15, 20] },
  'advanced-tuck-front-lever-hold': { heading: 'Advanced tuck front lever hold', unit: 'seconds', milestones: [3, 5, 8, 12, 15] },
  'one-leg-front-lever-hold': { heading: 'One-leg front lever hold', unit: 'seconds', milestones: [3, 5, 8, 10] },
  'straddle-front-lever-hold': { heading: 'Straddle front lever hold', unit: 'seconds', milestones: [3, 5, 8, 10] },
  'full-front-lever-hold': { heading: 'Full front lever hold', unit: 'seconds', milestones: [1, 3, 5, 8, 10], goal: 10 },
} as const

export type FrontLeverMovement = keyof typeof FRONT_LEVER_MOVEMENTS
export const FRONT_LEVER_ORDER = Object.keys(FRONT_LEVER_MOVEMENTS) as FrontLeverMovement[]
export type FrontLeverAttempt = { id: string; recordedAt: string; movement: FrontLeverMovement; value: number; notes: string }

export function isFrontLeverMovement(value: string): value is FrontLeverMovement {
  return Object.hasOwn(FRONT_LEVER_MOVEMENTS, value)
}

export function validateFrontLeverAttempt(input: unknown): asserts input is FrontLeverAttempt {
  const row = input as Omit<FrontLeverAttempt, 'movement'> & { movement: unknown }
  const invalid = 'Invalid front lever attempt.'
  if (!row || typeof row !== 'object' || Array.isArray(row) ||
    Object.keys(row).length !== 5 || !['id', 'recordedAt', 'movement', 'value', 'notes'].every(key => Object.hasOwn(row, key)) ||
    typeof row.movement !== 'string' || !isFrontLeverMovement(row.movement) ||
    !isMeasurementValue(row.value, 'seconds')) throw new Error(invalid)
  validateRepAttempt({ id: row.id, recordedAt: row.recordedAt, reps: 0, notes: row.notes }, invalid)
}
