import { installCatalogue } from '../catalogue'
import { defaultMetadata } from '../../domain/strength/exerciseMetadata'
import { db, type AthleticDatabase } from '../db/database'
import type { Exercise } from '../../domain/strength/models'
import { validateExercise } from '../../domain/strength/validation'
import { MUSCLE_FILTER_GROUPS, EQUIPMENT_FILTER_GROUPS, MOVEMENT_PATTERNS } from '../../domain/strength/taxonomy'
import { CATEGORIES, EQUIPMENT, label, MUSCLES, trackingLabel } from '../../domain/strength/catalog'

export type ExerciseInput = Pick<Exercise, 'name' | 'primaryMuscleGroupIds' | 'secondaryMuscleGroupIds' | 'equipmentIds' | 'category' | 'instructions' | 'notes' | 'tracking' | 'defaultRestSeconds' | 'metadata'>
export interface ExerciseFilters { query?: string; muscle?: string; equipment?: string; origin?: 'all' | 'custom' | 'bundled'; exerciseType?: string; movementPattern?: string; primaryOnly?: boolean }
const normalize = (value: string) => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim()

export async function initializeExerciseLibrary(database: AthleticDatabase = db) {
  return installCatalogue(undefined, database)
}
export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
  const tokens = normalize(filters.query ?? '').split(/\s+/).filter(Boolean)
  return exercises.filter(exercise => {
    if (exercise.archived || (filters.origin && filters.origin !== 'all' && exercise.origin !== filters.origin)) return false
    const muscles = filters.primaryOnly ? exercise.primaryMuscleGroupIds : [...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds]
    if (filters.muscle && !(MUSCLE_FILTER_GROUPS[filters.muscle] ?? [filters.muscle]).some(id => muscles.includes(id))) return false
    if (filters.exerciseType && exercise.metadata?.exerciseType !== filters.exerciseType) return false
    if (filters.movementPattern && !exercise.metadata?.movementPatternIds.includes(filters.movementPattern)) return false
    if (filters.equipment && !(EQUIPMENT_FILTER_GROUPS[filters.equipment] ?? [filters.equipment]).some(id => exercise.equipmentIds.includes(id))) return false
    const haystack = normalize([
      exercise.name, ...(exercise.metadata?.aliases ?? []), ...(exercise.metadata?.movementPatternIds.map(id=>label(id,MOVEMENT_PATTERNS)) ?? []), label(exercise.category, CATEGORIES), exercise.category, trackingLabel(exercise.tracking),
      ...[...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds].map(id => label(id, MUSCLES)),
      ...exercise.equipmentIds.map(id => label(id, EQUIPMENT)),
    ].join(' '))
    return tokens.every(token => haystack.includes(token))
  }).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id))
}
export async function listExercises(database: AthleticDatabase = db): Promise<Exercise[]> { return database.exercises.toArray() }
export async function createCustomExercise(input: ExerciseInput, database: AthleticDatabase = db): Promise<Exercise> {
  const now = new Date().toISOString()
  const restSeconds = input.defaultRestSeconds
  const exercise: Exercise = {
    ...structuredClone(input), name: input.name.trim(), category: input.category.trim(),
    instructions: input.instructions.trim(), notes: input.notes.trim(),
    metadata: structuredClone(input.metadata ?? defaultMetadata(input)), defaultRestSeconds: null,
    id: crypto.randomUUID(), createdAt: now, updatedAt: now, origin: 'custom', revision: 1, archived: false,
  }
  if (!exercise.primaryMuscleGroupIds.length) throw new Error('Choose at least one primary muscle group.')
  validateExercise(exercise)
  await database.transaction('rw', database.exercises, database.exercisePreferences, async () => {
    // Validate the supplied rest preference independently of the catalogue definition.
    if (restSeconds !== null && (!Number.isFinite(restSeconds) || restSeconds < 0)) throw new Error('Invalid rest duration.')
    await database.exercises.add(exercise)
    await database.exercisePreferences.add({ exerciseId: exercise.id, restSeconds, favourite: false, createdAt: now, updatedAt: now })
  })
  return exercise
}
