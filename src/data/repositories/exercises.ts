import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { installCatalogue } from '../catalogue'
import { defaultMetadata } from '../../domain/strength/exerciseMetadata'
import { db, type AthleticDatabase } from '../db/database'
import type { Exercise } from '../../domain/strength/models'
import { validateExercise } from '../../domain/strength/validation'
import { MUSCLE_FILTER_GROUPS, EQUIPMENT_FILTER_GROUPS, MOVEMENT_PATTERNS } from '../../domain/strength/taxonomy'
import { CATEGORIES, EQUIPMENT, label, MUSCLES, trackingLabel } from '../../domain/strength/catalog'

export type ExerciseInput = Pick<Exercise, 'name' | 'primaryMuscleGroupIds' | 'secondaryMuscleGroupIds' | 'equipmentIds' | 'category' | 'instructions' | 'notes' | 'tracking' | 'defaultRestSeconds' | 'metadata'>
export type ExerciseSort = 'az' | 'za' | 'recent' | 'favourites'
export interface ExerciseFilters { query?: string; muscle?: string; equipment?: string; origin?: 'all' | 'custom' | 'bundled'; exerciseType?: string; movementPattern?: string; primaryOnly?: boolean; favouritesOnly?: boolean; sort?: ExerciseSort }
export interface ExerciseBrowseData {
  favourites: ReadonlySet<string>
  lastUsed: ReadonlyMap<string, number>
}
const emptyBrowseData: ExerciseBrowseData = { favourites: new Set(), lastUsed: new Map() }

export async function loadExerciseBrowseData(database: AthleticDatabase = db): Promise<ExerciseBrowseData> {
  const { exercisePreferences, sessions, sessionActivities, sessionExercises, strengthSets } = database
  return database.transaction('r', [exercisePreferences, sessions, sessionActivities, sessionExercises, strengthSets], async () => {
    const [preferences, workouts, activities, instances] = await Promise.all([
      exercisePreferences.toArray(), sessions.toArray(), sessionActivities.toArray(), sessionExercises.toArray(),
    ])
    const includedSessions = new Set(workouts.filter(workout => workout.status !== 'cancelled').map(workout => workout.id))
    const includedActivities = new Set(activities.filter(activity => includedSessions.has(activity.sessionId)).map(activity => activity.id))
    const exerciseIds = new Map(instances.filter(instance => includedActivities.has(instance.sessionActivityId))
      .map(instance => [instance.id, instance.sourceExerciseId]))
    const lastUsed = new Map<string, number>()
    await strengthSets.each(set => {
      const exerciseId = exerciseIds.get(set.sessionExerciseId)
      if (!exerciseId || !set.completed || !set.completedAt) return
      const timestamp = Date.parse(set.completedAt)
      if (Number.isFinite(timestamp) && timestamp > (lastUsed.get(exerciseId) ?? -Infinity)) lastUsed.set(exerciseId, timestamp)
    })
    return { favourites: new Set(preferences.filter(row => row.favourite).map(row => row.exerciseId)), lastUsed }
  })
}

const normalize = (value: string) => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().replace(/[()]/g, ' ').trim()

export async function initializeExerciseLibrary(database: AthleticDatabase = db) {
  return installCatalogue(undefined, database)
}
export function filterExercises(exercises: Exercise[], filters: ExerciseFilters, browse = emptyBrowseData, { prioritizeUsed = false } = {}): Exercise[] {
  const tokens = normalize(filters.query ?? '').split(/\s+/).filter(Boolean)
  return exercises.filter(exercise => {
    if (exercise.archived || (filters.origin && filters.origin !== 'all' && exercise.origin !== filters.origin)) return false
    if (filters.favouritesOnly && !browse.favourites.has(exercise.id)) return false
    const muscles = filters.primaryOnly ? exercise.primaryMuscleGroupIds : [...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds]
    if (filters.muscle && !(MUSCLE_FILTER_GROUPS[filters.muscle] ?? [filters.muscle]).some(id => muscles.includes(id))) return false
    if (filters.exerciseType && exercise.metadata?.exerciseType !== filters.exerciseType) return false
    if (filters.movementPattern && !exercise.metadata?.movementPatternIds.includes(filters.movementPattern)) return false
    if (filters.equipment && !(EQUIPMENT_FILTER_GROUPS[filters.equipment] ?? [filters.equipment]).some(id => exercise.equipmentIds.includes(id))) return false
    const haystack = normalize([
      exercise.name, exerciseDisplayName(exercise), ...(exercise.metadata?.aliases ?? []), ...(exercise.metadata?.movementPatternIds.map(id=>label(id,MOVEMENT_PATTERNS)) ?? []), label(exercise.category, CATEGORIES), exercise.category, trackingLabel(exercise.tracking),
      ...[...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds].map(id => label(id, MUSCLES)),
      ...exercise.equipmentIds.map(id => label(id, EQUIPMENT)),
    ].join(' '))
    return tokens.every(token => haystack.includes(token))
  }).sort((a, b) => {
    if (prioritizeUsed && tokens.length) {
      const priority = Number(browse.lastUsed.has(b.id)) - Number(browse.lastUsed.has(a.id))
      if (priority) return priority
    }
    if (filters.sort === 'recent') {
      const first = browse.lastUsed.get(a.id) ?? -Infinity
      const second = browse.lastUsed.get(b.id) ?? -Infinity
      if (first !== second) return first > second ? -1 : 1
    }
    if (filters.sort === 'favourites') {
      const priority = Number(browse.favourites.has(b.id)) - Number(browse.favourites.has(a.id))
      if (priority) return priority
    }
    const alphabetical = exerciseDisplayName(a).localeCompare(exerciseDisplayName(b), 'en', { sensitivity: 'base' })
    return alphabetical * (filters.sort === 'za' ? -1 : 1) || a.id.localeCompare(b.id)
  })
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
