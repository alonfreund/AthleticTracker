import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestPersistence } from '../src/data/storage/persistence'
import { readHistory, writeHistory, readBackupStatus } from '../src/data/backup/status'
import { createBackup, downloadBackup, MAX_BACKUP_BYTES, parseBackup, restoreBackup, serializeBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { saveRecord } from '../src/data/repositories/foundation'
import { emptyStrengthData } from '../src/domain/strength/models'
import legacy from './fixtures/backup-v1-app-0.0.0.json'
import emptyLegacy from './fixtures/backup-v1-app-0.1.1-empty.json'

const databases: AthleticDatabase[] = []
function database() { const value = new AthleticDatabase(crypto.randomUUID()); databases.push(value); return value }
function historyStorage() {
  const values = new Map<string, string>()
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
}
afterEach(async () => {
  vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals()
  for (const value of databases.splice(0)) await value.delete()
})

describe('persistent storage request', () => {
  it('requests protection when not already granted', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    expect(await requestPersistence({ persisted: async () => false, persist })).toBe('granted')
    expect(persist).toHaveBeenCalledOnce()
  })
  it('does not request again when already granted', async () => {
    const persist = vi.fn()
    expect(await requestPersistence({ persisted: async () => true, persist })).toBe('granted')
    expect(persist).not.toHaveBeenCalled()
  })
  it('distinguishes denial, unsupported APIs and failures', async () => {
    expect(await requestPersistence({ persist: async () => false })).toBe('not-granted')
    expect(await requestPersistence({})).toBe('unsupported')
    expect(await requestPersistence({ persist: async () => { throw new Error('Unavailable') } })).toBe('unavailable')
  })
})

describe('backup request history', () => {
  it('persists and rereads the date without claiming the file was retained', () => {
    const storage = historyStorage()
    expect(readHistory(storage).requestedAt).toBeNull()
    const date = '2026-11-10T03:00:00.000Z'
    expect(writeHistory(storage, date)).toEqual({ requestedAt: date, historySaved: true })
    expect(readHistory(storage)).toEqual({ requestedAt: date, historySaved: true })
  })
  it('handles unavailable preference storage without blocking exports', () => {
    const storage = { getItem: () => { throw new Error('Denied') }, setItem: () => { throw new Error('Denied') } }
    expect(readHistory(storage).historySaved).toBe(false)
    expect(writeHistory(storage, '2026-11-10T03:00:00.000Z').historySaved).toBe(false)
  })
  it('ignores malformed stored dates', () => {
    expect(readHistory({ getItem: () => 'not a date', setItem() {} }).requestedAt).toBeNull()
  })
  it('records only requested downloads and cleans up a failed download', () => {
    vi.useFakeTimers()
    const storage = historyStorage()
    vi.stubGlobal('localStorage', storage)
    const click = vi.fn()
    const remove = vi.fn()
    vi.stubGlobal('document', { createElement: () => ({ click, remove }), body: { append() {} } })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const backup = parseBackup(JSON.stringify(legacy))
    click.mockImplementationOnce(() => { throw new Error('Download blocked') })
    expect(() => downloadBackup(backup)).toThrow('Download blocked')
    expect(readBackupStatus().requestedAt).toBeNull()
    expect(remove).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:test')
    const status = downloadBackup(backup)
    expect(status.requestedAt).not.toBeNull()
    expect(readBackupStatus()).toEqual(status)
    vi.runAllTimers()
  })
})

describe('fixed historical backup fixtures', () => {
  it.each([['app 0.0.0 with records', legacy], ['app 0.1.1 empty', emptyLegacy]])('restores %s into the current database schema', async (_name, fixture) => {
    const value = database()
    await verifyLocalStorage(value)
    await saveRecord('Replaced by historical backup', undefined, value)
    await restoreBackup(parseBackup(JSON.stringify(fixture)), value)
    const exported = await createBackup(value)
    expect(exported.data).toEqual({ ...fixture.data, ...emptyStrengthData(), exercisePreferences: [], catalogueState: [], routines: [], routineExercises: [], cardioDetails: [], cardioDrafts: [], cardioTiming: [], cardioLive: [], pushupAttempts: [], pullupAttempts: [], muscleupAttempts: [] })
    expect(parseBackup(serializeBackup(exported)).data).toEqual({ ...fixture.data, ...emptyStrengthData(), exercisePreferences: [], catalogueState: [], routines: [], routineExercises: [], cardioDetails: [], cardioDrafts: [], cardioTiming: [], cardioLive: [], pushupAttempts: [], pullupAttempts: [], muscleupAttempts: [] })
  })
  it('rejects oversized JSON and validates export before any download', () => {
    expect(() => parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1))).toThrow('100 MB')
    const backup = parseBackup(JSON.stringify(legacy))
    backup.data.foundationRecords[0].updatedAt = 'invalid'
    expect(() => serializeBackup(backup)).toThrow('UTC date')
  })
})
