import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AthleticDatabase, BACKUP_TABLES } from '../src/data/db/database'
import { installCatalogue, validateCatalogue } from '../src/data/catalogue'
import { BUILTIN_EXERCISES, STARTER_EXERCISES, LEGACY_STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { exerciseFingerprint, normalizeDefinition } from '../src/domain/strength/exerciseMetadata'
import { createBackup, restoreBackup, parseBackup, serializeBackup, validateBackup } from '../src/data/backup/backup'
import { createCustomExercise, filterExercises, initializeExerciseLibrary } from '../src/data/repositories/exercises'
import { exerciseRest, setFavourite } from '../src/data/repositories/preferences'
import { addWorkoutExercise, saveExerciseRest, loadWorkout, startWorkout } from '../src/data/repositories/workouts'
import type { Exercise } from '../src/domain/strength/models'
import fixture from './fixtures/backup-v2-strength-0.2.0.json'
import previous from './fixtures/backup-v3-rest-0.7.0.json'
const databases: AthleticDatabase[]=[]
function database(name=crypto.randomUUID()){const db=new AthleticDatabase(name);databases.push(db);return db}
const stores={ metadata:'&key',foundationRecords:'&id, updatedAt',exercises:'&id, name',sessions:'&id, status, startedAt',sessionActivities:'&id, sessionId, [sessionId+position]',sessionExercises:'&id, sessionActivityId, sourceExerciseId, supersetGroupId, [sessionActivityId+position]',strengthSets:'&id, sessionExerciseId, [sessionExerciseId+position]',supersetGroups:'&id, sessionActivityId',restTimers:'&sessionId',editorDrafts:'&id, sessionId, &setId' }
afterEach(async()=>{vi.restoreAllMocks();for(const db of databases.splice(0))await db.delete()})
async function legacyDatabase(){
  const old=new Dexie(crypto.randomUUID());old.version(3).stores(stores)
  for(const [name,rows]of Object.entries(previous.data))await old.table(name).bulkAdd(structuredClone(rows))
  // The old app increments exercise revision when saving rest; it is not a catalogue revision.
  await old.table('exercises').add({...structuredClone(LEGACY_STARTER_EXERCISES[0]),revision:17,defaultRestSeconds:71})
  const name=old.name;old.close();return database(name)
}
function nextDefinition(index=0){const definition=structuredClone(STARTER_EXERCISES[index]);definition.revision++;definition.instructions+=' Updated original guidance.';return definition}
describe('schema 4 migration and preference separation',()=>{
  it('upgrades an actual v3 database, preserving every workout row and snapshot verbatim',async()=>{
    const db=await legacyDatabase();await db.open();expect(db.verno).toBe(7)
    for(const name of ['sessions','sessionActivities','sessionExercises','strengthSets','supersetGroups','restTimers','editorDrafts'] as const)expect(await db[name].toArray()).toEqual(previous.data[name])
    expect(await db.metadata.toArray()).toEqual(previous.data.metadata)
    expect(await db.exercisePreferences.get(previous.data.exercises[0].id)).toMatchObject({restSeconds:83,favourite:false})
    expect(await exerciseRest(LEGACY_STARTER_EXERCISES[0].id,db)).toBe(71)
    expect((await db.exercises.get(previous.data.exercises[0].id))?.category).toBe('strength')
    expect((await db.exercises.get(previous.data.exercises[0].id))?.metadata?.exerciseType).toBe('unspecified')
    const before=await db.exercisePreferences.toArray();db.close();const reopened=database(db.name);await reopened.open()
    expect(await reopened.exercisePreferences.toArray()).toEqual(before)
  })
  it('rolls back the complete migration if a preference write fails',async()=>{
    const db=await legacyDatabase()
    db.exercisePreferences.hook('creating',()=>{throw new Error('Storage full during migration')})
    await expect(db.open()).rejects.toThrow('Storage full during migration')
    db.close()
    const old=new Dexie(db.name);old.version(3).stores(stores)
    try {
      await old.open();expect(old.verno).toBe(3)
      expect(await old.table('sessionExercises').toArray()).toEqual(previous.data.sessionExercises)
      expect((await old.table('exercises').get(previous.data.exercises[0].id)).defaultRestSeconds).toBe(83)
      expect(old.tables.some(table=>table.name==='exercisePreferences')).toBe(false)
    } finally { old.close() }
  })
  it('keeps preference timestamps valid when an imported backup is ahead of the device clock',async()=>{
    const db=database();await restoreBackup(previous,db)
    const source=previous.data.exercises[0].id
    await db.exercisePreferences.update(source,{createdAt:'2090-01-01T00:00:00.000Z',updatedAt:'2090-01-01T00:00:00.000Z'})
    await setFavourite(source,true,db)
    const session=await startWorkout(db),instance=await addWorkoutExercise(session,source,db)
    await saveExerciseRest(session,instance,81,db)
    expect((await db.exercisePreferences.get(source))?.updatedAt).toBe('2090-01-01T00:00:00.000Z')
    await expect(createBackup(db)).resolves.toBeDefined()
  })
  it('updates a migrated built-in despite legacy rest revisions, preserving its personal preference',async()=>{
    const db=await legacyDatabase();await initializeExerciseLibrary(db)
    const id=LEGACY_STARTER_EXERCISES[0].id
    expect((await db.exercises.get(id))?.metadata?.aliases).toContain('BB bench press')
    expect((await db.catalogueState.get(id))?.appliedRevision).toBe(2)
    expect(await exerciseRest(id,db)).toBe(71)
    expect(await db.exercises.count()).toBe(BUILTIN_EXERCISES.length + previous.data.exercises.length) // all twelve built-ins plus every existing custom definition
    expect(await db.sessionExercises.toArray()).toEqual(previous.data.sessionExercises)
  })
  it('custom creation keeps all metadata and stores personal rest/favourite independently',async()=>{
    const db=database();const source=structuredClone(STARTER_EXERCISES[0]);source.name='My press'
    const custom=await createCustomExercise({...source,defaultRestSeconds:79},db)
    expect(custom.metadata).toEqual(source.metadata);expect(custom.defaultRestSeconds).toBeNull()
    await setFavourite(custom.id,true,db);expect(await exerciseRest(custom.id,db)).toBe(79)
    const session=await startWorkout(db),instance=await addWorkoutExercise(session,custom.id,db)
    const definition=await db.exercises.get(custom.id)
    await saveExerciseRest(session,instance,87,db)
    expect(await db.exercises.get(custom.id)).toEqual(definition)
    expect(await db.exercisePreferences.get(custom.id)).toMatchObject({restSeconds:87,favourite:true})
    expect((await loadWorkout(session,db)).sessionExercises[0].snapshot).toEqual(definition)
  })
})
describe('safe versioned catalogue updates',()=>{
  it('seeds the approved manifest while retaining all original IDs and is idempotent across connections',async()=>{
    const db=database();expect((await installCatalogue(undefined,db)).added).toBe(BUILTIN_EXERCISES.length)
    const before=await db.exercises.toArray(),state=await db.catalogueState.toArray()
    expect(await installCatalogue(undefined,db)).toEqual({added:0,updated:0,preserved:[]})
    expect(await db.exercises.toArray()).toEqual(before);expect(await db.catalogueState.toArray()).toEqual(state)
    expect(before.map(row=>row.id).sort()).toEqual(BUILTIN_EXERCISES.map(row=>row.id).sort())
  })
  it('updates original content, keeps preferences, and never refreshes unfinished snapshots',async()=>{
    const db=database();await initializeExerciseLibrary(db)
    const session=await startWorkout(db),instance=await addWorkoutExercise(session,STARTER_EXERCISES[0].id,db)
    await saveExerciseRest(session,instance,77,db);await setFavourite(STARTER_EXERCISES[0].id,true,db)
    const snapshot=(await loadWorkout(session,db)).sessionExercises[0].snapshot
    const next=nextDefinition();expect((await installCatalogue([next],db)).updated).toBe(1)
    expect((await db.exercises.get(next.id))?.instructions).toBe(next.instructions)
    expect((await loadWorkout(session,db)).sessionExercises[0].snapshot).toEqual(snapshot)
    expect(await db.exercisePreferences.get(next.id)).toMatchObject({restSeconds:77,favourite:true})
    await installCatalogue(STARTER_EXERCISES,db);expect((await db.exercises.get(next.id))?.revision).toBe(next.revision)
  })
  it('preserves local edits, custom ID collisions and incompatible tracking changes',async()=>{
    const db=database();await installCatalogue(undefined,db)
    await db.exercises.update(STARTER_EXERCISES[0].id,{notes:'My local note'})
    const next=nextDefinition();expect((await installCatalogue([next],db)).preserved).toEqual([next.id])
    expect((await db.exercises.get(next.id))?.notes).toBe('My local note')
    const changed=nextDefinition(1);changed.tracking={measurement:'duration',load:'external',weightConvention:'total'}
    expect((await installCatalogue([changed],db)).preserved).toEqual([changed.id])
    const collision={...structuredClone(STARTER_EXERCISES[2]),origin:'custom' as const};await db.exercises.put(collision)
    expect((await installCatalogue([nextDefinition(2)],db)).preserved).toEqual([collision.id])
    expect(await db.exercises.get(collision.id)).toEqual(collision)
  })
  it('archives only by explicit revision and never deletes entries omitted from a batch',async()=>{
    const db=database();await installCatalogue(undefined,db)
    const retired=nextDefinition();retired.archived=true;await installCatalogue([retired],db)
    expect(await db.exercises.count()).toBe(BUILTIN_EXERCISES.length);expect((await db.exercises.get(retired.id))?.archived).toBe(true)
    expect(filterExercises(await db.exercises.toArray(),{}).some(row=>row.id===retired.id)).toBe(false)
  })
  it('rolls back definitions and catalogue markers when a later write fails',async()=>{
    const db=database();await installCatalogue(undefined,db)
    const before=await db.exercises.toArray(),state=await db.catalogueState.toArray()
    vi.spyOn(db.catalogueState,'put').mockRejectedValueOnce(new Error('Storage full'))
    await expect(installCatalogue([nextDefinition()],db)).rejects.toThrow('Storage full')
    expect(await db.exercises.toArray()).toEqual(before);expect(await db.catalogueState.toArray()).toEqual(state)
  })
  it('rejects invalid taxonomy and duplicate identities/variations before any write',async()=>{
    const db=database();const duplicate=structuredClone(STARTER_EXERCISES[0]);duplicate.id=crypto.randomUUID();duplicate.name='Another name for same press'
    await expect(installCatalogue([STARTER_EXERCISES[0],duplicate],db)).rejects.toThrow('variation')
    const bad=structuredClone(STARTER_EXERCISES[0]);bad.metadata!.movementPatternIds=['invented-pattern']
    expect(()=>validateCatalogue([bad])).toThrow('pattern')
    await expect(installCatalogue([STARTER_EXERCISES[0],STARTER_EXERCISES[0]],db)).rejects.toThrow('Duplicate')
    expect(await db.exercises.count()).toBe(0)
  })
  it('canonical fingerprints do not confuse timestamps/rest revisions with content edits',()=>{
    const original=LEGACY_STARTER_EXERCISES[0],changed={...original,revision:99,defaultRestSeconds:87,updatedAt:'2026-12-01T00:00:00.000Z'}
    expect(exerciseFingerprint(changed)).toBe(exerciseFingerprint(original))
    expect(exerciseFingerprint({...original,notes:'Changed'})).not.toBe(exerciseFingerprint(original))
  })
})
describe('backup versions and metadata validation',()=>{
  it('normalises fixed format-2/3 backups without altering snapshots, sets, raw drafts or timers',async()=>{
    for(const old of [fixture,previous]){
      const db=database();await restoreBackup(old,db);const backup=await createBackup(db)
      expect(backup.formatVersion).toBe(7)
      for(const key of ['sessionExercises','strengthSets','editorDrafts','restTimers']as const)expect(backup.data[key]).toEqual(old.data[key])
      expect(backup.data.exercises).toEqual(old.data.exercises.map(row=>normalizeDefinition(row as Exercise)))
      const target=database();await restoreBackup(parseBackup(serializeBackup(backup)),target)
      expect((await createBackup(target)).data).toEqual(backup.data)
    }
  })
  it('round-trips definitions, preferences and catalogue baselines and still applies a later update',async()=>{
    const db=database();await restoreBackup(previous,db);await installCatalogue(undefined,db)
    await setFavourite(STARTER_EXERCISES[0].id,true,db)
    const backup=await createBackup(db),target=database();await restoreBackup(parseBackup(serializeBackup(backup)),target)
    expect((await createBackup(target)).data).toEqual(backup.data)
    expect((await installCatalogue([nextDefinition()],target)).updated).toBe(1)
    expect((await target.exercisePreferences.get(STARTER_EXERCISES[0].id))?.favourite).toBe(true)
    expect(BACKUP_TABLES).toContain('exercisePreferences');expect(BACKUP_TABLES).toContain('catalogueState')
  })
  it('rejects malformed metadata/preferences/baselines before replacing saved records',async()=>{
    const db=database();await restoreBackup(previous,db);const before=await createBackup(db)
    const changes=[
      (value:typeof before)=>{value.data.exercises[0].metadata!.version=99 as 1},
      (value:typeof before)=>{value.data.exercises[0].metadata!.variant.grip=5 as unknown as string},
      (value:typeof before)=>{value.data.exercisePreferences[0].restSeconds=-1},
      (value:typeof before)=>{value.data.exercisePreferences.push(value.data.exercisePreferences[0])},
      (value:typeof before)=>{value.data.catalogueState.push({exerciseId:value.data.exercises[0].id,appliedRevision:-1,fingerprint:'x',status:'managed'})},
    ]
    for(const change of changes){const invalid=structuredClone(before);change(invalid);await expect(restoreBackup(invalid,db)).rejects.toThrow()}
    expect((await createBackup(db)).data).toEqual(before.data)
    const future=structuredClone(before);future.formatVersion=99 as typeof before.formatVersion;expect(()=>validateBackup(future)).toThrow('Unsupported')
  })
  it('rolls back replacement if the final catalogue table cannot be restored',async()=>{
    const db=database();await restoreBackup(previous,db);const before=await createBackup(db)
    const incoming=structuredClone(before);incoming.data.exercises[0].name='Should not remain'
    vi.spyOn(db.catalogueState,'bulkAdd').mockRejectedValueOnce(new Error('Storage full'))
    await expect(restoreBackup(incoming,db)).rejects.toThrow('Storage full')
    expect((await createBackup(db)).data).toEqual(before.data)
  })
  it('searches aliases, grouped muscles, primary-only matches and new classification fields',()=>{
    expect(filterExercises([...STARTER_EXERCISES],{query:'RDL'})[0].name).toBe('Romanian deadlift')
    expect(filterExercises([...STARTER_EXERCISES],{exerciseType:'stability'}).map(row=>row.name)).toEqual(['Plank'])
    expect(filterExercises([...STARTER_EXERCISES],{movementPattern:'horizontal-push'})).toHaveLength(2)
    expect(filterExercises([...STARTER_EXERCISES],{muscle:'back'}).length).toBeGreaterThan(0)
    expect(filterExercises([...STARTER_EXERCISES],{muscle:'forearms',primaryOnly:true})).toHaveLength(0)
  })
})
