import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AthleticDatabase, BACKUP_TABLES, INTERNAL_BACKUP_TABLES, verifyLocalStorage } from '../src/data/db/database'
import { createBackup, parseBackup, restoreBackup, serializeBackup, validateBackup } from '../src/data/backup/backup'
import { emptyStrengthData, massInKilograms, snapshotExercise, STRENGTH_TABLES } from '../src/domain/strength/models'
import { validateExercise } from '../src/domain/strength/validation'
import historical from './fixtures/backup-v1-app-0.0.0.json'
import fixture from './fixtures/backup-v2-strength-0.2.0.json'

const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) { const value = new AthleticDatabase(name); databases.push(value); return value }
function example() { return validateBackup(structuredClone(fixture)) }
afterEach(async () => { vi.restoreAllMocks(); for (const value of databases.splice(0)) await value.delete() })

describe('additive strength migration', () => {
  it('upgrades a real v2 store, preserving every old row without seeding or replacing data', async () => {
    const name = crypto.randomUUID()
    const old = new Dexie(name)
    old.version(1).stores({ metadata: '&key' })
    old.version(2).stores({ metadata: '&key', foundationRecords: '&id, updatedAt' })
    await old.table('metadata').bulkAdd(historical.data.metadata)
    await old.table('foundationRecords').bulkAdd(historical.data.foundationRecords)
    old.close()
    const current = database(name)
    await verifyLocalStorage(current)
    expect(current.verno).toBe(7)
    expect(await current.metadata.toArray()).toEqual(historical.data.metadata)
    expect(await current.foundationRecords.toArray()).toEqual(historical.data.foundationRecords)
    for (const name of STRENGTH_TABLES) expect(await current.table(name).count()).toBe(0)
  })
})

describe('strength backup and recovery', () => {
  it('round-trips every table, target, load, timer, draft and snapshot through JSON and reopening', async () => {
    const source = database()
    const original = example()
    await restoreBackup(original, source)
    const exported = await createBackup(source)
    expect(exported.formatVersion).toBe(7)
    expect(exported.data).toEqual(original.data)
    const target = database()
    await restoreBackup(parseBackup(serializeBackup(exported)), target)
    target.close()
    const reopened = database(target.name)
    expect((await createBackup(reopened)).data).toEqual(original.data)
    expect((await reopened.editorDrafts.toArray())[0].values.durationSeconds).toBe('1:')
  })
  it('imports v1 as empty strength tables; full replacement deliberately removes newer workout data', async () => {
    const target = database()
    await restoreBackup(example(), target)
    await restoreBackup(historical, target)
    expect((await createBackup(target)).data).toEqual({ ...historical.data, ...emptyStrengthData(), exercisePreferences: [], catalogueState: [], routines: [], routineExercises: [], cardioDetails: [], cardioDrafts: [] })
  })
  it('keeps historical snapshots independent of subsequent library edits and library removal', async () => {
    const value = database()
    await restoreBackup(example(), value)
    const library = (await value.exercises.toArray())[0]
    const snapshot = snapshotExercise(library)
    library.name = 'Renamed library entry'; library.revision++
    library.tracking.measurement = 'duration'
    expect(snapshot.name).toBe('Bench press')
    expect(snapshot.tracking.measurement).toBe('reps')
    await value.exercises.put(library)
    const exported = await createBackup(value)
    expect(exported.data.sessionExercises[0].snapshot.name).toBe('Bench press')
    await value.exercises.clear()
    expect((await createBackup(value)).data.sessionExercises).toEqual(example().data.sessionExercises)
  })
  it('rolls back all original and new tables after a late write failure', async () => {
    const value = database()
    await restoreBackup(example(), value)
    const before = await createBackup(value)
    const replacement = example()
    replacement.data.sessions[0].title = 'Should not remain'
    vi.spyOn(value.editorDrafts, 'bulkAdd').mockRejectedValueOnce(new Error('Disk full'))
    await expect(restoreBackup(replacement, value)).rejects.toThrow('Disk full')
    expect((await createBackup(value)).data).toEqual(before.data)
  })
  it('rejects invalid relationships before touching even the original tables', async () => {
    const value = database()
    await restoreBackup(historical, value)
    const clear = vi.spyOn(value.metadata, 'clear')
    const broken = example()
    broken.data.sessionActivities[0].sessionId = crypto.randomUUID()
    await expect(restoreBackup(broken, value)).rejects.toThrow('missing parent')
    expect(clear).not.toHaveBeenCalled()
    expect((await createBackup(value)).data.foundationRecords).toEqual(historical.data.foundationRecords)
  })
  it('covers every persistent table in the backup transaction', () => {
    expect([...database().tables.map(table => table.name).filter(name=>!(INTERNAL_BACKUP_TABLES as readonly string[]).includes(name))].sort()).toEqual([...BACKUP_TABLES].sort())
  })
})

describe('structured strength validation', () => {
  const invalidCases: [string, (value: ReturnType<typeof example>) => void][] = [
    ['duplicate ids', value => { value.data.exercises.push(value.data.exercises[0]) }],
    ['duplicate ordering', value => { value.data.strengthSets[2].position = 0 }],
    ['missing parent', value => { value.data.strengthSets[0].sessionExerciseId = crypto.randomUUID() }],
    ['missing superset', value => { value.data.sessionExercises[0].supersetGroupId = crypto.randomUUID() }],
    ['invalid superset size', value => { value.data.sessionExercises[1].supersetGroupId = null }],
    ['missing reps', value => { value.data.strengthSets[0].reps = null }],
    ['zero completed reps', value => { value.data.strengthSets[0].reps = 0 }],
    ['completion before session', value => { value.data.strengthSets[0].completedAt = '2026-11-09T00:00:00.000Z' }],
    ['missing completed timestamp', value => { value.data.strengthSets[0].completedAt = null }],
    ['negative assistance', value => { const load = value.data.strengthSets[4].load; if (load.mode === 'assisted' && load.assistance) load.assistance.value = -10 }],
    ['missing external load', value => { value.data.strengthSets[0].load = { mode: 'external', weight: null } }],
    ['wrong load mode', value => { value.data.strengthSets[0].load = { mode: 'none' } }],
    ['invalid effort', value => { value.data.strengthSets[0].rpe = 11 }],
    ['negative RIR', value => { value.data.strengthSets[0].rir = -1 }],
    ['missing hold duration', value => { value.data.strengthSets[2].durationSeconds = null }],
    ['reps on a hold', value => { value.data.strengthSets[2].reps = 3 }],
    ['reversed target', value => { value.data.strengthSets[0].target!.reps = { min: 10, max: 8 } }],
    ['running timer missing deadline', value => { value.data.restTimers[0].deadline = null }],
    ['timer referencing incomplete set', value => { value.data.restTimers[0].sourceSetId = value.data.strengthSets[1].id }],
    ['orphan editor draft', value => { value.data.editorDrafts[0].setId = crypto.randomUUID() }],
    ['invalid session end', value => { value.data.sessions[0].status = 'finished' }],
  ]
  it.each(invalidCases)('rejects %s', (_name, mutate) => {
    const value = example(); mutate(value)
    expect(() => validateBackup(value)).toThrow()
  })
  it('rejects unsupported units, non-finite values and unknown fields', () => {
    const value = structuredClone(fixture)
    const first = value.data.strengthSets[0]
    first.load = { mode: 'external', weight: { value: 40, unit: 'stone' } } as typeof first.load
    expect(() => validateBackup(value)).toThrow()
    expect(() => validateBackup({ ...fixture, data: { ...fixture.data, unexpected: [] } })).toThrow()
    const nonFinite = example()
    nonFinite.data.strengthSets[0].rpe = Infinity
    expect(() => validateBackup(nonFinite)).toThrow()
  })
  it('accepts all defined set types without changing measurements', () => {
    for (const setType of ['normal', 'warm-up', 'failure', 'drop-set', 'back-off', 'amrap'] as const) {
      const value = example(); value.data.strengthSets[0].setType = setType
      expect(validateBackup(value).data.strengthSets[0].setType).toBe(setType)
    }
  })
  it('keeps actuals separate from targets, and converts units without rewriting entered values', () => {
    const value = example()
    expect(value.data.strengthSets[0].reps).toBe(8)
    expect(value.data.strengthSets[0].target?.reps).toEqual({ min: 8, max: 10 })
    const entered = { value: 100, unit: 'lb' as const }
    expect(massInKilograms(entered)).toBeCloseTo(45.359237, 8)
    expect(massInKilograms({ value: 20, unit: 'kg' })).toBe(20)
    expect(entered).toEqual({ value: 100, unit: 'lb' })
  })
  it('validates tracking configurations and muscle classifications', () => {
    const exercise = example().data.exercises[0]
    exercise.secondaryMuscleGroupIds = [...exercise.primaryMuscleGroupIds]
    expect(() => validateExercise(exercise)).toThrow('overlap')
    exercise.secondaryMuscleGroupIds = []
    exercise.tracking.weightConvention = null
    expect(() => validateExercise(exercise)).toThrow('convention')
  })
})
