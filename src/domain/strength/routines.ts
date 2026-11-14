import type { Exercise, StrengthSet, StrengthTarget, Tracking } from './models'

export interface Routine {
  id: string
  title: string
  notes: string
  supersets?: string[][]
  createdAt: string
  updatedAt: string
}

export interface RoutineExercise {
  id: string
  routineId: string
  exerciseId: string
  tracking: Tracking
  position: number
  sets: { setType: StrengthSet['setType']; target: StrengthTarget | null }[]
}

export function matchesRoutineTracking(row: Pick<RoutineExercise, 'tracking'>, exercise?: Exercise) {
  return !!exercise && !exercise.archived &&
    row.tracking.measurement === exercise.tracking.measurement &&
    row.tracking.load === exercise.tracking.load &&
    row.tracking.weightConvention === exercise.tracking.weightConvention
}

export function targetText(target: StrengthTarget) {
  const range = ({ min, max }: { min: number; max: number }) => min === max ? String(min) : `${min}–${max}`
  const load = target.load
  const mass = load?.mode === 'external' ? load.weight : load?.mode === 'added' ? load.addedWeight : load?.mode === 'assisted' ? load.assistance : null
  return [
    target.reps && `${range(target.reps)} reps`,
    target.durationSeconds && `${range(target.durationSeconds)} s`,
    mass && `${mass.value} ${mass.unit}${load?.mode === 'assisted' ? ' assistance' : load?.mode === 'added' ? ' added' : ''}`,
    target.rpe && `RPE ${range(target.rpe)}`,
    target.rir && `RIR ${range(target.rir)}`,
  ].filter(Boolean).join(' · ')
}
