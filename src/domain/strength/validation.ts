import type { Exercise, StrengthData, Tracking } from './models'
import { EXERCISE_TYPES, REPETITION_CONVENTIONS } from './taxonomy'
import { STRENGTH_TABLES } from './models'

type Obj = Record<string, unknown>
function fail(message: string): never { throw new Error(`Invalid strength data: ${message}`) }
function object(value: unknown): Obj {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('expected an object.')
  return value as Obj
}
function shape(value: unknown, fields: string[]): Obj {
  const result = object(value)
  if (Object.keys(result).length !== fields.length || fields.some(field => !Object.hasOwn(result, field))) fail('missing or unsupported fields.')
  return result
}
function text(value: unknown, max = 10000, nonempty = false): asserts value is string {
  if (typeof value !== 'string' || value.length > max || (nonempty && !value.trim())) fail('invalid text.')
}
function num(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER, integer = false): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) fail('invalid numeric value.')
}
function choice(value: unknown, options: readonly unknown[]) {
  if (!options.includes(value)) fail('unsupported measurement or status.')
}
function bool(value: unknown): asserts value is boolean { if (typeof value !== 'boolean') fail('invalid boolean.') }
function id(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) fail('invalid identifier.')
}
function date(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail('invalid UTC timestamp.')
}
function nullable(value: unknown, check: (value: unknown) => void) { if (value !== null) check(value) }
function timestamps(value: Obj) {
  date(value.createdAt); date(value.updatedAt)
  if (value.updatedAt < value.createdAt) fail('updatedAt precedes createdAt.')
}
const entityFields = ['id', 'createdAt', 'updatedAt']
function entity(value: unknown, fields: string[]): Obj {
  const result = shape(value, [...entityFields, ...fields]); id(result.id); timestamps(result); return result
}
function strings(value: unknown) {
  if (!Array.isArray(value)) fail('expected an array of identifiers.')
  value.forEach(item => text(item, 100, true))
  if (new Set(value).size !== value.length) fail('duplicate classification identifiers.')
}
function tracking(value: unknown) {
  const item = shape(value, ['measurement', 'load', 'weightConvention'])
  choice(item.measurement, ['reps', 'duration'])
  choice(item.load, ['none', 'external', 'bodyweight', 'added', 'assisted'])
  choice(item.weightConvention, ['total', 'per-hand', 'machine-display', null])
  const hasLoad = ['external', 'added', 'assisted'].includes(item.load as string)
  if (hasLoad !== (item.weightConvention !== null)) fail('weight convention must match load tracking.')
}
function mass(value: unknown, bodyweight = false) {
  const item = shape(value, ['value', 'unit']); num(item.value, 0); choice(item.unit, ['kg', 'lb'])
  if (bodyweight && item.value === 0) fail('bodyweight must be positive when supplied.')
}
function load(value: unknown, expected: Tracking['load'], completed: boolean) {
  const item = object(value)
  if (item.mode !== expected) fail('load does not match the exercise snapshot.')
  const fields: Record<Tracking['load'], string[]> = { none: [], external: ['weight'], bodyweight: ['bodyweight'], added: ['addedWeight', 'bodyweight'], assisted: ['assistance', 'bodyweight'] }
  shape(item, ['mode', ...fields[expected]])
  for (const field of fields[expected]) nullable(item[field], val => mass(val, field === 'bodyweight'))
  const required = { none: null, bodyweight: null, external: 'weight', added: 'addedWeight', assisted: 'assistance' }[expected]
  if (completed && required && item[required] === null) fail('completed set is missing its load.')
}
function range(value: unknown, min: number, max: number, integer = false) {
  const item = shape(value, ['min', 'max']); num(item.min, min, max, integer); num(item.max, min, max, integer)
  if (item.min > item.max) fail('target range is reversed.')
}
function target(value: unknown, config: Tracking) {
  const item = shape(value, ['reps', 'durationSeconds', 'load', 'rpe', 'rir'])
  nullable(item.reps, value => range(value, 1, Number.MAX_SAFE_INTEGER, true))
  nullable(item.durationSeconds, value => range(value, Number.MIN_VALUE, Number.MAX_SAFE_INTEGER))
  nullable(item.rpe, value => range(value, 1, 10))
  nullable(item.rir, value => range(value, 0, Number.MAX_SAFE_INTEGER, true))
  if (config.measurement === 'duration' && item.reps !== null) fail('a timed hold cannot have a repetition target.')
  nullable(item.load, value => load(value, config.load, true))
}
const exerciseFields = ['revision', 'origin', 'name', 'primaryMuscleGroupIds', 'secondaryMuscleGroupIds', 'equipmentIds', 'category', 'instructions', 'notes', 'tracking', 'defaultRestSeconds', 'archived']
export function validateExercise(value: unknown): asserts value is Exercise {
  const item = entity(value, [...exerciseFields, ...(Object.hasOwn(object(value), 'metadata') ? ['metadata'] : [])])
  if (item.metadata !== undefined) {
    validateExerciseMetadata(item.metadata)
    const metadata = item.metadata as unknown as import('./models').ExerciseMetadata
    const equipment = item.equipmentIds
    if (Array.isArray(equipment) && metadata.optionalEquipmentIds.some(id=>equipment.includes(id))) fail('equipment cannot be both required and optional.')
  }
  num(item.revision, 1, Number.MAX_SAFE_INTEGER, true); choice(item.origin, ['bundled', 'custom']); text(item.name, 200, true)
  strings(item.primaryMuscleGroupIds); strings(item.secondaryMuscleGroupIds); strings(item.equipmentIds)
  const primary = item.primaryMuscleGroupIds as string[]
  if ((item.secondaryMuscleGroupIds as string[]).some(id => primary.includes(id))) fail('primary and secondary muscles overlap.')
  text(item.category, 100, true); text(item.instructions); text(item.notes); tracking(item.tracking)
  nullable(item.defaultRestSeconds, value => num(value, 0)); bool(item.archived)
}
function table(value: unknown, check: (row: unknown) => void, key = 'id'): Obj[] {
  if (!Array.isArray(value)) fail('expected a table array.')
  const seen = new Set<unknown>()
  return value.map(row => {
    check(row); const item = object(row)
    if (seen.has(item[key])) fail('duplicate table identifier.')
    seen.add(item[key]); return item
  })
}
function reference(value: unknown, rows: Map<string, Obj>): Obj {
  id(value); const parent = rows.get(value)
  if (!parent) fail('missing parent record.')
  return parent
}
function index(rows: Obj[], key = 'id') { return new Map(rows.map(row => [row[key] as string, row])) }
function positions(rows: Obj[], parentKey: string) {
  const seen = new Set<string>()
  for (const row of rows) {
    const key = `${row[parentKey]}:${row.position}`
    if (seen.has(key)) fail('duplicate positions in the same parent.')
    seen.add(key)
  }
}

/** Validate every table and relationship before any restore writes occur. */
export function validateStrengthData(value: unknown): asserts value is StrengthData {
  const data = shape(value, [...STRENGTH_TABLES])
  table(data.exercises, validateExercise)
  const sessions = table(data.sessions, row => {
    const item = entity(row, ['title', 'status', 'startedAt', 'endedAt', 'notes'])
    text(item.title, 200, true); text(item.notes); choice(item.status, ['active', 'finished', 'cancelled']); date(item.startedAt)
    nullable(item.endedAt, date)
    if (item.status === 'active' ? item.endedAt !== null : item.endedAt === null) fail('session end time does not match its status.')
    if (item.endedAt !== null && (item.endedAt as string) < item.startedAt) fail('session ends before it starts.')
  })
  if (sessions.filter(row => row.status === 'active').length > 1) fail('only one active session is supported.')
  const sessionIndex = index(sessions)
  const activities = table(data.sessionActivities, row => {
    const item = entity(row, ['sessionId', 'activityType', 'position'])
    reference(item.sessionId, sessionIndex); choice(item.activityType, ['strength']); num(item.position, 0, Number.MAX_SAFE_INTEGER, true)
  })
  positions(activities, 'sessionId')
  // The UI initially supports one strength activity in each session.
  if (new Set(activities.map(row => row.sessionId)).size !== activities.length) fail('duplicate strength activities in one session.')
  const activityIndex = index(activities)
  const groups = table(data.supersetGroups, row => {
    const item = entity(row, ['sessionActivityId', 'name', 'betweenExerciseRestSeconds', 'betweenRoundRestSeconds'])
    reference(item.sessionActivityId, activityIndex); text(item.name, 200, true)
    num(item.betweenExerciseRestSeconds); num(item.betweenRoundRestSeconds)
  })
  const groupIndex = index(groups)
  const exercises = table(data.sessionExercises, row => {
    const item = entity(row, ['sessionActivityId', 'sourceExerciseId', 'snapshot', 'position', 'notes', 'restSeconds', 'supersetGroupId'])
    reference(item.sessionActivityId, activityIndex); nullable(item.sourceExerciseId, id); validateExercise(item.snapshot)
    if (item.sourceExerciseId !== null && item.sourceExerciseId !== item.snapshot.id) fail('source exercise and snapshot identifiers differ.')
    // Library presence is deliberately NOT required: history survives archival/deletion.
    num(item.position, 0, Number.MAX_SAFE_INTEGER, true); text(item.notes); nullable(item.restSeconds, value => num(value))
    if (item.supersetGroupId !== null) {
      const group = reference(item.supersetGroupId, groupIndex)
      if (group.sessionActivityId !== item.sessionActivityId) fail('superset belongs to a different activity.')
    }
  })
  positions(exercises, 'sessionActivityId')
  for (const group of groups) if (exercises.filter(row => row.supersetGroupId === group.id).length < 2) fail('supersets require at least two exercises.')
  const exerciseIndex = index(exercises)
  const sets = table(data.strengthSets, row => {
    const item = entity(row, ['sessionExerciseId', 'position', 'setType', 'completed', 'completedAt', 'reps', 'durationSeconds', 'load', 'rpe', 'rir', 'target'])
    const parent = reference(item.sessionExerciseId, exerciseIndex)
    const config = (parent.snapshot as Exercise).tracking
    num(item.position, 0, Number.MAX_SAFE_INTEGER, true)
    choice(item.setType, ['normal', 'warm-up', 'failure', 'drop-set', 'back-off', 'amrap'])
    bool(item.completed); nullable(item.completedAt, date)
    if (item.completed ? item.completedAt === null : item.completedAt !== null) fail('completion timestamp does not match set status.')
    const activity = reference(parent.sessionActivityId, activityIndex)
    const session = reference(activity.sessionId, sessionIndex)
    if (item.completedAt !== null && ((item.completedAt as string) < (session.startedAt as string) || (session.endedAt !== null && (item.completedAt as string) > (session.endedAt as string)))) fail('set completion falls outside the session.')
    nullable(item.reps, value => num(value, 0, Number.MAX_SAFE_INTEGER, true)); nullable(item.durationSeconds, value => num(value, Number.MIN_VALUE))
    if (config.measurement === 'duration' && item.reps !== null) fail('a timed hold cannot record repetitions.')
    if (item.completed && (config.measurement === 'reps' ? item.reps === null || item.reps === 0 : item.durationSeconds === null)) fail('completed set is missing its performance measurement.')
    load(item.load, config.load, item.completed)
    nullable(item.rpe, value => num(value, 1, 10)); nullable(item.rir, value => num(value, 0, Number.MAX_SAFE_INTEGER, true))
    nullable(item.target, value => target(value, config))
  })
  positions(sets, 'sessionExerciseId')
  const setIndex = index(sets)
  const sessionOfSet = (value: unknown): Obj => {
    const set = reference(value, setIndex)
    const exercise = reference(set.sessionExerciseId, exerciseIndex)
    const activity = reference(exercise.sessionActivityId, activityIndex)
    return reference(activity.sessionId, sessionIndex)
  }
  table(data.restTimers, row => {
    const item = shape(row, ['sessionId', 'sourceSetId', 'status', 'deadline', 'remainingSeconds', 'createdAt', 'updatedAt'])
    timestamps(item); const session = reference(item.sessionId, sessionIndex)
    choice(item.status, ['running', 'paused', 'finished', 'skipped'])
    nullable(item.deadline, date); nullable(item.remainingSeconds, value => num(value, 0))
    if (item.status === 'running' && (item.deadline === null || item.remainingSeconds !== null)) fail('running timer requires a deadline only.')
    if (item.status === 'paused' && (item.deadline !== null || item.remainingSeconds === null)) fail('paused timer requires remaining time only.')
    if (['finished', 'skipped'].includes(item.status as string) && (item.deadline !== null || item.remainingSeconds !== 0)) fail('finished timer must have zero remaining time.')
    if (session.status !== 'active' && ['running', 'paused'].includes(item.status as string)) fail('only active sessions can have active timers.')
    if (item.sourceSetId !== null) {
      if (sessionOfSet(item.sourceSetId).id !== item.sessionId) fail('timer source belongs to another session.')
      if (!reference(item.sourceSetId, setIndex).completed) fail('timer source set is incomplete.')
    }
  }, 'sessionId')
  const drafts = table(data.editorDrafts, row => {
    const item = entity(row, ['sessionId', 'setId', 'values', 'weightUnit'])
    const session = reference(item.sessionId, sessionIndex)
    if (session.status !== 'active' || sessionOfSet(item.setId).id !== session.id) fail('draft must belong to its active session.')
    choice(item.weightUnit, ['kg', 'lb'])
    const values = shape(item.values, ['weight', 'bodyweight', 'reps', 'durationSeconds', 'rpe', 'rir'])
    Object.values(values).forEach(value => text(value, 128))
  })
  if (new Set(drafts.map(row => row.setId)).size !== drafts.length) fail('duplicate drafts for the same set.')
}

export function validateExerciseMetadata(value: unknown): void {
  const item = shape(value, ['version','aliases','familyId','exerciseType','movementPatternIds','optionalEquipmentIds','variant','repetitionConvention'])
  choice(item.version,[1]); strings(item.aliases); nullable(item.familyId,id)
  choice(item.exerciseType,Object.keys(EXERCISE_TYPES)); strings(item.movementPatternIds); strings(item.optionalEquipmentIds)
  const variant=shape(item.variant,['grip','angle','stance','support','execution'])
  Object.values(variant).forEach(value=>nullable(value,value=>text(value,100,true)))
  choice(item.repetitionConvention,Object.keys(REPETITION_CONVENTIONS))
}
export function validateExercisePreferences(value: unknown): void {
  table(value,row=>{
    const item=shape(row,['exerciseId','restSeconds','favourite','createdAt','updatedAt'])
    id(item.exerciseId); timestamps(item); nullable(item.restSeconds,value=>num(value,0)); bool(item.favourite)
  },'exerciseId')
}
export function validateCatalogueStates(value: unknown): void {
  table(value,row=>{
    const item=shape(row,['exerciseId','appliedRevision','fingerprint','status'])
    id(item.exerciseId); num(item.appliedRevision,0,Number.MAX_SAFE_INTEGER,true); text(item.fingerprint,100000,true)
    choice(item.status,['managed','preserved'])
  },'exerciseId')
}
