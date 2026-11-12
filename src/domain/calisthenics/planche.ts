import { isMeasurementValue, type MeasurementUnit } from './measurement'
import { validateRepAttempt } from './pushups'

type Movement = { heading: string; unit: MeasurementUnit; milestones: readonly number[]; technique?: string; subtitle?: string }

export const PLANCHE_MOVEMENTS = {
  'straight-arm-dumbbell-flies': { heading: 'Straight-arm dumbbell flies', unit: 'kg', milestones: [6, 8, 10], technique: '5/5/5', subtitle: '5/5/5' },
  'reverse-leg-raises': { heading: 'Reverse leg raises', unit: 'reps', milestones: [3, 8, 12, 16, 20] },
  'planche-leans': { heading: 'Planche leans', unit: 'reps', milestones: [3, 8, 12, 16, 20] },
  'planche-lean-holds': { heading: 'Planche lean holds', unit: 'seconds', milestones: [5, 10, 15, 20] },
  'l-sit-to-tuck-planche': { heading: 'L-sit to tuck planche', unit: 'reps', milestones: [1, 3, 5, 10, 15] },
  'tuck-planche-hold': { heading: 'Tuck planche hold', unit: 'seconds', milestones: [3, 5, 10, 15, 20] },
  'l-sit-to-full-planche': { heading: 'L-sit to full planche', unit: 'reps', milestones: [1] },
  'full-planche-raises': { heading: 'Full planche raises', unit: 'seconds', milestones: [], technique: 'Log how long you held the position after raising your legs.' },
} as const satisfies Record<string, Movement>

export type PlancheMovement = keyof typeof PLANCHE_MOVEMENTS
export const PLANCHE_ORDER = Object.keys(PLANCHE_MOVEMENTS) as PlancheMovement[]
export type PlancheAttempt = { id: string; recordedAt: string; movement: PlancheMovement; value: number; notes: string }

export function isPlancheMovement(value: string): value is PlancheMovement {
  return Object.hasOwn(PLANCHE_MOVEMENTS, value)
}

export function validatePlancheAttempt(input: unknown): asserts input is PlancheAttempt {
  const row = input as Omit<PlancheAttempt, 'movement'> & { movement: unknown }
  const invalid = 'Invalid planche attempt.'
  if (!row || typeof row !== 'object' || Array.isArray(row) ||
    Object.keys(row).length !== 5 || !['id', 'recordedAt', 'movement', 'value', 'notes'].every(key => Object.hasOwn(row, key)) ||
    typeof row.movement !== 'string' || !isPlancheMovement(row.movement) ||
    !isMeasurementValue(row.value, PLANCHE_MOVEMENTS[row.movement].unit)) throw new Error(invalid)
  validateRepAttempt({ id: row.id, recordedAt: row.recordedAt, reps: 0, notes: row.notes }, invalid)
}
