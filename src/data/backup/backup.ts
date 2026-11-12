import { validateFrontLeverAttempt, type FrontLeverAttempt } from '../../domain/calisthenics/frontLever'
import { validateHandstandAttempt, type HandstandAttempt } from '../../domain/calisthenics/handstand'
import { validatePlancheAttempt, type PlancheAttempt } from '../../domain/calisthenics/planche'
import { validateMuscleupAttempt, type MuscleupAttempt } from '../../domain/calisthenics/muscleups'
import { validatePushupAttempt, validateRepAttempt, type PushupAttempt } from '../../domain/calisthenics/pushups'
import { pauseRestoredRecording, validateCardioTiming, validateLiveCardio, type CardioTiming, type LiveCardio } from '../../domain/cardio/timing'
import { CARDIO_TABLES, CARDIO_TIMING_TABLES, validateCardioDetails, validateCardioDraft, validateCardioParent, type CardioDetails, type CardioDraft } from '../../domain/cardio/models'
import type { Routine, RoutineExercise } from '../../domain/strength/routines'
// In-memory helpers support small fixtures and compatibility checks. Production file operations use pipeline.ts.
import type { Table } from 'dexie'
import { GLOBAL_REST_KEY, validateRestSeconds } from '../../domain/rest'
import { recordBackupRequest, type BackupStatus } from './status'
import { APP_VERSION } from '../../app/version'
import { emptyStrengthData, STRENGTH_TABLES, type StrengthData } from '../../domain/strength/models'
import { legacyPreference, normalizeDefinition } from '../../domain/strength/exerciseMetadata'
import type { CatalogueState, ExercisePreference } from '../../domain/strength/models'
import { validateCatalogueStates, validateExercisePreferences, validateRoutine, validateRoutineExercise, validateStrengthData } from '../../domain/strength/validation'
import { db, BACKUP_TABLES, type AthleticDatabase } from '../db/database'
import { validateText, type AppMetadata, type FoundationRecord } from '../../domain/foundation'

import { assertBackupSize, utf8Bytes } from './limits'
export { MAX_BACKUP_BYTES } from './limits'
export const BACKUP_VERSION = 15
export const SUPPORTED_BACKUP_VERSIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, BACKUP_VERSION]

function backupTables(version: number) {
  if (version >= 15) return [...BACKUP_TABLES]
  const previousTables = BACKUP_TABLES.filter(name => name !== 'frontLeverAttempts' && (version >= 14 || name !== 'handstandAttempts') && (version >= 13 || name !== 'plancheAttempts') && (version >= 12 || name !== 'muscleupAttempts') && (version >= 11 || name !== 'pullupAttempts') && (version >= 10 || name !== 'pushupAttempts'))
  if (version >= 8) return previousTables
  if (version === 7) return previousTables.filter(name => !(CARDIO_TIMING_TABLES as readonly string[]).includes(name))
  if (version >= 5) return previousTables.filter(name => !([...CARDIO_TABLES, ...CARDIO_TIMING_TABLES] as readonly string[]).includes(name))
  return ['metadata', 'foundationRecords', ...(version > 1 ? STRENGTH_TABLES : []),
    ...(version >= 4 ? ['exercisePreferences', 'catalogueState'] : [])]
}

export interface BackupData extends StrengthData { metadata: AppMetadata[]; foundationRecords: FoundationRecord[]; exercisePreferences: ExercisePreference[]; catalogueState: CatalogueState[]; routines: Routine[]; routineExercises: RoutineExercise[]; cardioDetails: CardioDetails[]; cardioDrafts: CardioDraft[]; cardioTiming: CardioTiming[]; cardioLive: LiveCardio[]; pushupAttempts: PushupAttempt[]; pullupAttempts: PushupAttempt[]; muscleupAttempts: MuscleupAttempt[]; plancheAttempts: PlancheAttempt[]; handstandAttempts: HandstandAttempt[]; frontLeverAttempts: FrontLeverAttempt[] }
export interface Backup {
  format: 'athletic-tracker-backup'
  formatVersion: typeof BACKUP_VERSION
  exportedAt: string
  appVersion: string
  data: BackupData
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object in the backup.')
  return value as Record<string, unknown>
}
function keys(value: Record<string, unknown>, expected: string[]) {
  if (Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) {
    throw new Error('Backup contains missing or unsupported fields.')
  }
}
function string(value: unknown, max = 200): string {
  if (typeof value !== 'string' || !value.length || value.length > max) throw new Error('Backup contains an invalid text field.')
  return value
}
function date(value: unknown): string {
  const text = string(value)
  const parsed = new Date(text)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== text) throw new Error('Backup contains an invalid UTC date.')
  return text
}
export function validateBackup(value: unknown): Backup {
  const root = object(value)
  if (root.format !== 'athletic-tracker-backup') throw new Error('This is not an AthleticTracker backup.')
  const version = root.formatVersion as number
  if (!SUPPORTED_BACKUP_VERSIONS.includes(version)) throw new Error('Unsupported backup version. Your data has not been changed.')
  keys(root, ['format', 'formatVersion', 'exportedAt', 'appVersion', 'data'])
  const data = object(root.data)
  keys(data, backupTables(version))
  if (!Array.isArray(data.metadata) || !Array.isArray(data.foundationRecords)) throw new Error('Backup tables must be arrays.')
  if (data.metadata.filter(value => object(value).key === 'createdAt').length !== 1) throw new Error('Backup must contain the database creation date.')
  const metadataKeys = new Set<string>()
  const metadata = data.metadata.map(value => {
    const item = object(value)
    keys(item, ['key', 'value'])
    const key = string(item.key)
    if (metadataKeys.has(key)) throw new Error('Duplicate metadata key.')
    metadataKeys.add(key)
    if (key === 'createdAt') return { key, value: date(item.value) }
    if (version >= 3 && key === GLOBAL_REST_KEY) {
      const value = string(item.value)
      if (!/^\d+$/.test(value)) throw new Error('Invalid global rest preference.')
      validateRestSeconds(Number(value))
      return { key, value }
    }
    throw new Error('Unsupported metadata key.')
  })
  const ids = new Set<string>()
  const foundationRecords = data.foundationRecords.map(value => {
    const item = object(value)
    keys(item, ['id', 'text', 'createdAt', 'updatedAt'])
    const id = string(item.id)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || ids.has(id)) throw new Error('Backup contains invalid or duplicate record identifiers.')
    ids.add(id)
    const text = string(item.text, 10000)
    validateText(text)
    const createdAt = date(item.createdAt)
    const updatedAt = date(item.updatedAt)
    if (updatedAt < createdAt) throw new Error('A record was updated before it was created.')
    return { id, text, createdAt, updatedAt }
  })
  const strength = root.formatVersion === 1 ? emptyStrengthData() : Object.fromEntries(STRENGTH_TABLES.map(name => [name, data[name]]))
  validateStrengthData(strength)
  if (version < 6) {
    for (const name of ['sessionExercises', 'strengthSets'] as const) {
      for (const row of strength[name]) validateBackupRecord(name, row, version)
    }
  }
  const cardioDetails = version >= 7 ? data.cardioDetails : []
  const cardioDrafts = version >= 7 ? data.cardioDrafts : []
  if (!Array.isArray(cardioDetails) || !Array.isArray(cardioDrafts)) throw new Error('Invalid cardio tables.')
  const activities = new Map(strength.sessionActivities.map(row => [row.id, row]))
  const sessions = new Map(strength.sessions.map(row => [row.id, row]))
  const cardioActivities = strength.sessionActivities.filter(row => row.activityType === 'cardio')
  if (version < 9 && strength.sessionActivities.some(row => row.activityType === 'calisthenics')) throw new Error('Calisthenics requires backup format 9.')
  if (version < 7 && cardioActivities.length) throw new Error('Cardio requires backup format 7.')
  const pushupAttempts = version >= 10 ? data.pushupAttempts : []
  if (!Array.isArray(pushupAttempts)) throw new Error('Invalid push-up attempts table.')
  const attemptIds = new Set<string>()
  for (const attempt of pushupAttempts) {
    validatePushupAttempt(attempt)
    if (attemptIds.has(attempt.id)) throw new Error('Duplicate push-up attempt.')
    attemptIds.add(attempt.id)
  }
  const pullupAttempts = version >= 11 ? data.pullupAttempts : []
  if (!Array.isArray(pullupAttempts)) throw new Error('Invalid pull-up attempts table.')
  attemptIds.clear()
  for (const attempt of pullupAttempts) {
    validateRepAttempt(attempt)
    if (attemptIds.has(attempt.id)) throw new Error('Duplicate pull-up attempt.')
    attemptIds.add(attempt.id)
  }
  const muscleupAttempts = version >= 12 ? data.muscleupAttempts : []
  if (!Array.isArray(muscleupAttempts)) throw new Error('Invalid muscle-up attempts table.')
  attemptIds.clear()
  for (const attempt of muscleupAttempts) {
    validateMuscleupAttempt(attempt)
    if (attemptIds.has(attempt.id)) throw new Error('Duplicate muscle-up progression attempt.')
    attemptIds.add(attempt.id)
  }
  const plancheAttempts = version >= 13 ? data.plancheAttempts : []
  if (!Array.isArray(plancheAttempts)) throw new Error('Invalid planche attempts table.')
  attemptIds.clear()
  for (const attempt of plancheAttempts) {
    validatePlancheAttempt(attempt)
    if (attemptIds.has(attempt.id)) throw new Error('Duplicate planche attempt.')
    attemptIds.add(attempt.id)
  }
  const handstandAttempts = version >= 14 ? data.handstandAttempts : []
  if (!Array.isArray(handstandAttempts)) throw new Error('Invalid handstand attempts table.')
  attemptIds.clear()
  for (const attempt of handstandAttempts) {
    validateHandstandAttempt(attempt)
    if (attemptIds.has(attempt.id)) throw new Error('Duplicate handstand attempt.')
    attemptIds.add(attempt.id)
  }
  const frontLeverAttempts = version >= 15 ? data.frontLeverAttempts : []
  if (!Array.isArray(frontLeverAttempts)) throw new Error('Invalid front lever attempts table.')
  attemptIds.clear()
  for (const attempt of frontLeverAttempts) {
    validateFrontLeverAttempt(attempt)
    if (attemptIds.has(attempt.id)) throw new Error('Duplicate front lever attempt.')
    attemptIds.add(attempt.id)
  }
  const cardioTiming = version >= 8 ? data.cardioTiming : []
  const cardioLive = version >= 8 ? data.cardioLive : []
  if (!Array.isArray(cardioTiming) || !Array.isArray(cardioLive) || cardioLive.length > 1) throw new Error('Invalid cardio timing tables.')
  cardioLive.forEach(validateLiveCardio)
  const timings = new Map<string, CardioTiming>()
  for (const row of cardioTiming) {
    validateCardioTiming(row)
    if (timings.has(row.id)) throw new Error('Duplicate cardio timing.')
    timings.set(row.id, row)
  }
  const cardioIds = new Set<string>()
  for (const row of cardioDetails) {
    validateCardioDetails(row)
    const activity = activities.get(row.id)
    validateCardioParent(row, activity, activity && sessions.get(activity.sessionId), timings.get(row.id))
    if (cardioIds.has(row.id)) throw new Error('Duplicate cardio details.')
    cardioIds.add(row.id)
  }
  if (cardioTiming.some(row => !cardioIds.has(row.id))) throw new Error('Missing cardio details for saved timing.')
  if (cardioActivities.some(row => !cardioIds.has(row.id))) throw new Error('Missing cardio details.')
  const cardioSessionIds = new Set(cardioActivities.map(row => row.sessionId))
  if (strength.restTimers.some(row => cardioSessionIds.has(row.sessionId))) throw new Error('A cardio session cannot have a strength rest timer.')
  const draftIds = new Set<string>()
  for (const row of cardioDrafts) {
    validateCardioDraft(row)
    if (draftIds.has(row.id)) throw new Error('Duplicate cardio draft.')
    draftIds.add(row.id)
  }
  const exercisePreferences = version >= 4 ? structuredClone(data.exercisePreferences) : strength.exercises.map(legacyPreference)
  const catalogueState = version >= 4 ? structuredClone(data.catalogueState) : []
  validateExercisePreferences(exercisePreferences); validateCatalogueStates(catalogueState)
  const libraryIds = new Set(strength.exercises.map(row=>row.id))
  if ((catalogueState as CatalogueState[]).some(row=>!libraryIds.has(row.exerciseId))) throw new Error('Catalogue state refers to a missing definition.')
  // Older imports split personal rest from definitions; snapshots stay byte-for-byte unchanged.
  if (version < 4) strength.exercises = strength.exercises.map(normalizeDefinition)
  const routines = version >= 5 ? data.routines : []
  const routineExercises = version >= 5 ? data.routineExercises : []
  if (!Array.isArray(routines) || !Array.isArray(routineExercises)) throw new Error('Invalid routine tables.')
  const routineIds = new Set<string>()
  for (const row of routines) {
    validateRoutine(row)
    if (routineIds.has(row.id)) throw new Error('Duplicate routine.')
    routineIds.add(row.id)
  }
  const exerciseIds = new Set<string>(), positions = new Set<string>()
  for (const row of routineExercises) {
    validateRoutineExercise(row)
    if (!routineIds.has(row.routineId)) throw new Error('Routine exercise has no parent routine.')
    const position = `${row.routineId}:${row.position}`
    if (exerciseIds.has(row.id) || positions.has(position)) throw new Error('Duplicate routine exercise or position.')
    exerciseIds.add(row.id); positions.add(position)
  }
  return { format: 'athletic-tracker-backup', formatVersion: BACKUP_VERSION, exportedAt: date(root.exportedAt), appVersion: string(root.appVersion), data: { metadata, foundationRecords, ...structuredClone(strength), exercisePreferences: exercisePreferences as ExercisePreference[], catalogueState: catalogueState as CatalogueState[], routines: structuredClone(routines), routineExercises: structuredClone(routineExercises), cardioDetails: structuredClone(cardioDetails), cardioDrafts: structuredClone(cardioDrafts), cardioTiming: structuredClone(cardioTiming), cardioLive: structuredClone(cardioLive), pushupAttempts: structuredClone(pushupAttempts), pullupAttempts: structuredClone(pullupAttempts), muscleupAttempts: structuredClone(muscleupAttempts), plancheAttempts: structuredClone(plancheAttempts), handstandAttempts: structuredClone(handstandAttempts), frontLeverAttempts: structuredClone(frontLeverAttempts) } }
}
export function parseBackup(text: string): Backup {
  assertBackupSize(utf8Bytes(text))
  let value: unknown
  try { value = JSON.parse(text) } catch { throw new Error('The selected file is not valid JSON.') }
  return validateBackup(value)
}
async function readData(database: AthleticDatabase): Promise<BackupData> {
  const entries = await Promise.all(BACKUP_TABLES.map(async name => [name, await database.table(name).toArray()] as const))
  return Object.fromEntries(entries) as unknown as BackupData
}
export async function createBackup(database: AthleticDatabase = db): Promise<Backup> {
  const data = await database.transaction('r', BACKUP_TABLES.map(name => database.table(name)), () => readData(database))
  return validateBackup({ format: 'athletic-tracker-backup', formatVersion: BACKUP_VERSION, exportedAt: new Date().toISOString(), appVersion: APP_VERSION, data })
}
export async function restoreBackup(value: unknown, database: AthleticDatabase = db, expectedCurrent?: Backup): Promise<void> {
  // Validate and detach the complete input before starting any write transaction.
  const backup = validateBackup(value)
  const tables: [keyof BackupData, Table][] = BACKUP_TABLES.map(name => [name, database[name]])
  await database.transaction('rw', tables.map(([, table]) => table), async () => {
    if (expectedCurrent && JSON.stringify(await readData(database)) !== JSON.stringify(expectedCurrent.data)) {
      throw new Error('Local data changed after the safety backup. Cancel restore and start again to protect the newer changes.')
    }
    for (const [, table] of tables) await table.clear()
    for (const [name, table] of tables) await table.bulkAdd(name === 'cardioLive' ? backup.data.cardioLive.map(row => pauseRestoredRecording(row, backup.exportedAt)) : backup.data[name])
  })
}
export function serializeBackup(backup: Backup): string {
  const text = JSON.stringify(validateBackup(backup), null, 2)
  assertBackupSize(utf8Bytes(text))
  return text
}
export function downloadBackup(backup: Backup, prefix = 'athletic-tracker'): BackupStatus {
  const text = serializeBackup(backup)
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${prefix}-${backup.exportedAt.replace(/[:.]/g, '-')}.json`
  try {
    document.body.append(link)
    link.click()
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  } finally { link.remove() }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
  return recordBackupRequest()
}

/** Envelope/row checks shared with the disk-staged production pipeline. */
export function validateBackupEnvelope(header: unknown, tables: string[]) {
  const root=object(header)
  keys(root,['format','formatVersion','exportedAt','appVersion'])
  if(root.format!=='athletic-tracker-backup') throw new Error('This is not an AthleticTracker backup.')
  if(!SUPPORTED_BACKUP_VERSIONS.includes(root.formatVersion as number)) throw new Error('Unsupported backup version. Your data has not been changed.')
  const version=root.formatVersion as number
  const expected=backupTables(version)
  if(tables.length!==expected.length || expected.some(name=>!tables.includes(name))) throw new Error('Backup contains missing or unsupported tables.')
  return { format:'athletic-tracker-backup' as const,formatVersion:version,exportedAt:date(root.exportedAt),appVersion:string(root.appVersion) }
}
export function validateBackupRecord(name: string, value: unknown, version: number): void {
  const item=object(value)
  if (version < 6 && ((name === 'sessionExercises' && Object.hasOwn(item, 'supersetSlotId')) ||
    (name === 'strengthSets' && Object.hasOwn(item, 'supersetRoundIndex')))) {
    throw new Error('Exercise replacement requires backup format 6.')
  }
  if (version < 9 && name === 'sessionActivities' && item.activityType === 'calisthenics') throw new Error('Calisthenics requires backup format 9.')
  if (version < 7 && name === 'sessionActivities' && item.activityType === 'cardio') throw new Error('Cardio requires backup format 7.')
  if (name === 'cardioDetails') validateCardioDetails(value)
  if (name === 'cardioTiming') validateCardioTiming(value)
  if (name === 'frontLeverAttempts') validateFrontLeverAttempt(value)
  if (name === 'handstandAttempts') validateHandstandAttempt(value)
  if (name === 'plancheAttempts') validatePlancheAttempt(value)
  if (name === 'muscleupAttempts') validateMuscleupAttempt(value)
  if (name === 'pullupAttempts') validateRepAttempt(value)
  if (name === 'pushupAttempts') validatePushupAttempt(value)
  if (name === 'cardioLive') validateLiveCardio(value)
  if (name === 'cardioDrafts') validateCardioDraft(value)
  if(name==='metadata') {
    keys(item,['key','value'])
    if(item.key==='createdAt') { date(item.value); return }
    if(version>=3 && item.key===GLOBAL_REST_KEY) {
      const value=string(item.value);if(!/^\d+$/.test(value)) throw new Error('Invalid global rest preference.')
      validateRestSeconds(Number(value));return
    }
    throw new Error('Unsupported metadata key.')
  }
  if(name==='foundationRecords') {
    keys(item,['id','text','createdAt','updatedAt'])
    const id=string(item.id)
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Invalid record identifier.')
    validateText(string(item.text,10000))
    if(date(item.updatedAt)<date(item.createdAt)) throw new Error('A record was updated before it was created.')
  } else if(name==='exercisePreferences') validateExercisePreferences([value])
  else if(name==='catalogueState') validateCatalogueStates([value])
  else if(name==='routines') validateRoutine(value)
  else if(name==='routineExercises') validateRoutineExercise(value)
}
