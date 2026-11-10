// A device-local preference, deliberately separate from restorable training data.
// Neither a timestamp nor a download request proves that the file was retained.
const KEY = 'athletic-tracker:last-backup-request'
export interface BackupStatus { requestedAt: string | null; historySaved: boolean }
type HistoryStorage = Pick<Storage, 'getItem' | 'setItem'>
export function readBackupStatus(): BackupStatus {
  try { return readHistory(globalThis.localStorage) }
  catch { return { requestedAt: null, historySaved: false } }
}
export function readHistory(storage: HistoryStorage): BackupStatus {
  try {
    const value = storage.getItem(KEY)
    if (!value) return { requestedAt: null, historySaved: true }
    const date = new Date(value)
    return { requestedAt: Number.isFinite(date.getTime()) && date.toISOString() === value ? value : null, historySaved: true }
  } catch { return { requestedAt: null, historySaved: false } }
}
export function recordBackupRequest(): BackupStatus {
  const requestedAt = new Date().toISOString()
  try { return writeHistory(globalThis.localStorage, requestedAt) }
  catch { return { requestedAt, historySaved: false } }
}
export function writeHistory(storage: HistoryStorage, requestedAt: string): BackupStatus {
  try { storage.setItem(KEY, requestedAt); return { requestedAt, historySaved: true } }
  catch { return { requestedAt, historySaved: false } }
}
