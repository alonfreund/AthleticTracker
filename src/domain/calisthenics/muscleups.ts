import { validateRepAttempt } from './pushups'
import { REP_TRACKS } from './repTracks'

export const MUSCLEUP_REQUIREMENTS = {
  pullups: { ...REP_TRACKS.pullups, title: 'Pull-ups', heading: '15 strict pull-ups', goal: 15, milestones: [15] },
  'hanging-l-sit': { title: 'Hanging L-sit', heading: '15-second hanging L-sit', goal: 15, unit: 'seconds', technique: 'Log the duration of one continuous hold.' },
  'straight-bar-dips': { title: 'Straight-bar dips', heading: '15 straight-bar dips', goal: 15 },
  'toes-to-bar': { title: 'Toes-to-bar', heading: '10 toes-to-bar', goal: 10 },
} as const

export type MuscleupRequirement = keyof typeof MUSCLEUP_REQUIREMENTS
export const REQUIREMENT_IDS = Object.keys(MUSCLEUP_REQUIREMENTS) as MuscleupRequirement[]

export function isMuscleupRequirement(value: string): value is MuscleupRequirement {
  return Object.hasOwn(MUSCLEUP_REQUIREMENTS, value)
}

export const MUSCLEUP_GOAL = { title: '3 Bar Muscle-ups', heading: '3 consecutive bar muscle-ups', goal: 3 }
export type MuscleupMovement = Exclude<MuscleupRequirement, 'pullups'> | 'muscleups'
export type MuscleupAttempt = { id: string; recordedAt: string; movement: MuscleupMovement; value: number; notes: string }

export const MUSCLEUP_DRILLS = ['Negative muscle-ups', 'Jumping muscle-ups', 'Magic buttons', 'L-sit pullbacks'] as const

export function validateMuscleupAttempt(input: unknown): asserts input is MuscleupAttempt {
  const row = input as Omit<MuscleupAttempt, 'movement'> & { movement: unknown }
  const invalid = 'Invalid muscle-up progression attempt.'
  if (!row || typeof row !== 'object' || Array.isArray(row) ||
    Object.keys(row).length !== 5 || !['id', 'recordedAt', 'movement', 'value', 'notes'].every(key => Object.hasOwn(row, key)) ||
    !(row.movement === 'muscleups' || (typeof row.movement === 'string' && isMuscleupRequirement(row.movement) && row.movement !== 'pullups'))) throw new Error(invalid)
  validateRepAttempt({ id: row.id, recordedAt: row.recordedAt, reps: row.value, notes: row.notes }, invalid)
}
