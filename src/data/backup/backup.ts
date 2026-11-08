import { db, type AthleticDatabase } from '../db/database'
import { validateText, type AppMetadata, type FoundationRecord } from '../../domain/foundation'

export const MAX_BACKUP_BYTES = 10 * 1024 * 1024
export interface Backup {
  format: 'athletic-tracker-backup'
  formatVersion: 1
  exportedAt: string
  appVersion: string
  data: { metadata: AppMetadata[]; foundationRecords: FoundationRecord[] }
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object in the backup.')
  return value as Record<string, unknown>
}
function keys(value: Record<string, unknown>, expected: string[]) {
  if (Object.keys(value).length !== expected.length || expected.some(key => !(key in value))) {
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
  if (root.formatVersion !== 1) throw new Error('Unsupported backup version. Your data has not been changed.')
  keys(root, ['format', 'formatVersion', 'exportedAt', 'appVersion', 'data'])
  const data = object(root.data)
  keys(data, ['metadata', 'foundationRecords'])
  if (!Array.isArray(data.metadata) || !Array.isArray(data.foundationRecords)) throw new Error('Backup tables must be arrays.')
  if (data.metadata.length !== 1) throw new Error('Backup must contain the database creation date.')
  const metadata = data.metadata.map(value => {
    const item = object(value)
    keys(item, ['key', 'value'])
    if (item.key !== 'createdAt') throw new Error('Unsupported metadata key.')
    return { key: 'createdAt', value: date(item.value) }
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
  return { format: 'athletic-tracker-backup', formatVersion: 1, exportedAt: date(root.exportedAt), appVersion: string(root.appVersion), data: { metadata, foundationRecords } }
}
export function parseBackup(text: string): Backup {
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 10 MB limit for this foundation version.')
  let value: unknown
  try { value = JSON.parse(text) } catch { throw new Error('The selected file is not valid JSON.') }
  return validateBackup(value)
}
export async function createBackup(database: AthleticDatabase = db): Promise<Backup> {
  const data = await database.transaction('r', database.metadata, database.foundationRecords, async () => ({
    metadata: await database.metadata.toArray(),
    foundationRecords: await database.foundationRecords.toArray(),
  }))
  return validateBackup({ format: 'athletic-tracker-backup', formatVersion: 1, exportedAt: new Date().toISOString(), appVersion: '0.0.0', data })
}
export async function restoreBackup(value: unknown, database: AthleticDatabase = db, expectedCurrent?: Backup): Promise<void> {
  const backup = validateBackup(value)
  await database.transaction('rw', database.metadata, database.foundationRecords, async () => {
    if (expectedCurrent) {
      const current = { metadata: await database.metadata.toArray(), foundationRecords: await database.foundationRecords.toArray() }
      if (JSON.stringify(current) !== JSON.stringify(expectedCurrent.data)) {
        throw new Error('Local data changed after the safety backup. Cancel restore and start again to protect the newer changes.')
      }
    }
    await database.metadata.clear()
    await database.foundationRecords.clear()
    await database.metadata.bulkAdd(backup.data.metadata)
    await database.foundationRecords.bulkAdd(backup.data.foundationRecords)
  })
}
export function downloadBackup(backup: Backup, prefix = 'athletic-tracker'): void {
  const text = JSON.stringify(backup, null, 2)
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the supported 10 MB limit. Export cannot safely continue.')
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${prefix}-${backup.exportedAt.replace(/[:.]/g, '-')}.json`
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
