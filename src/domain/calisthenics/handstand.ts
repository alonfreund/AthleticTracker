import { isMeasurementValue } from './measurement'
import { validateRepAttempt } from './pushups'

export const HANDSTAND_MOVEMENTS = {
  'pike-hold': { heading: 'Pike hold', unit: 'seconds', milestones: [10, 20, 30] },
  'elevated-pike-hold': { heading: 'Elevated pike hold', unit: 'seconds', milestones: [10, 20, 30] },
  'wall-walks': { heading: 'Wall walks', unit: 'steps', milestones: [8, 6, 4], lowerIsBetter: true,
    technique: 'Count each hand movement toward the wall. Use the same push-up starting position and full-height endpoint each time.' },
  'wall-handstand-hold': { heading: 'Wall handstand hold', unit: 'seconds', milestones: [5, 10, 15, 20] },
  'handstand-kick-up': { heading: 'Handstand kick-up from push-up position', unit: 'reps', milestones: [1, 3, 5, 10] },
  'balance-off-wall': { heading: 'Balance off the wall', unit: 'seconds', milestones: [3, 5, 10, 15, 20] },
  'freestanding-handstand': { heading: 'Freestanding handstand', unit: 'seconds', milestones: [3, 5, 10, 15, 20, 25, 30], goal: 30 },
} as const

export type HandstandMovement = keyof typeof HANDSTAND_MOVEMENTS
export const HANDSTAND_ORDER = Object.keys(HANDSTAND_MOVEMENTS) as HandstandMovement[]
export type HandstandAttempt = { id: string; recordedAt: string; movement: HandstandMovement; value: number; notes: string }

export function isHandstandMovement(value: string): value is HandstandMovement {
  return Object.hasOwn(HANDSTAND_MOVEMENTS, value)
}

export function validateHandstandAttempt(input: unknown): asserts input is HandstandAttempt {
  const row = input as Omit<HandstandAttempt, 'movement'> & { movement: unknown }
  const invalid = 'Invalid handstand attempt.'
  if (!row || typeof row !== 'object' || Array.isArray(row) ||
    Object.keys(row).length !== 5 || !['id', 'recordedAt', 'movement', 'value', 'notes'].every(key => Object.hasOwn(row, key)) ||
    typeof row.movement !== 'string' || !isHandstandMovement(row.movement) ||
    !isMeasurementValue(row.value, HANDSTAND_MOVEMENTS[row.movement].unit)) throw new Error(invalid)
  validateRepAttempt({ id: row.id, recordedAt: row.recordedAt, reps: 0, notes: row.notes }, invalid)
}
