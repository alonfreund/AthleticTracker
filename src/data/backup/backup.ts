// In-memory helpers support small fixtures and compatibility checks. Production file operations use pipeline.ts.
import type { Table } from 'dexie'
import { GLOBAL_REST_KEY, validateRestSeconds } from '../../domain/rest'
import { recordBackupRequest, type BackupStatus } from './status'
import { APP_VERSION } from '../../app/version'
import { emptyStrengthData, STRENGTH_TABLES, type StrengthData } from '../../domain/strength/models'
import { legacyPreference, normalizeDefinition } from '../../domain/strength/exerciseMetadata'
import type { CatalogueState, ExercisePreference } from '../../domain/strength/models'
import { validateCatalogueStates, validateExercisePreferences, validateStrengthData } from '../../domain/strength/validation'
import { db, BACKUP_TABLES, type AthleticDatabase } from '../db/database'
import { validateText, type AppMetadata, type FoundationRecord } from '../../domain/foundation'

import { assertBackupSize, utf8Bytes } from './limits'
export { MAX_BACKUP_BYTES } from './limits'
export interface BackupData extends StrengthData { metadata: AppMetadata[]; foundationRecords: FoundationRecord[]; exercisePreferences: ExercisePreference[]; catalogueState: CatalogueState[] }
export interface Backup {
  format: 'athletic-tracker-backup'
  formatVersion: 4
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
  if (root.formatVersion !== 1 && root.formatVersion !== 2 && root.formatVersion !== 3 && root.formatVersion !== 4) throw new Error('Unsupported backup version. Your data has not been changed.')
  keys(root, ['format', 'formatVersion', 'exportedAt', 'appVersion', 'data'])
  const data = object(root.data)
  keys(data, ['metadata', 'foundationRecords', ...(root.formatVersion !== 1 ? STRENGTH_TABLES : []), ...(root.formatVersion === 4 ? ['exercisePreferences','catalogueState'] : [])])
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
    if ((root.formatVersion === 3 || root.formatVersion === 4) && key === GLOBAL_REST_KEY) {
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
  const exercisePreferences = root.formatVersion === 4 ? structuredClone(data.exercisePreferences) : strength.exercises.map(legacyPreference)
  const catalogueState = root.formatVersion === 4 ? structuredClone(data.catalogueState) : []
  validateExercisePreferences(exercisePreferences); validateCatalogueStates(catalogueState)
  const libraryIds = new Set(strength.exercises.map(row=>row.id))
  if ((catalogueState as CatalogueState[]).some(row=>!libraryIds.has(row.exerciseId))) throw new Error('Catalogue state refers to a missing definition.')
  // Older imports split personal rest from definitions; snapshots stay byte-for-byte unchanged.
  if (root.formatVersion !== 4) strength.exercises = strength.exercises.map(normalizeDefinition)
  return { format: 'athletic-tracker-backup', formatVersion: 4, exportedAt: date(root.exportedAt), appVersion: string(root.appVersion), data: { metadata, foundationRecords, ...structuredClone(strength), exercisePreferences: exercisePreferences as ExercisePreference[], catalogueState: catalogueState as CatalogueState[] } }
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
  return validateBackup({ format: 'athletic-tracker-backup', formatVersion: 4, exportedAt: new Date().toISOString(), appVersion: APP_VERSION, data })
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
    for (const [name, table] of tables) await table.bulkAdd(backup.data[name])
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
  if(![1,2,3,4].includes(root.formatVersion as number)) throw new Error('Unsupported backup version. Your data has not been changed.')
  const version=root.formatVersion as number
  const expected=['metadata','foundationRecords',...(version!==1?STRENGTH_TABLES:[]),...(version===4?['exercisePreferences','catalogueState']:[])]
  if(tables.length!==expected.length || expected.some(name=>!tables.includes(name))) throw new Error('Backup contains missing or unsupported tables.')
  return { format:'athletic-tracker-backup' as const,formatVersion:version,exportedAt:date(root.exportedAt),appVersion:string(root.appVersion) }
}
export function validateBackupRecord(name: string, value: unknown, version: number): void {
  const item=object(value)
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
}
