import type { Table } from 'dexie'
import { exerciseRest } from './preferences'
import { validateRestSeconds } from '../../domain/rest'
import { db, type AthleticDatabase } from '../db/database'
import { STRENGTH_TABLES, snapshotExercise, type Session, type StrengthData, type StrengthSet } from '../../domain/strength/models'
import { validateStrengthData } from '../../domain/strength/validation'
import { emptyLoad, measurements, type SetInput } from '../../domain/strength/logging'
export type Workout = StrengthData
const tables = (database: AthleticDatabase) => [database.metadata, database.exercisePreferences, ...STRENGTH_TABLES.map(name => database[name])]
async function readWorkout(id: string, database: AthleticDatabase): Promise<Workout> {
  const session = await database.sessions.get(id)
  if (!session) throw new Error('Workout no longer exists. Return to Workouts and reopen it.')
  const activities = await database.sessionActivities.where('sessionId').equals(id).toArray()
  const activityIds = activities.map(row => row.id)
  const exercises = activityIds.length ? await database.sessionExercises.where('sessionActivityId').anyOf(activityIds).toArray() : []
  const exerciseIds = exercises.map(row => row.id)
  return {
    exercises: [], sessions: [session], sessionActivities: activities,
    sessionExercises: exercises.sort((a, b) => a.position - b.position),
    strengthSets: exerciseIds.length ? await database.strengthSets.where('sessionExerciseId').anyOf(exerciseIds).toArray() : [],
    supersetGroups: activityIds.length ? await database.supersetGroups.where('sessionActivityId').anyOf(activityIds).toArray() : [],
    restTimers: await database.restTimers.where('sessionId').equals(id).toArray(),
    editorDrafts: await database.editorDrafts.where('sessionId').equals(id).toArray(),
  }
}
export function loadWorkout(id: string, database = db): Promise<Workout> { return database.transaction('r', tables(database), () => readWorkout(id, database)) }
export function activeWorkout(database = db): Promise<Session | undefined> { return database.sessions.where('status').equals('active').first() }
export function listWorkouts(database = db): Promise<Session[]> { return database.sessions.orderBy('startedAt').reverse().toArray() }
function clock(workout: Workout): string {
  const session = workout.sessions[0]
  return new Date(Math.max(Date.now(), Date.parse(session.startedAt), Date.parse(session.updatedAt), ...workout.strengthSets.flatMap(set => [Date.parse(set.updatedAt), set.completedAt ? Date.parse(set.completedAt) : 0]))).toISOString()
}
async function mutate<T>(id: string, action: (workout: Workout, now: string) => Promise<T> | T, database: AthleticDatabase): Promise<T> {
  return database.transaction('rw', tables(database), async () => {
    const workout = await readWorkout(id, database)
    if (workout.sessions[0].status !== 'active') throw new Error('Only active workouts can be changed.')
    const before = structuredClone(workout)
    const now = clock(workout)
    const result = await action(workout, now)
    workout.sessions[0].updatedAt = now
    validateStrengthData(workout)
    for (const name of STRENGTH_TABLES) {
      if (name === 'exercises') continue // Library rows and snapshots are never rewritten together.
      const key = name === 'restTimers' ? 'sessionId' : 'id'
      const oldRows = new Map(before[name].map(row => [(row as unknown as Record<string, string>)[key], row]))
      const newRows = new Map(workout[name].map(row => [(row as unknown as Record<string, string>)[key], row]))
      const table: Table = database[name]
      const removed = [...oldRows.keys()].filter(id => !newRows.has(id))
      if (removed.length) await table.bulkDelete(removed)
      const changed = [...newRows].filter(([id, row]) => JSON.stringify(oldRows.get(id)) !== JSON.stringify(row)).map(([, row]) => row)
      if (changed.length) await table.bulkPut(changed)
    }
    return result
  })
}
export async function startWorkout(database = db): Promise<string> {
  return database.transaction('rw', database.sessions, database.sessionActivities, async () => {
    const active = await database.sessions.where('status').equals('active').first()
    if (active) return active.id
    const now = new Date().toISOString(); const id = crypto.randomUUID()
    await database.sessions.add({ id, createdAt: now, updatedAt: now, title: 'Strength workout', status: 'active', startedAt: now, endedAt: null, notes: '' })
    await database.sessionActivities.add({ id: crypto.randomUUID(), sessionId: id, activityType: 'strength', position: 0, createdAt: now, updatedAt: now })
    return id
  })
}
export function saveWorkoutDetails(id: string, title: string, notes: string, database = db) {
  return mutate(id, workout => {
    if (!title.trim() || title.trim().length > 200) throw new Error('Give the workout a name between 1 and 200 characters.')
    workout.sessions[0].title = title.trim(); workout.sessions[0].notes = notes
  }, database)
}
function newSet(exerciseId: string, mode: Parameters<typeof emptyLoad>[0], position: number, now: string): StrengthSet {
  return { id: crypto.randomUUID(), sessionExerciseId: exerciseId, position, setType: 'normal', completed: false, completedAt: null, reps: null, durationSeconds: null, load: emptyLoad(mode), rpe: null, rir: null, target: null, createdAt: now, updatedAt: now }
}
export function addWorkoutExercise(id: string, sourceId: string, database = db) {
  return mutate(id, async (workout, now) => {
    const source = await database.exercises.get(sourceId)
    if (!source || source.archived) throw new Error('Choose an available library exercise.')
    const activity = workout.sessionActivities[0]
    if (!activity) throw new Error('This workout has no strength activity.')
    const exerciseId = crypto.randomUUID()
    workout.sessionExercises.push({ id: exerciseId, sessionActivityId: activity.id, sourceExerciseId: source.id, snapshot: snapshotExercise(source), position: workout.sessionExercises.length ? Math.max(...workout.sessionExercises.map(row => row.position)) + 1 : 0, notes: '', restSeconds: await exerciseRest(source.id, database), supersetGroupId: null, createdAt: now, updatedAt: now })
    workout.strengthSets.push(newSet(exerciseId, source.tracking.load, 0, now))
    return exerciseId
  }, database)
}
export function addSet(id: string, exerciseId: string, database = db) {
  return mutate(id, (workout, now) => {
    const exercise = workout.sessionExercises.find(row => row.id === exerciseId)
    if (!exercise) throw new Error('Exercise no longer exists.')
    const rows = workout.strengthSets.filter(row => row.sessionExerciseId === exerciseId)
    const set = newSet(exerciseId, exercise.snapshot.tracking.load, rows.length ? Math.max(...rows.map(row => row.position)) + 1 : 0, now)
    workout.strengthSets.push(set); return set.id
  }, database)
}
export function saveSetDraft(id: string, setId: string, input: SetInput, database = db) {
  return mutate(id, (workout, now) => {
    if (!workout.strengthSets.some(row => row.id === setId)) throw new Error('Set no longer exists.')
    const existing = workout.editorDrafts.find(row => row.setId === setId)
    const draft = { ...structuredClone(input), id: existing?.id ?? crypto.randomUUID(), sessionId: id, setId, createdAt: existing?.createdAt ?? now, updatedAt: now }
    workout.editorDrafts = workout.editorDrafts.filter(row => row.setId !== setId); workout.editorDrafts.push(draft)
  }, database)
}
export function discardSetDraft(id: string, setId: string, database = db) { return mutate(id, workout => { workout.editorDrafts = workout.editorDrafts.filter(row => row.setId !== setId) }, database) }
export function commitSet(id: string, setId: string, input: SetInput, complete: boolean, database = db) {
  return mutate(id, (workout, now) => {
    const set = workout.strengthSets.find(row => row.id === setId)
    const exercise = workout.sessionExercises.find(row => row.id === set?.sessionExerciseId)
    if (!set || !exercise) throw new Error('Set no longer exists.')
    const wasComplete = set.completed
    Object.assign(set, measurements(input, exercise.snapshot.tracking), { completed: complete, completedAt: complete ? (set.completedAt ?? now) : null, updatedAt: now })
    workout.editorDrafts = workout.editorDrafts.filter(row => row.setId !== setId)
    if (!complete) stopTimer(workout, [setId], now)
    else if (!wasComplete) startRest(workout, exercise, setId, now)
  }, database)
}
export function changeSetType(id: string, setId: string, type: StrengthSet['setType'], database = db) {
  return mutate(id, (workout, now) => { const set = workout.strengthSets.find(row => row.id === setId); if (!set) throw new Error('Set no longer exists.'); set.setType = type; set.updatedAt = now }, database)
}
function stopTimer(workout: Workout, removedIds: string[], now: string) {
  for (const timer of workout.restTimers) if (timer.sourceSetId && removedIds.includes(timer.sourceSetId)) Object.assign(timer, { sourceSetId: null, status: 'skipped', deadline: null, remainingSeconds: 0, updatedAt: now })
}
export function removeSet(id: string, setId: string, database = db) {
  return mutate(id, (workout, now) => { workout.strengthSets = workout.strengthSets.filter(row => row.id !== setId); workout.editorDrafts = workout.editorDrafts.filter(row => row.setId !== setId); stopTimer(workout, [setId], now) }, database)
}
export function removeWorkoutExercise(id: string, exerciseId: string, database = db) {
  return mutate(id, (workout, now) => {
    const removed = workout.strengthSets.filter(row => row.sessionExerciseId === exerciseId).map(row => row.id)
    workout.strengthSets = workout.strengthSets.filter(row => row.sessionExerciseId !== exerciseId)
    workout.editorDrafts = workout.editorDrafts.filter(row => !removed.includes(row.setId))
    workout.sessionExercises = workout.sessionExercises.filter(row => row.id !== exerciseId)
    for (const group of workout.supersetGroups) if (workout.sessionExercises.filter(row => row.supersetGroupId === group.id).length < 2) {
      workout.sessionExercises.forEach(row => { if (row.supersetGroupId === group.id) { row.supersetGroupId = null; row.updatedAt = now } })
      workout.supersetGroups = workout.supersetGroups.filter(row => row.id !== group.id)
    }
    stopTimer(workout, removed, now)
  }, database)
}
export function moveWorkoutItem(id: string, kind: 'exercise' | 'set', itemId: string, direction: -1 | 1, database = db) {
  return mutate(id, (workout, now) => {
    const items = kind === 'exercise' ? workout.sessionExercises : workout.strengthSets
    const item = items.find(row => row.id === itemId)
    if (!item) throw new Error('Item no longer exists.')
    const siblings = items.filter(row => kind === 'exercise' || (row as StrengthSet).sessionExerciseId === (item as StrengthSet).sessionExerciseId).sort((a, b) => a.position - b.position)
    const at = siblings.findIndex(row => row.id === itemId); const other = siblings[at + direction]
    if (other) { [item.position, other.position] = [other.position, item.position]; item.updatedAt = now; other.updatedAt = now }
  }, database)
}
export function finishWorkout(id: string, allowIncomplete = false, database = db) {
  return mutate(id, (workout, now) => {
    if (workout.editorDrafts.length) throw new Error('Save values or discard the pending set edits before finishing.')
    if (!workout.strengthSets.some(row => row.completed)) throw new Error('Complete at least one set before finishing, or cancel the workout.')
    if (!allowIncomplete && workout.strengthSets.some(row => !row.completed)) throw new Error('Review unfinished sets before finishing.')
    Object.assign(workout.sessions[0], { status: 'finished', endedAt: now })
    for (const timer of workout.restTimers) Object.assign(timer, { status: 'finished', deadline: null, remainingSeconds: 0, updatedAt: now })
  }, database)
}
export function cancelWorkout(id: string, database = db) {
  return mutate(id, (workout, now) => {
    Object.assign(workout.sessions[0], { status: 'cancelled', endedAt: now }); workout.editorDrafts = []
    for (const timer of workout.restTimers) Object.assign(timer, { status: 'skipped', deadline: null, remainingSeconds: 0, updatedAt: now })
  }, database)
}

function startRest(workout: Workout, exercise: Workout['sessionExercises'][number], setId: string, now: string) {
  const seconds = exercise.restSeconds ?? exercise.snapshot.defaultRestSeconds
  const previous = workout.restTimers[0]
  workout.restTimers = [{ sessionId: workout.sessions[0].id, sourceSetId: setId,
    status: seconds ? 'running' : 'skipped', deadline: seconds ? new Date(Date.parse(now) + seconds * 1000).toISOString() : null,
    remainingSeconds: seconds ? null : 0, createdAt: previous?.createdAt ?? now, updatedAt: now }]
}
/** Raw text and valid measurements are saved together. Invalid text remains recoverable. */
export function saveInlineSet(id: string, setId: string, input: SetInput, complete?: boolean, database = db) {
  return mutate(id, (workout, now) => {
    const set = workout.strengthSets.find(row => row.id === setId)
    const exercise = workout.sessionExercises.find(row => row.id === set?.sessionExerciseId)
    if (!set || !exercise) throw new Error('Set no longer exists.')
    const oldDraft = workout.editorDrafts.find(row => row.setId === setId)
    workout.editorDrafts = workout.editorDrafts.filter(row => row.setId !== setId)
    workout.editorDrafts.push({ ...structuredClone(input), id: oldDraft?.id ?? crypto.randomUUID(), sessionId: id, setId, createdAt: oldDraft?.createdAt ?? now, updatedAt: now })
    const candidate = structuredClone(workout)
    const next = candidate.strengthSets.find(row => row.id === setId)!
    const completed = complete ?? set.completed
    try {
      Object.assign(next, measurements(input, exercise.snapshot.tracking), { completed, completedAt: completed ? (set.completedAt ?? now) : null, updatedAt: now })
      if (!completed) stopTimer(candidate, [setId], now)
      else if (!set.completed) startRest(candidate, exercise, setId, now)
      candidate.editorDrafts = candidate.editorDrafts.filter(row => row.setId !== setId)
      validateStrengthData(candidate)
    } catch (error) { return { applied: false, error: error instanceof Error ? error.message : 'Check this set.' } }
    Object.assign(workout, candidate)
    return { applied: true, error: '' }
  }, database)
}
export function setExerciseRest(id: string, exerciseId: string, seconds: number | null, database = db) {
  return mutate(id, (workout, now) => {
    const exercise = workout.sessionExercises.find(row => row.id === exerciseId)
    if (!exercise) throw new Error('Exercise no longer exists.')
    exercise.restSeconds = seconds; exercise.updatedAt = now
  }, database)
}
export function timerSeconds(timer: Workout['restTimers'][number], now = Date.now()): number {
  return timer.status === 'running' ? Math.max(0, Math.ceil((Date.parse(timer.deadline!) - now) / 1000)) : timer.remainingSeconds ?? 0
}
export function controlRest(id: string, action: 'pause' | 'resume' | 'skip' | 'adjust', adjustment = 0, database = db) {
  return mutate(id, (workout, now) => {
    const timer = workout.restTimers[0]
    if (!timer || !['running', 'paused'].includes(timer.status)) return
    const remaining = timerSeconds(timer, Date.parse(now))
    if (action === 'skip' || remaining === 0) Object.assign(timer, { status: action === 'skip' ? 'skipped' : 'finished', deadline: null, remainingSeconds: 0 })
    else if (action === 'pause') Object.assign(timer, { status: 'paused', deadline: null, remainingSeconds: remaining })
    else if (action === 'resume') Object.assign(timer, { status: 'running', deadline: new Date(Date.parse(now) + remaining * 1000).toISOString(), remainingSeconds: null })
    else {
      const seconds = Math.max(0, remaining + adjustment)
      if (seconds === 0) Object.assign(timer, { status: 'finished', deadline: null, remainingSeconds: 0 })
      else if (timer.status === 'running') timer.deadline = new Date(Date.parse(now) + seconds * 1000).toISOString()
      else timer.remainingSeconds = seconds
    }
    timer.updatedAt = now
  }, database)
}
export type PreviousExercise = { date: string; sets: StrengthSet[] }
export async function previousPerformance(id: string, database = db): Promise<Record<string, PreviousExercise>> {
  return database.transaction('r', tables(database), async () => {
    const current = await readWorkout(id, database)
    const sessions = (await database.sessions.where('status').equals('finished').toArray())
      .filter(row => row.id !== id && row.startedAt <= current.sessions[0].startedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    const result: Record<string, PreviousExercise> = {}
    for (const session of sessions) {
      const previous = await readWorkout(session.id, database)
      for (const exercise of current.sessionExercises) {
        if (result[exercise.id] || !exercise.sourceExerciseId) continue
        const matches = previous.sessionExercises.filter(row => row.sourceExerciseId === exercise.sourceExerciseId && row.snapshot.tracking.load === exercise.snapshot.tracking.load && row.snapshot.tracking.measurement === exercise.snapshot.tracking.measurement && row.snapshot.tracking.weightConvention === exercise.snapshot.tracking.weightConvention)
        const sets = matches.map(row => previous.strengthSets.filter(set => set.sessionExerciseId === row.id && set.completed).sort((a, b) => a.position - b.position)).find(rows => rows.length) ?? []
        if (sets.length) result[exercise.id] = { date: session.startedAt, sets }
      }
    }
    return result
  })
}

/** Save one exact order; IDs and all associated rows remain unchanged. */
export function reorderExercises(id: string, orderedIds: string[], database = db) {
  return mutate(id, (workout, now) => {
    const existing = new Set(workout.sessionExercises.map(row => row.id))
    if (orderedIds.length !== existing.size || new Set(orderedIds).size !== existing.size || orderedIds.some(id => !existing.has(id))) throw new Error('The exercise list changed. Try reordering again.')
    const positions = new Map(orderedIds.map((id, position) => [id, position]))
    workout.sessionExercises.forEach(row => { const position = positions.get(row.id)!; if (row.position !== position) { row.position = position; row.updatedAt = now } })
  }, database)
}
/** Library preference and active exercise override change together; old snapshots never change. */
export function saveExerciseRest(id: string, exerciseId: string, seconds: number | null, database = db) {
  if (seconds !== null) validateRestSeconds(seconds)
  return mutate(id, async (workout, now) => {
    const exercise = workout.sessionExercises.find(row => row.id === exerciseId)
    if (!exercise) throw new Error('Exercise no longer exists.')
    const source = exercise.sourceExerciseId ? await database.exercises.get(exercise.sourceExerciseId) : undefined
    if (!source) throw new Error('This exercise has no library entry. Its rest can only be changed for this workout.')
    const previous = await database.exercisePreferences.get(source.id)
    await database.exercisePreferences.put({ exerciseId:source.id, restSeconds:seconds, favourite:previous?.favourite ?? false, createdAt:previous?.createdAt ?? now, updatedAt:new Date(Math.max(Date.parse(now),Date.parse(previous?.updatedAt ?? now))).toISOString() })
    const resolved = await exerciseRest(source.id,database)
    // Multiple copies of this exercise in the current workout share the preference.
    workout.sessionExercises.filter(row => row.sourceExerciseId === source.id).forEach(row => { row.restSeconds = resolved; row.updatedAt = now })
  }, database)
}
export function replaceCurrentRest(id: string, seconds: number, database = db) {
  validateRestSeconds(seconds)
  return mutate(id, (workout, now) => {
    const timer = workout.restTimers[0]
    if (!timer || !['running', 'paused'].includes(timer.status)) throw new Error('There is no active rest timer.')
    if (seconds === 0) Object.assign(timer, { status: 'finished', deadline: null, remainingSeconds: 0 })
    else if (timer.status === 'paused') timer.remainingSeconds = seconds
    else Object.assign(timer, { deadline: new Date(Date.parse(now) + seconds * 1000).toISOString(), remainingSeconds: null })
    timer.updatedAt = now
  }, database)
}
