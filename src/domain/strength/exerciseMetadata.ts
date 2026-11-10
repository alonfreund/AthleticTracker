import type { Exercise, ExerciseMetadata, ExercisePreference } from './models'
import { EXERCISE_TYPES } from './taxonomy'
export function defaultMetadata(exercise: Pick<Exercise, 'category'>): ExerciseMetadata {
  const category = exercise.category
  return {
    version: 1, aliases: [], familyId: null,
    exerciseType: category === 'bodyweight' ? 'compound' : category === 'isometric' ? 'stability' : Object.hasOwn(EXERCISE_TYPES, category) ? category as ExerciseMetadata['exerciseType'] : 'unspecified',
    movementPatternIds: [], optionalEquipmentIds: [], variant: { grip: null, angle: null, stance: null, support: null, execution: null }, repetitionConvention: 'unspecified',
  }
}
/** Convert definitions only. Workout snapshots are deliberately never passed here. */
export function normalizeDefinition(exercise: Exercise): Exercise { return { ...structuredClone(exercise), metadata: structuredClone(exercise.metadata ?? defaultMetadata(exercise)), defaultRestSeconds: null } }
export function legacyPreference(exercise: Exercise): ExercisePreference {
  return { exerciseId: exercise.id, restSeconds: exercise.defaultRestSeconds, favourite: false, createdAt: exercise.createdAt, updatedAt: exercise.updatedAt }
}
/** Canonical baseline excludes bookkeeping and the deprecated rest field. */
export function exerciseFingerprint(exercise: Exercise): string {
  const { id, revision, createdAt, updatedAt, defaultRestSeconds, ...definition } = normalizeDefinition(exercise)
  void id; void revision; void createdAt; void updatedAt; void defaultRestSeconds
  const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,canonical(value)])) : value
  return JSON.stringify(canonical(definition))
}
