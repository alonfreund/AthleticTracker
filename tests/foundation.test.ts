import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { deleteRecord, listRecords, saveRecord } from '../src/data/repositories/foundation'
import { createBackup, parseBackup, restoreBackup } from '../src/data/backup/backup'

const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) {
  const value = new AthleticDatabase(name)
  databases.push(value)
  return value
}
afterEach(async () => {
  vi.restoreAllMocks()
  for (const value of databases.splice(0)) await value.delete()
})

describe('local saving', () => {
  it('preserves metadata when upgrading the original version 1 store', async () => {
    const name = crypto.randomUUID()
    const old = new Dexie(name)
    old.version(1).stores({ metadata: '&key' })
    await old.table('metadata').put({ key: 'createdAt', value: '2026-01-01T00:00:00.000Z' })
    old.close()
    const upgraded = database(name)
    await verifyLocalStorage(upgraded)
    expect((await upgraded.metadata.get('createdAt'))?.value).toBe('2026-01-01T00:00:00.000Z')
    expect(await listRecords(upgraded)).toEqual([])
  })
  it('persists records after closing and opening a new database connection', async () => {
    const first = database()
    await verifyLocalStorage(first)
    const original = await saveRecord('A test\nwith Unicode 🏃', undefined, first)
    first.close()
    const reopened = database(first.name)
    expect(await listRecords(reopened)).toEqual([original])
    const edited = await saveRecord('Edited', original.id, reopened)
    expect(edited.id).toBe(original.id)
    expect(edited.createdAt).toBe(original.createdAt)
    expect((await listRecords(reopened))[0].text).toBe('Edited')
    await deleteRecord(original.id, reopened)
    expect(await listRecords(reopened)).toEqual([])
  })
  it('rejects blank and oversized text without changing saved data', async () => {
    const value = database()
    await saveRecord('Keep', undefined, value)
    await expect(saveRecord('  ', undefined, value)).rejects.toThrow()
    await expect(saveRecord('a'.repeat(10001), undefined, value)).rejects.toThrow()
    expect(await value.foundationRecords.count()).toBe(1)
  })
  it('reports a database write failure and preserves the previous record', async () => {
    const value = database()
    const saved = await saveRecord('Original', undefined, value)
    vi.spyOn(value.foundationRecords, 'put').mockRejectedValueOnce(new Error('Quota exceeded'))
    await expect(saveRecord('New', saved.id, value)).rejects.toThrow('Quota exceeded')
    expect((await listRecords(value))[0].text).toBe('Original')
  })
})

describe('backups', () => {
  it('round-trips all fields through JSON into an empty store', async () => {
    const source = database()
    await verifyLocalStorage(source)
    await saveRecord('One', undefined, source)
    await saveRecord('Two', undefined, source)
    const exported = await createBackup(source)
    const imported = parseBackup(JSON.stringify(exported))
    const target = database()
    await restoreBackup(imported, target)
    expect((await createBackup(target)).data).toEqual(exported.data)
  })
  it('replaces rather than merges and supports an empty records backup', async () => {
    const source = database()
    await verifyLocalStorage(source)
    const target = database()
    await verifyLocalStorage(target)
    await saveRecord('Remove me', undefined, target)
    await restoreBackup(await createBackup(source), target)
    expect(await listRecords(target)).toEqual([])
    expect(await target.metadata.toArray()).toEqual(await source.metadata.toArray())
  })
  it('rejects malformed, unsupported and ambiguous files without changing data', async () => {
    const value = database()
    await verifyLocalStorage(value)
    await saveRecord('Keep', undefined, value)
    const original = await createBackup(value)
    expect(() => parseBackup('{')).toThrow('valid JSON')
    const mutations = [
      { ...original, formatVersion: 99 },
      { ...original, format: 'another-app' },
      { ...original, exportedAt: '2026-02-30T00:00:00.000Z' },
      { ...original, unexpected: true },
      { ...original, data: { ...original.data, metadata: [] } },
      { ...original, data: { ...original.data, foundationRecords: [original.data.foundationRecords[0], original.data.foundationRecords[0]] } },
      { ...original, data: { ...original.data, foundationRecords: [{ ...original.data.foundationRecords[0], text: 12 }] } },
      { ...original, data: { ...original.data, foundationRecords: [{ ...original.data.foundationRecords[0], id: 'invalid' }] } },
    ]
    for (const invalid of mutations) {
      await expect(restoreBackup(invalid, value)).rejects.toThrow()
      expect((await createBackup(value)).data).toEqual(original.data)
    }
  })
  it('rolls back clears and writes if a restore fails midway', async () => {
    const source = database()
    await verifyLocalStorage(source)
    await saveRecord('Replacement', undefined, source)
    const incoming = await createBackup(source)
    const target = database()
    await verifyLocalStorage(target)
    await saveRecord('Original', undefined, target)
    const original = await createBackup(target)
    vi.spyOn(target.foundationRecords, 'bulkAdd').mockRejectedValueOnce(new Error('Simulated write failure'))
    await expect(restoreBackup(incoming, target)).rejects.toThrow('Simulated write failure')
    expect((await createBackup(target)).data).toEqual(original.data)
  })
  it('blocks replacement when another tab changes data after the safety snapshot', async () => {
    const value = database()
    await verifyLocalStorage(value)
    const safety = await createBackup(value)
    await saveRecord('Newer change', undefined, value)
    await expect(restoreBackup(safety, value, safety)).rejects.toThrow('Local data changed')
    expect((await listRecords(value))[0].text).toBe('Newer change')
  })
})
