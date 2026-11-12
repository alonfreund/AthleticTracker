import { replacementPlan } from '../../domain/strength/replacement'
import { supersetRound, supersetSlots, workingSets, workoutBlocks } from '../../domain/strength/supersets'
import { matchesRoutineTracking } from '../../domain/strength/routines'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { routineExercises } from './routines'
import type { Table } from 'dexie'
import { globalRest, exerciseRest } from './preferences'
import { validateRestSeconds } from '../../domain/rest'
import { db, type AthleticDatabase } from '../db/database'
import { STRENGTH_TABLES, emptyStrengthData, snapshotExercise, type Session, type StrengthData, type StrengthSet } from '../../domain/strength/models'
import { validateStrengthData } from '../../domain/strength/validation'
import { emptyLoad, inputFromSet, measurements, type SetInput } from '../../domain/strength/logging'
export type Workout = StrengthData
const tables = (database: AthleticDatabase) => [database.metadata, database.exercisePreferences, ...STRENGTH_TABLES.map(name => database[name])]
async function readWorkout(id: string, database: AthleticDatabase): Promise<Workout> {
  const session = await database.sessions.get(id)
  if (!session) throw new Error('Workout no longer exists. Return to Workouts and reopen it.')
  const activities = await database.sessionActivities.where('sessionId').equals(id).toArray()
  if (activities.some(activity => activity.activityType === 'cardio')) throw new Error('Open this cardio session from Performance.')
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
export function listWorkouts(database = db): Promise<Session[]> {
  return database.transaction('r', database.sessions, database.sessionActivities, async () => {
    const cardio = await database.sessionActivities.where('activityType').equals('cardio').toArray()
    const excluded = new Set(cardio.map(row => row.sessionId))
    return database.sessions.orderBy('startedAt').reverse().filter(row => !excluded.has(row.id)).toArray()
  })
}
function clock(workout: Workout): string {
  const session = workout.sessions[0]
  return new Date(Math.max(Date.now(), Date.parse(session.startedAt), Date.parse(session.updatedAt), ...workout.strengthSets.flatMap(set => [Date.parse(set.updatedAt), set.completedAt ? Date.parse(set.completedAt) : 0]))).toISOString()
}
async function mutate<T>(id: string, action: (workout: Workout, now: string) => Promise<T> | T, database: AthleticDatabase, status: Session['status'] = 'active'): Promise<T> {
  return database.transaction('rw', tables(database), async () => {
    const workout = await readWorkout(id, database)
    if (workout.sessions[0].status !== status) throw new Error(`Only ${status} workouts can be changed here.`)
    const before = structuredClone(workout)
    const now = clock(workout)
    const result = await action(workout, now)
    if (workout.sessions[0]) workout.sessions[0].updatedAt = now
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
function newWorkout(title: string, notes: string): Workout {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  return {
    exercises: [],
    sessions: [{ id, createdAt: now, updatedAt: now, title, status: 'active', startedAt: now, endedAt: null, notes }],
    sessionActivities: [{ id: crypto.randomUUID(), sessionId: id, activityType: 'strength', position: 0, createdAt: now, updatedAt: now }],
    sessionExercises: [], strengthSets: [], supersetGroups: [], restTimers: [], editorDrafts: [],
  }
}

export async function startWorkout(database = db): Promise<string> {
  return database.transaction('rw', database.sessions, database.sessionActivities, async () => {
    const active = await activeWorkout(database)
    if (active) return active.id
    const workout = newWorkout('Strength workout', '')
    await database.sessions.add(workout.sessions[0])
    await database.sessionActivities.add(workout.sessionActivities[0])
    return workout.sessions[0].id
  })
}

export function startRoutine(id: string, database = db): Promise<string> {
  return database.transaction('rw', [...tables(database), database.routines, database.routineExercises], async () => {
    if (await activeWorkout(database)) throw new Error('Resume or finish your active workout first.')
    const routine = await database.routines.get(id)
    const plan = await routineExercises(id, database)
    if (!routine || !plan.length) throw new Error('Open the routine editor and add exercises before starting.')
    const workout = newWorkout(routine.title, routine.notes)
    const now = workout.sessions[0].startedAt
    const sources = await database.exercises.bulkGet(plan.map(row => row.exerciseId))
    for (const [position, row] of plan.entries()) {
      const source = sources[position]
      if (!source || !matchesRoutineTracking(row, source)) {
        const name = source ? exerciseDisplayName(source) : `exercise ${position + 1}`
        throw new Error(`Review ${name} in the routine editor before starting.`)
      }
      const exerciseId = crypto.randomUUID()
      workout.sessionExercises.push({
        id: exerciseId, sessionActivityId: workout.sessionActivities[0].id, sourceExerciseId: source.id,
        snapshot: snapshotExercise(source), position, notes: '', restSeconds: await exerciseRest(source.id, database),
        supersetGroupId: null, createdAt: now, updatedAt: now,
      })
      row.sets.forEach((set, index) => workout.strengthSets.push({
        ...newSet(exerciseId, source.tracking.load, index, now), setType: set.setType,
      }))
    }
    validateStrengthData(workout)
    await database.sessions.add(workout.sessions[0])
    await database.sessionActivities.add(workout.sessionActivities[0])
    await database.sessionExercises.bulkAdd(workout.sessionExercises)
    await database.strengthSets.bulkAdd(workout.strengthSets)
    return workout.sessions[0].id
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
export function replaceWorkoutExercise(id: string, exerciseId: string, sourceId: string, expectedRevision: string, database = db) {
  return mutate(id, async (workout, now) => {
    const plan = replacementPlan(workout, exerciseId)
    if (!plan || plan.revision !== expectedRevision) throw new Error('This exercise changed. Review the replacement again.')
    const { exercise, remaining, completed } = plan
    if (completed && !remaining.length) throw new Error('All sets are complete. Add the substitute as a new exercise.')
    const source = await database.exercises.get(sourceId)
    if (!source || source.archived || source.id === exercise.snapshot.id) throw new Error('Choose a different available exercise.')

    stopExerciseTimer(workout, exerciseId, now)
    stopTimer(workout, workout.strengthSets.filter(set => set.sessionExerciseId === exerciseId).map(set => set.id), now)
    const replacement = {
      ...exercise, id: crypto.randomUUID(), sourceExerciseId: source.id, snapshot: snapshotExercise(source),
      notes: '', restSeconds: await exerciseRest(source.id, database), createdAt: now, updatedAt: now,
    }
    if (exercise.supersetGroupId && completed && !exercise.supersetSlotId) {
      exercise.supersetSlotId = crypto.randomUUID()
      replacement.supersetSlotId = exercise.supersetSlotId
      workingSets(workout, exerciseId).forEach((set, index) => { set.supersetRoundIndex = index })
    }

    const removed = new Set(remaining.map(set => set.id))
    workout.strengthSets = workout.strengthSets.filter(set => !removed.has(set.id))
    workout.editorDrafts = workout.editorDrafts.filter(draft => !removed.has(draft.setId))
    for (const [index, set] of remaining.entries()) {
      const blank = newSet(replacement.id, source.tracking.load, index, now)
      blank.setType = set.setType
      if (set.supersetRoundIndex !== undefined) blank.supersetRoundIndex = set.supersetRoundIndex
      workout.strengthSets.push(blank)
    }
    if (completed) {
      exercise.updatedAt = now
      for (const row of workout.sessionExercises) {
        if (row.position > exercise.position) { row.position++; row.updatedAt = now }
      }
      replacement.position++
      workout.sessionExercises.push(replacement)
    } else {
      workout.sessionExercises = workout.sessionExercises.map(row => row.id === exerciseId ? replacement : row)
    }
    return replacement.id
  }, database)
}

function nextSlotRound(workout: Workout, exercise: Workout['sessionExercises'][number]) {
  const members = new Set(workout.sessionExercises.filter(row =>
    row.supersetGroupId === exercise.supersetGroupId && row.supersetSlotId === exercise.supersetSlotId).map(row => row.id))
  return Math.max(-1, ...workout.strengthSets.filter(set => members.has(set.sessionExerciseId)).map(set => set.supersetRoundIndex ?? -1)) + 1
}

function clearSupersetMembership(workout: Workout, exercise: Workout['sessionExercises'][number], now: string) {
  exercise.supersetGroupId = null
  delete exercise.supersetSlotId
  exercise.updatedAt = now
  for (const set of workout.strengthSets) {
    if (set.sessionExerciseId === exercise.id) delete set.supersetRoundIndex
  }
}

export function addSet(id: string, exerciseId: string, database = db) {
  return mutate(id, (workout, now) => {
    const exercise = workout.sessionExercises.find(row => row.id === exerciseId)
    if (!exercise) throw new Error('Exercise no longer exists.')
    stopExerciseTimer(workout, exerciseId, now)
    const rows = workout.strengthSets.filter(row => row.sessionExerciseId === exerciseId)
    const set = newSet(exerciseId, exercise.snapshot.tracking.load, rows.length ? Math.max(...rows.map(row => row.position)) + 1 : 0, now)
    if (exercise.supersetSlotId) set.supersetRoundIndex = nextSlotRound(workout, exercise)
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
    if (!complete) stopSetTimer(workout, set, wasComplete, now)
    else if (!wasComplete) startRest(workout, exercise, setId, now)
  }, database)
}
export function changeSetType(id: string, setId: string, type: StrengthSet['setType'], database = db) {
  return mutate(id, (workout, now) => {
    const set = workout.strengthSets.find(row => row.id === setId)
    if (!set) throw new Error('Set no longer exists.')
    if (set.setType === type) return
    stopExerciseTimer(workout, set.sessionExerciseId, now)
    const exercise = workout.sessionExercises.find(row => row.id === set.sessionExerciseId)!
    if (type === 'warm-up') delete set.supersetRoundIndex
    else if (exercise.supersetSlotId && set.supersetRoundIndex === undefined) set.supersetRoundIndex = nextSlotRound(workout, exercise)
    set.setType = type
    set.updatedAt = now
  }, database)
}
function stopTimer(workout: Workout, removedIds: string[], now: string) {
  for (const timer of workout.restTimers) if (timer.sourceSetId && removedIds.includes(timer.sourceSetId)) Object.assign(timer, { sourceSetId: null, status: 'skipped', deadline: null, remainingSeconds: 0, updatedAt: now })
}

function stopExerciseTimer(workout: Workout, exerciseId: string, now: string) {
  const exercise = workout.sessionExercises.find(row => row.id === exerciseId)
  if (!exercise?.supersetGroupId) return
  const members = new Set(workout.sessionExercises.filter(row => row.supersetGroupId === exercise.supersetGroupId).map(row => row.id))
  stopTimer(workout, workout.strengthSets.filter(row => members.has(row.sessionExerciseId)).map(row => row.id), now)
}

function stopSetTimer(workout: Workout, set: StrengthSet, wasComplete: boolean, now: string) {
  const round = wasComplete ? supersetRound(workout, set) : undefined
  stopTimer(workout, round ? round.entries.map(row => row.set.id) : [set.id], now)
}

export function removeSet(id: string, setId: string, database = db) {
  return mutate(id, (workout, now) => {
    const set = workout.strengthSets.find(row => row.id === setId)
    if (set) stopExerciseTimer(workout, set.sessionExerciseId, now)
    workout.strengthSets = workout.strengthSets.filter(row => row.id !== setId); workout.editorDrafts = workout.editorDrafts.filter(row => row.setId !== setId); stopTimer(workout, [setId], now) }, database)
}
export function removeWorkoutExercise(id: string, exerciseId: string, database = db) {
  return mutate(id, (workout, now) => {
    stopExerciseTimer(workout, exerciseId, now)
    const removed = workout.strengthSets.filter(row => row.sessionExerciseId === exerciseId).map(row => row.id)
    workout.strengthSets = workout.strengthSets.filter(row => row.sessionExerciseId !== exerciseId)
    workout.editorDrafts = workout.editorDrafts.filter(row => !removed.includes(row.setId))
    workout.sessionExercises = workout.sessionExercises.filter(row => row.id !== exerciseId)
    for (const group of workout.supersetGroups) if (supersetSlots(workout.sessionExercises.filter(row => row.supersetGroupId === group.id)).length < 2) {
      workout.sessionExercises.forEach(row => { if (row.supersetGroupId === group.id) clearSupersetMembership(workout, row, now) })
      workout.supersetGroups = workout.supersetGroups.filter(row => row.id !== group.id)
    }
    stopTimer(workout, removed, now)
  }, database)
}
export function moveWorkoutItem(id: string, kind: 'exercise' | 'set', itemId: string, direction: -1 | 1, database = db) {
  return mutate(id, (workout, now) => {
    if (kind === 'exercise') {
      const blocks = workoutBlocks(workout)
      const index = blocks.findIndex(block => block.exercises.some(row => row.id === itemId))
      if (index < 0) throw new Error('Item no longer exists.')
      const destination = index + direction
      if (destination >= 0 && destination < blocks.length) {
        const [block] = blocks.splice(index, 1)
        blocks.splice(destination, 0, block)
        applyExerciseOrder(workout, blocks.flatMap(block => block.exercises.map(row => row.id)), now)
      }
      return
    }
    const items = workout.strengthSets
    const item = items.find(row => row.id === itemId)
    if (!item) throw new Error('Item no longer exists.')
    const siblings = items.filter(row => row.sessionExerciseId === item.sessionExerciseId).sort((a, b) => a.position - b.position)
    const at = siblings.findIndex(row => row.id === itemId); const other = siblings[at + direction]
    if (other) { stopExerciseTimer(workout, item.sessionExerciseId, now); [item.position, other.position] = [other.position, item.position]; item.updatedAt = now; other.updatedAt = now }
  }, database)
}
export function finishWorkout(id: string, allowIncomplete = false, database = db) {
  return mutate(id, (workout, now) => {
    if (workout.editorDrafts.length) throw new Error('Save values or discard the pending set edits before finishing.')
    if (!workout.strengthSets.some(row => row.completed)) throw new Error('Complete at least one set before finishing, or cancel the workout.')
    if (!allowIncomplete && workout.strengthSets.some(row => !row.completed)) throw new Error('Review unfinished sets before finishing.')
    Object.assign(workout.sessions[0], { status: 'finished', endedAt: now })
    for (const timer of workout.restTimers) Object.assign(timer, { status: 'finished', deadline: null, remainingSeconds: 0, updatedAt: now })
    return workout
  }, database)
}
export type FinishedSetEdit = { id?: string; exerciseId: string; input: SetInput; setType: StrengthSet['setType']; completed: boolean }
export type FinishedWorkoutEdit = Pick<Session, 'title' | 'notes' | 'startedAt'> & { sets: FinishedSetEdit[]; removedSetIds: string[] }

function checkHistoryVersion(current: Workout, baseline: Workout) {
  for (const table of STRENGTH_TABLES) {
    const key = (row: Workout[typeof table][number]) => 'id' in row ? row.id : row.sessionId
    const original = new Map(baseline[table].map(row => [key(row), JSON.stringify(row)]))
    if (current[table].length !== original.size || current[table].some(row => original.get(key(row)) !== JSON.stringify(row))) {
      throw new Error('This workout changed since it was opened. Reopen it to see the latest version.')
    }
  }
}

export function editFinishedWorkout(baseline: Workout, edit: FinishedWorkoutEdit, database = db) {
  return mutate(baseline.sessions[0].id, (workout, now) => {
    checkHistoryVersion(workout, baseline)
    const session = workout.sessions[0]
    const delta = Date.parse(edit.startedAt) - Date.parse(session.startedAt)
    const shift = (date: string) => new Date(Date.parse(date) + delta).toISOString()
    Object.assign(session, { title: edit.title.trim(), notes: edit.notes, startedAt: edit.startedAt, endedAt: shift(session.endedAt!) })
    const removed = new Set(edit.removedSetIds)
    const edited = new Set<string>()
    const detachTimer = new Set(removed)
    if ([...removed].some(id => !workout.strengthSets.some(set => set.id === id))) throw new Error('A removed set no longer exists.')
    const changedTypes = new Map(edit.sets.map(change => [change.id, change.setType]))
    for (const exercise of workout.sessionExercises) {
      if (!exercise.supersetGroupId || exercise.supersetSlotId) continue
      const working = workingSets(workout, exercise.id)
      const changesOrder = working.some(set => removed.has(set.id) || changedTypes.get(set.id) === 'warm-up') ||
        workout.strengthSets.some(set => set.sessionExerciseId === exercise.id && set.setType === 'warm-up' && changedTypes.has(set.id) && changedTypes.get(set.id) !== 'warm-up')
      if (changesOrder) {
        exercise.supersetSlotId = crypto.randomUUID()
        exercise.updatedAt = now
        working.forEach((set, index) => { set.supersetRoundIndex = index; set.updatedAt = now })
      }
    }
    workout.strengthSets = workout.strengthSets.filter(set => !removed.has(set.id))
    for (const set of workout.strengthSets) if (delta && set.completedAt) {
      set.completedAt = shift(set.completedAt)
      set.updatedAt = now
    }
    const assignRounds: { set: StrengthSet; exercise: Workout['sessionExercises'][number] }[] = []
    for (const change of edit.sets) {
      const exercise = workout.sessionExercises.find(row => row.id === change.exerciseId)
      const existing = change.id ? workout.strengthSets.find(row => row.id === change.id) : undefined
      if (!exercise || (change.id && (!existing || existing.sessionExerciseId !== exercise.id || edited.has(change.id)))) throw new Error('A set no longer matches its exercise.')
      const tracking = exercise.snapshot.tracking
      const position = existing?.position ?? Math.max(-1, ...workout.strengthSets.filter(row => row.sessionExerciseId === exercise.id).map(row => row.position)) + 1
      const set = existing ?? newSet(exercise.id, tracking.load, position, now)
      edited.add(set.id)
      const original = inputFromSet(set)
      const unchanged = <K extends keyof SetInput['values']>(key: K) => !!existing && original.values[key] === change.input.values[key]
      const parsedInput = structuredClone(change.input)
      for (const key of ['reps', 'durationSeconds', 'rpe', 'rir'] as const) if (unchanged(key)) parsedInput.values[key] = ''
      const sameUnit = original.weightUnit === change.input.weightUnit
      for (const key of ['weight', 'bodyweight'] as const) if (sameUnit && unchanged(key)) parsedInput.values[key] = ''
      const values = measurements(parsedInput, tracking)
      for (const key of ['reps', 'durationSeconds', 'rpe', 'rir'] as const) if (unchanged(key)) values[key] = set[key]
      // Historical rows can contain mixed units. Keep any mass the user did not edit.
      if (existing && original.weightUnit === change.input.weightUnit) {
        const load = set.load
        if (original.values.weight === change.input.values.weight) {
          if (load.mode === 'external' && values.load.mode === 'external') values.load.weight = load.weight
          if (load.mode === 'added' && values.load.mode === 'added') values.load.addedWeight = load.addedWeight
          if (load.mode === 'assisted' && values.load.mode === 'assisted') values.load.assistance = load.assistance
        }
        if (original.values.bodyweight === change.input.values.bodyweight && 'bodyweight' in load && 'bodyweight' in values.load) values.load.bodyweight = load.bodyweight
      }
      Object.assign(set, values, { setType: change.setType, completed: change.completed,
        completedAt: change.completed ? set.completedAt ?? session.endedAt : null, updatedAt: now })
      if (change.setType === 'warm-up') delete set.supersetRoundIndex
      else if (exercise.supersetSlotId && set.supersetRoundIndex === undefined) assignRounds.push({ set, exercise })
      if (!existing) workout.strengthSets.push(set)
      if (!set.completed) detachTimer.add(set.id) // Detach timers that can no longer point to a completed set.
    }
    for (const { set, exercise } of assignRounds) set.supersetRoundIndex = nextSlotRound(workout, exercise)
    if (baseline.strengthSets.some(set => set.completed) && !workout.strengthSets.some(set => set.completed)) {
      throw new Error('Keep at least one completed set, or delete the workout.')
    }
    stopTimer(workout, [...detachTimer], now)
    return workout
  }, database, 'finished')
}

export function deleteFinishedWorkout(baseline: Workout, database = db) {
  return mutate(baseline.sessions[0].id, workout => {
    checkHistoryVersion(workout, baseline)
    Object.assign(workout, emptyStrengthData())
  }, database, 'finished')
}

export function cancelWorkout(id: string, database = db) {
  return mutate(id, (workout, now) => {
    Object.assign(workout.sessions[0], { status: 'cancelled', endedAt: now }); workout.editorDrafts = []
    for (const timer of workout.restTimers) Object.assign(timer, { status: 'skipped', deadline: null, remainingSeconds: 0, updatedAt: now })
  }, database)
}

function startRest(workout: Workout, exercise: Workout['sessionExercises'][number], setId: string, now: string) {
  const set = workout.strengthSets.find(row => row.id === setId)!
  const round = supersetRound(workout, set)
  const seconds = round
    ? round.complete ? round.group.betweenRoundRestSeconds : round.group.betweenExerciseRestSeconds
    : exercise.restSeconds ?? exercise.snapshot.defaultRestSeconds
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
      if (!completed) stopSetTimer(candidate, next, set.completed, now)
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
    const sessions = (await listWorkouts(database)).filter(row => row.status === 'finished')
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

export type ExerciseHistorySession = Pick<Session, 'id' | 'title' | 'startedAt'> & { sets: StrengthSet[] }

export async function recentExerciseHistory(exerciseId: string, database = db): Promise<ExerciseHistorySession[]> {
  const { sessions, sessionActivities, sessionExercises, strengthSets } = database
  return database.transaction('r', [sessions, sessionActivities, sessionExercises, strengthSets], async () => {
    // Match the saved identity even when a historical card no longer has a library link.
    const exercises = await sessionExercises.filter(row => row.snapshot.id === exerciseId).toArray()
    if (!exercises.length) return []
    const activities = await sessionActivities.bulkGet([...new Set(exercises.map(row => row.sessionActivityId))])
    const sessionByActivity = new Map(activities.flatMap(row => row ? [[row.id, row.sessionId] as const] : []))
    const exercisesBySession = new Map<string, typeof exercises>()
    for (const exercise of exercises) {
      const sessionId = sessionByActivity.get(exercise.sessionActivityId)
      if (!sessionId) continue
      const entries = exercisesBySession.get(sessionId) ?? []
      entries.push(exercise)
      exercisesBySession.set(sessionId, entries)
    }
    const candidates = (await sessions.bulkGet([...exercisesBySession.keys()]))
      .filter((session): session is Session => session?.status === 'finished')
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id))
    const history: ExerciseHistorySession[] = []
    for (const session of candidates) {
      const entries = exercisesBySession.get(session.id)!
      const sets = await strengthSets.where('sessionExerciseId').anyOf(entries.map(row => row.id))
        .filter(set => set.completed).toArray()
      if (!sets.length) continue
      const positions = new Map(entries.map(row => [row.id, row.position]))
      sets.sort((a, b) => positions.get(a.sessionExerciseId)! - positions.get(b.sessionExerciseId)! || a.position - b.position)
      history.push({ id: session.id, title: session.title, startedAt: session.startedAt, sets })
      if (history.length === 5) break
    }
    return history
  })
}

function applyExerciseOrder(workout: Workout, orderedIds: string[], now: string) {
  const existing = new Set(workout.sessionExercises.map(row => row.id))
  if (orderedIds.length !== existing.size || new Set(orderedIds).size !== existing.size || orderedIds.some(id => !existing.has(id))) throw new Error('The exercise list changed. Try reordering again.')
  const positions = new Map(orderedIds.map((id, position) => [id, position]))
  for (const group of workout.supersetGroups) {
    const members = workout.sessionExercises.filter(row => row.supersetGroupId === group.id)
    const order = members.map(row => positions.get(row.id)!)
    for (const slot of supersetSlots(members)) {
      const slotPositions = slot.map(row => positions.get(row.id)!)
      if (Math.max(...slotPositions) - Math.min(...slotPositions) + 1 !== slot.length) throw new Error('Move a replacement and its original exercise together.')
    }
    const before = [...members].sort((a, b) => a.position - b.position).map(row => row.id)
    const after = [...members].sort((a, b) => positions.get(a.id)! - positions.get(b.id)!).map(row => row.id)
    if (before.some((id, index) => id !== after[index])) stopExerciseTimer(workout, members[0].id, now)
    if (Math.max(...order) - Math.min(...order) + 1 !== members.length) throw new Error('Move the superset together as a group.')
  }
  workout.sessionExercises.forEach(row => {
    const position = positions.get(row.id)!
    if (row.position !== position) { row.position = position; row.updatedAt = now }
  })
}

/** Save one exact order; IDs and all associated rows remain unchanged. */
export function reorderExercises(id: string, orderedIds: string[], database = db) {
  return mutate(id, (workout, now) => applyExerciseOrder(workout, orderedIds, now), database)
}

export function saveSuperset(id: string, exerciseIds: string[], groupId: string | null = null, database = db) {
  return mutate(id, async (workout, now) => {
    const selected = new Set(exerciseIds)
    const members = workout.sessionExercises.filter(row => selected.has(row.id))
    if (selected.size !== exerciseIds.length || selected.size < 2 || members.length !== selected.size) throw new Error('Choose at least two available exercises.')
    if (supersetSlots(members).length < 2) throw new Error('Choose at least two superset slots.')
    const existing = groupId ? workout.supersetGroups.find(group => group.id === groupId) : undefined
    if (groupId && !existing) throw new Error('Superset no longer exists.')
    if (members.some(row => row.sessionActivityId !== members[0].sessionActivityId ||
      (row.supersetGroupId !== null && row.supersetGroupId !== groupId))) throw new Error('Choose exercises from this workout that are not in another superset.')
    const affected = workout.sessionExercises.filter(row => selected.has(row.id) || (groupId !== null && row.supersetGroupId === groupId))
    for (const slot of supersetSlots(affected)) {
      const count = slot.filter(row => selected.has(row.id)).length
      if (count && count !== slot.length) throw new Error('Keep an exercise and its replacements together.')
    }
    for (const exercise of affected) {
      stopExerciseTimer(workout, exercise.id, now)
      stopTimer(workout, workout.strengthSets.filter(set => set.sessionExerciseId === exercise.id).map(set => set.id), now)
    }
    const group = existing ?? {
      id: crypto.randomUUID(), sessionActivityId: members[0].sessionActivityId, name: 'Superset',
      betweenExerciseRestSeconds: 0, betweenRoundRestSeconds: await globalRest(database), createdAt: now, updatedAt: now,
    }
    group.updatedAt = now
    if (!existing) workout.supersetGroups.push(group)
    for (const row of affected) {
      if (selected.has(row.id)) {
        row.supersetGroupId = group.id
        row.updatedAt = now
      } else clearSupersetMembership(workout, row, now)
    }
    // Group members retain their relative order and move together at their first position.
    applyExerciseOrder(workout, workoutBlocks(workout).flatMap(block => block.exercises.map(row => row.id)), now)
    return group.id
  }, database)
}

export function ungroupSuperset(id: string, groupId: string, database = db) {
  return mutate(id, (workout, now) => {
    const members = workout.sessionExercises.filter(row => row.supersetGroupId === groupId)
    for (const row of members) stopExerciseTimer(workout, row.id, now)
    for (const row of members) clearSupersetMembership(workout, row, now)
    workout.supersetGroups = workout.supersetGroups.filter(group => group.id !== groupId)
  }, database)
}

export function saveSupersetRest(id: string, groupId: string, field: 'betweenExerciseRestSeconds' | 'betweenRoundRestSeconds', seconds: number, database = db) {
  validateRestSeconds(seconds)
  return mutate(id, (workout, now) => {
    const group = workout.supersetGroups.find(row => row.id === groupId)
    if (!group) throw new Error('Superset no longer exists.')
    group[field] = seconds
    group.updatedAt = now
  }, database)
}

export function moveSupersetExercise(id: string, groupId: string, exerciseId: string, direction: -1 | 1, database = db) {
  return mutate(id, (workout, now) => {
    const blocks = workoutBlocks(workout)
    const block = blocks.find(row => row.group?.id === groupId)
    const slots = supersetSlots(block?.exercises ?? [])
    const index = slots.findIndex(slot => slot.some(row => row.id === exerciseId))
    if (!block || index < 0) throw new Error('Superset exercise no longer exists.')
    const destination = index + direction
    if (destination < 0 || destination >= slots.length) return
    const [slot] = slots.splice(index, 1)
    slots.splice(destination, 0, slot)
    block.exercises = slots.flat()
    applyExerciseOrder(workout, blocks.flatMap(row => row.exercises.map(row => row.id)), now)
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
