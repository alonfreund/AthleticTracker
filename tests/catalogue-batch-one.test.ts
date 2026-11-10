import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { installCatalogue, validateCatalogue } from '../src/data/catalogue'
import { BUILTIN_EXERCISES, STARTER_EXERCISES, LEGACY_STARTER_EXERCISES, CATALOGUE_BATCHES } from '../src/domain/strength/catalog'
import { BATCH_ONE_EXERCISES } from '../src/domain/strength/catalogue/batch1'
import { filterExercises, createCustomExercise } from '../src/data/repositories/exercises'
import { setFavourite } from '../src/data/repositories/preferences'
import { startWorkout, addWorkoutExercise, saveExerciseRest } from '../src/data/repositories/workouts'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { stageImport, stageSnapshot, restoreStagedBackup, exportBackupFile, discardStage } from '../src/data/backup/pipeline'
import reservations from './fixtures/batch-one-ids.json'
import released from './fixtures/catalogue-0.9.0.json'
import previous from './fixtures/backup-v3-rest-0.7.0.json'
const databases:AthleticDatabase[]=[]
function database(name=crypto.randomUUID()){const db=new AthleticDatabase(name);databases.push(db);return db}
afterEach(async()=>{for(const db of databases.splice(0))await db.delete()})
describe('approved catalogue preparation and Batch 1',()=>{
  it('retains the released twelve definitions and frozen migration baselines exactly',()=>{
    expect(STARTER_EXERCISES).toEqual(released.current)
    expect(LEGACY_STARTER_EXERCISES).toEqual(released.legacy)
  })
  it('ships exactly 80 permanently reserved additions and no unapproved batches',()=>{
    expect(CATALOGUE_BATCHES.map(batch=>batch.id)).toEqual(['original','batch-1','batch-2','batch-3','batch-4'])
    expect(BATCH_ONE_EXERCISES).toHaveLength(80);expect([...STARTER_EXERCISES,...BATCH_ONE_EXERCISES]).toHaveLength(92)
    expect(Object.fromEntries(BATCH_ONE_EXERCISES.map(row=>[row.id,row.name]))).toEqual(reservations)
    for(const row of BUILTIN_EXERCISES)expect(row.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(()=>validateCatalogue(BUILTIN_EXERCISES)).not.toThrow()
  })
  it('provides complete authored metadata and explicit repetition/load guidance for every addition',()=>{
    expect(new Set(BATCH_ONE_EXERCISES.map(row=>row.instructions)).size).toBe(80)
    for(const row of BATCH_ONE_EXERCISES){
      expect(row.instructions.length).toBeGreaterThan(80)
      expect(row.metadata!.aliases.length).toBeGreaterThan(0)
      expect(row.metadata!.movementPatternIds.length).toBeGreaterThan(0)
      expect(['total','per-side']).toContain(row.metadata!.repetitionConvention)
      expect(row.defaultRestSeconds).toBeNull()
      expect(row.equipmentIds.length).toBeGreaterThan(0)
      expect(row.notes).toContain(row.metadata!.repetitionConvention==='per-side'?'Reps are per side':'one rep')
    }
    const named=(name:string)=>BATCH_ONE_EXERCISES.find(row=>row.name===name)!
    expect(named('Band lat pulldown').tracking).toEqual({measurement:'reps',load:'none',weightConvention:null})
    expect(named('Weighted chin-up').tracking.load).toBe('added')
    expect(named('Assisted chin-up machine').tracking.load).toBe('assisted')
    expect(named('Dumbbell bench press').tracking.weightConvention).toBe('per-hand')
    expect(named('Smith machine bench press').notes).toContain('exclude the Smith carriage')
    expect(named('Meadows row').notes).toContain('exclude the bar and attachment')
    expect(named('Standing cable chest fly').notes).toContain('ONE stack')
  })
  it('finds aliases and includes specific shoulder heads/machines in broad filters',()=>{
    expect(filterExercises(BUILTIN_EXERCISES,{query:'DB Z press'}).map(row=>row.name)).toContain('Dumbbell Z press')
    expect(filterExercises(BUILTIN_EXERCISES,{muscle:'shoulders',primaryOnly:true}).some(row=>row.name==='Dumbbell lateral raise')).toBe(true)
    expect(filterExercises(BUILTIN_EXERCISES,{equipment:'machine'}).some(row=>row.name==='Shoulder press machine')).toBe(true)
    expect(filterExercises(BUILTIN_EXERCISES,{equipment:'cable'}).some(row=>row.name==='Neutral-grip lat pulldown')).toBe(true)
  })
  it('rejects a synonym in a partial batch against previously shipped variations before writing',async()=>{
    const db=database(),copy=structuredClone(BATCH_ONE_EXERCISES[0]);copy.id=crypto.randomUUID();copy.name='A renamed duplicate'
    await expect(installCatalogue([copy],db)).rejects.toThrow('variation')
    expect(await db.exercises.count()).toBe(0)
  })
  it('adds only 80, preserving customs, preferences, completed history, active snapshots and drafts across reopen/restore',async()=>{
    const db=database();await restoreBackup(previous,db);await installCatalogue(STARTER_EXERCISES,db)
    const custom=await createCustomExercise({...STARTER_EXERCISES[0],name:BATCH_ONE_EXERCISES[0].name,defaultRestSeconds:83},db)
    await setFavourite(custom.id,true,db)
    // Imported history includes completed and unfinished rows, with raw drafts and timers.
    const before=(await createBackup(db)).data
    expect((await installCatalogue([...STARTER_EXERCISES,...BATCH_ONE_EXERCISES],db)).added).toBe(80)
    const after=(await createBackup(db)).data
    for(const key of ['sessions','sessionActivities','sessionExercises','strengthSets','supersetGroups','restTimers','editorDrafts','exercisePreferences','foundationRecords'] as const)expect(after[key]).toEqual(before[key])
    expect(await db.exercises.get(custom.id)).toEqual(custom)
    for(const original of before.exercises)expect(await db.exercises.get(original.id)).toEqual(original)
    db.close();const reopened=database(db.name);await reopened.open()
    expect(await installCatalogue([...STARTER_EXERCISES,...BATCH_ONE_EXERCISES],reopened)).toEqual({added:0,updated:0,preserved:[]})
    const exported=await exportBackupFile(reopened),target=database()
    await verifyLocalStorage(target)
    const incoming=await stageImport(exported.blob,target),safety=await stageSnapshot(target)
    await restoreStagedBackup(incoming,safety,target)
    expect((await createBackup(target)).data).toEqual(after)
    await discardStage(exported.snapshot.id,reopened)
  })
  it('keeps an unfinished new-exercise snapshot when the catalogue is subsequently revised',async()=>{
    const db=database();await installCatalogue(undefined,db)
    const source=BATCH_ONE_EXERCISES[0],session=await startWorkout(db),instance=await addWorkoutExercise(session,source.id,db)
    await saveExerciseRest(session,instance,97,db);await setFavourite(source.id,true,db)
    const snapshot=await db.sessionExercises.get(instance)
    await installCatalogue([{...structuredClone(source),revision:2,instructions:source.instructions+' Revised guidance.'}],db)
    expect(await db.sessionExercises.get(instance)).toEqual(snapshot)
    expect(await db.exercisePreferences.get(source.id)).toMatchObject({restSeconds:97,favourite:true})
  })
  it('preserves an established repetition convention rather than silently changing future comparisons',async()=>{
    const db=database();await installCatalogue(undefined,db)
    const source=BATCH_ONE_EXERCISES[0],changed=structuredClone(source)
    changed.revision++;changed.metadata!.repetitionConvention='per-side'
    expect((await installCatalogue([changed],db)).preserved).toEqual([source.id])
    expect(await db.exercises.get(source.id)).toEqual(source)
  })
  it('detects formatting-only duplicate names and variation descriptions',()=>{
    const copy=structuredClone(BATCH_ONE_EXERCISES[0]);copy.id=crypto.randomUUID();copy.name='  DUMBBELL   BENCH PRESS  '
    expect(()=>validateCatalogue([BATCH_ONE_EXERCISES[0],copy])).toThrow('Duplicate')
    copy.name='Renamed press';copy.metadata!.variant.grip='  PRONATED '
    expect(()=>validateCatalogue([BATCH_ONE_EXERCISES[0],copy])).toThrow('variation')
  })
  it('rolls back a failure halfway through the batch, including catalogue markers, and can retry safely',async()=>{
    const db=database();await installCatalogue(STARTER_EXERCISES,db)
    await verifyLocalStorage(db)
    const before=(await createBackup(db)).data;let writes=0
    const fail=()=>{if(++writes===40)throw new Error('Quota during Batch 1')}
    db.catalogueState.hook('creating',fail)
    await expect(installCatalogue([...STARTER_EXERCISES,...BATCH_ONE_EXERCISES],db)).rejects.toThrow('Quota during Batch 1')
    expect((await createBackup(db)).data).toEqual(before)
    db.catalogueState.hook('creating').unsubscribe(fail)
    expect((await installCatalogue([...STARTER_EXERCISES,...BATCH_ONE_EXERCISES],db)).added).toBe(80)
    expect(await db.exercises.count()).toBe(92)
  })
})
