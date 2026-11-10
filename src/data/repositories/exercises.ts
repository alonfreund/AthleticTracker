import { db, type AthleticDatabase } from '../db/database'
import type { Exercise } from '../../domain/strength/models'
import { validateExercise } from '../../domain/strength/validation'
import { CATEGORIES, EQUIPMENT, label, MUSCLES, STARTER_EXERCISES, trackingLabel } from '../../domain/strength/catalog'

export type ExerciseInput = Pick<Exercise, 'name' | 'primaryMuscleGroupIds' | 'secondaryMuscleGroupIds' | 'equipmentIds' | 'category' | 'instructions' | 'notes' | 'tracking' | 'defaultRestSeconds'>
export interface ExerciseFilters { query?: string; muscle?: string; equipment?: string; origin?: 'all' | 'custom' | 'bundled' }
const normalize = (value: string) => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim()

export async function initializeExerciseLibrary(database: AthleticDatabase = db): Promise<void> {
  await database.transaction('rw', database.exercises, async () => {
    const existing = await database.exercises.bulkGet(STARTER_EXERCISES.map(exercise => exercise.id))
    const missing = STARTER_EXERCISES.filter((_exercise, index) => !existing[index])
    missing.forEach(validateExercise)
    if (missing.length) await database.exercises.bulkAdd(structuredClone(missing))
  })
}
export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
  const tokens = normalize(filters.query ?? '').split(/\s+/).filter(Boolean)
  return exercises.filter(exercise => {
    if (exercise.archived || (filters.origin && filters.origin !== 'all' && exercise.origin !== filters.origin)) return false
    if (filters.muscle && ![...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds].includes(filters.muscle)) return false
    if (filters.equipment && !exercise.equipmentIds.includes(filters.equipment)) return false
    const haystack = normalize([
      exercise.name, label(exercise.category, CATEGORIES), exercise.category, trackingLabel(exercise.tracking),
      ...[...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds].map(id => label(id, MUSCLES)),
      ...exercise.equipmentIds.map(id => label(id, EQUIPMENT)),
    ].join(' '))
    return tokens.every(token => haystack.includes(token))
  }).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id))
}
export async function listExercises(database: AthleticDatabase = db): Promise<Exercise[]> { return database.exercises.toArray() }
export async function createCustomExercise(input: ExerciseInput, database: AthleticDatabase = db): Promise<Exercise> {
  const now = new Date().toISOString()
  const exercise: Exercise = {
    ...structuredClone(input), name: input.name.trim(), category: input.category.trim(),
    instructions: input.instructions.trim(), notes: input.notes.trim(),
    id: crypto.randomUUID(), createdAt: now, updatedAt: now, origin: 'custom', revision: 1, archived: false,
  }
  if (!exercise.primaryMuscleGroupIds.length) throw new Error('Choose at least one primary muscle group.')
  validateExercise(exercise)
  await database.transaction('rw', database.exercises, () => database.exercises.add(exercise))
  return exercise
}
