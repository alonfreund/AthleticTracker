/** Activity-specific entries remain separate; extend the activity registry when a new module ships. */
export const STRENGTH_ACTIVITY = { id: 'strength', name: 'Strength training' } as const
export interface Timestamps { createdAt: string; updatedAt: string }
export interface Entity extends Timestamps { id: string }
export type WeightUnit = 'kg' | 'lb'
export interface Mass { value: number; unit: WeightUnit }
export function massInKilograms(mass: Mass): number { return mass.unit === 'kg' ? mass.value : mass.value * 0.45359237 }
export type Tracking = {
  measurement: 'reps' | 'duration'
  load: 'none' | 'external' | 'bodyweight' | 'added' | 'assisted'
  weightConvention: 'total' | 'per-hand' | 'machine-display' | null
}
export interface ExerciseMetadata {
  version: 1
  aliases: string[]
  familyId: string | null
  exerciseType: 'compound' | 'isolation' | 'stability' | 'conditioning' | 'unspecified'
  movementPatternIds: string[]
  optionalEquipmentIds: string[]
  variant: { grip: string | null; angle: string | null; stance: string | null; support: string | null; execution: string | null }
  repetitionConvention: 'unspecified' | 'total' | 'per-side'
}
export interface ExercisePreference extends Timestamps {
  exerciseId: string
  restSeconds: number | null
  favourite: boolean
}
export interface CatalogueState {
  exerciseId: string
  appliedRevision: number
  fingerprint: string
  status: 'managed' | 'preserved'
}
export interface Exercise extends Entity {
  /** Absent only on legacy snapshots/definitions; never filled from the live library. */
  metadata?: ExerciseMetadata
  revision: number
  origin: 'bundled' | 'custom'
  name: string
  primaryMuscleGroupIds: string[]
  secondaryMuscleGroupIds: string[]
  equipmentIds: string[]
  category: string
  instructions: string
  notes: string
  tracking: Tracking
  defaultRestSeconds: number | null
  archived: boolean
}
export interface Session extends Entity {
  title: string
  status: 'active' | 'finished' | 'cancelled'
  startedAt: string
  endedAt: string | null
  notes: string
}
export interface SessionActivity extends Entity {
  sessionId: string
  activityType: 'strength' | 'cardio'
  position: number
}
export interface SessionExercise extends Entity {
  sessionActivityId: string
  sourceExerciseId: string | null
  snapshot: Exercise
  position: number
  notes: string
  restSeconds: number | null
  supersetGroupId: string | null
  supersetSlotId?: string
}
export type StrengthLoad =
  | { mode: 'none' }
  | { mode: 'external'; weight: Mass | null }
  | { mode: 'bodyweight'; bodyweight: Mass | null }
  | { mode: 'added'; addedWeight: Mass | null; bodyweight: Mass | null }
  | { mode: 'assisted'; assistance: Mass | null; bodyweight: Mass | null }
export interface Range { min: number; max: number }
export interface StrengthTarget {
  reps: Range | null
  durationSeconds: Range | null
  load: StrengthLoad | null
  rpe: Range | null
  rir: Range | null
}
export interface StrengthSet extends Entity {
  sessionExerciseId: string
  position: number
  setType: 'normal' | 'warm-up' | 'failure' | 'drop-set' | 'back-off' | 'amrap'
  completed: boolean
  completedAt: string | null
  reps: number | null
  durationSeconds: number | null
  load: StrengthLoad
  rpe: number | null
  rir: number | null
  target: StrengthTarget | null
  supersetRoundIndex?: number
}
export interface SupersetGroup extends Entity {
  sessionActivityId: string
  name: string
  betweenExerciseRestSeconds: number
  betweenRoundRestSeconds: number
}
/** One rest timer per session. Running deadlines survive app suspension. */
export interface RestTimer extends Timestamps {
  sessionId: string
  sourceSetId: string | null
  status: 'running' | 'paused' | 'finished' | 'skipped'
  deadline: string | null
  remainingSeconds: number | null
}
/** Raw in-progress input is isolated from validated performance measurements. */
export interface EditorDraft extends Entity {
  sessionId: string
  setId: string
  values: { weight: string; bodyweight: string; reps: string; durationSeconds: string; rpe: string; rir: string }
  weightUnit: WeightUnit
}
export interface StrengthData {
  exercises: Exercise[]
  sessions: Session[]
  sessionActivities: SessionActivity[]
  sessionExercises: SessionExercise[]
  strengthSets: StrengthSet[]
  supersetGroups: SupersetGroup[]
  restTimers: RestTimer[]
  editorDrafts: EditorDraft[]
}
export const STRENGTH_TABLES = ['exercises', 'sessions', 'sessionActivities', 'sessionExercises', 'strengthSets', 'supersetGroups', 'restTimers', 'editorDrafts'] as const
export function emptyStrengthData(): StrengthData {
  return { exercises: [], sessions: [], sessionActivities: [], sessionExercises: [], strengthSets: [], supersetGroups: [], restTimers: [], editorDrafts: [] }
}
export function snapshotExercise(exercise: Exercise): Exercise { return structuredClone(exercise) }
