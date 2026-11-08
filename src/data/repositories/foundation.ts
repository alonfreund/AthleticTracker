import { db, type AthleticDatabase } from '../db/database'
import { validateText } from '../../domain/foundation'

export function listRecords(database = db) {
  return database.foundationRecords.orderBy('updatedAt').reverse().toArray()
}
export async function saveRecord(text: string, id?: string, database: AthleticDatabase = db) {
  validateText(text)
  return database.transaction('rw', database.foundationRecords, async () => {
    const existing = id ? await database.foundationRecords.get(id) : undefined
    if (id && !existing) throw new Error('This record no longer exists. Reload the list before editing.')
    const clock = new Date().toISOString()
    const now = existing && existing.updatedAt > clock ? existing.updatedAt : clock
    const record = { id: existing?.id ?? crypto.randomUUID(), text, createdAt: existing?.createdAt ?? now, updatedAt: now }
    await database.foundationRecords.put(record)
    return record
  })
}
export async function deleteRecord(id: string, database = db) {
  await database.transaction('rw', database.foundationRecords, () => database.foundationRecords.delete(id))
}
