import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { installCatalogue, validateCatalogue } from '../src/data/catalogue'
import { BUILTIN_EXERCISES, CATALOGUE_BATCHES } from '../src/domain/strength/catalog'
import { BATCH_TWO_EXERCISES } from '../src/domain/strength/catalogue/batch2'
import { createCustomExercise, filterExercises } from '../src/data/repositories/exercises'
import { setFavourite } from '../src/data/repositories/preferences'
import { addSet, addWorkoutExercise, commitSet, finishWorkout, loadWorkout, saveExerciseRest, saveSetDraft, startWorkout } from '../src/data/repositories/workouts'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import released from './fixtures/catalogue-0.10.0.json'
import reservations from './fixtures/batch-two-ids.json'
import history from './fixtures/backup-v3-rest-0.7.0.json'
import type { Exercise } from '../src/domain/strength/models'
import type { SetInput } from '../src/domain/strength/logging'
const prior=released as Exercise[]
const databases:AthleticDatabase[]=[]
function database(name=crypto.randomUUID()){const db=new AthleticDatabase(name);databases.push(db);return db}
const named=(name:string)=>BATCH_TWO_EXERCISES.find(row=>row.name===name)!
const values=(weight:string,reps='8'):SetInput=>({weightUnit:'kg',values:{weight,bodyweight:'',reps,durationSeconds:'',rpe:'8',rir:'2'}})
afterEach(async()=>{
  const opened=databases.splice(0)
  for(const db of opened)db.close()
  for(const name of new Set(opened.map(db=>db.name)))await new AthleticDatabase(name).delete()
})
describe('Batch 2 lower-body catalogue',()=>{
  it('adds exactly 80 permanent IDs and leaves every released definition unchanged',()=>{
    expect([...prior,...BATCH_TWO_EXERCISES]).toHaveLength(172)
    expect(CATALOGUE_BATCHES.map(batch=>batch.id)).toEqual(['original','batch-1','batch-2','batch-3','batch-4','batches-5-8'])
    expect(BATCH_TWO_EXERCISES).toHaveLength(80)
    expect(BUILTIN_EXERCISES.filter(row=>prior.some(old=>old.id===row.id))).toEqual(prior)
    expect(Object.fromEntries(BATCH_TWO_EXERCISES.map(row=>[row.id,row.name]))).toEqual(reservations)
    expect(new Set(BUILTIN_EXERCISES.map(row=>row.id)).size).toBe(BUILTIN_EXERCISES.length)
    for(const row of BATCH_TWO_EXERCISES)expect(row.id).toMatch(/^ba51c200-0000-4000-8000-\d{12}$/)
  })
  it('validates the accumulated catalogue and provides complete, distinct descriptions',()=>{
    expect(()=>validateCatalogue(BUILTIN_EXERCISES)).not.toThrow()
    expect(new Set(BATCH_TWO_EXERCISES.map(row=>row.instructions)).size).toBe(80)
    for(const row of BATCH_TWO_EXERCISES){
      expect(row.instructions.length).toBeGreaterThan(100)
      expect(row.notes.length).toBeGreaterThan(50)
      expect(row.metadata!.aliases.length).toBeGreaterThan(0)
      expect(row.metadata!.movementPatternIds.length).toBeGreaterThan(0)
      expect(['per-side','total']).toContain(row.metadata!.repetitionConvention)
      expect(row.metadata!.variant.stance).toBeTruthy()
      expect(row.defaultRestSeconds).toBeNull()
      expect(row.notes).toContain(row.metadata!.repetitionConvention==='per-side'?'Reps are per side':'one rep')
    }
  })
  it('has no canonical-name or alias ownership collisions across all three content groups',()=>{
    const terms=new Map<string,string>()
    const canonical=(value:string)=>value.normalize('NFKC').toLowerCase().trim().replace(/[\s‐‑–—-]+/gu,' ')
    for(const row of BUILTIN_EXERCISES)for(const term of [row.name,...row.metadata!.aliases]){
      const key=canonical(term)
      expect(terms.get(key)??row.id,`${term} resolves to two definitions`).toBe(row.id)
      terms.set(key,row.id)
    }
  })
  it('uses truthful load and unilateral conventions rather than estimated resistance',()=>{
    expect(named('Dumbbell goblet squat').tracking.weightConvention).toBe('total')
    expect(named('Double-dumbbell front squat').tracking.weightConvention).toBe('per-hand')
    expect(named('Horizontal leg press machine').tracking.weightConvention).toBe('machine-display')
    expect(named('45-degree leg press').notes).toContain('excluding the sled')
    expect(named('Smith machine squat').notes).toContain('exclude the Smith carriage')
    expect(named('Landmine squat').notes).toContain('exclude the bar and attachment')
    expect(named('High-handle trap-bar deadlift').notes).toContain('actual trap-bar mass')
    expect(named('Single-leg 45-degree leg press').metadata!.repetitionConvention).toBe('per-side')
    expect(named('Bodyweight squat').tracking).toEqual({load:'bodyweight',measurement:'reps',weightConvention:null})
    expect(named('Bodyweight squat').equipmentIds).toEqual([])
    expect(named('Bodyweight glute bridge').metadata!.optionalEquipmentIds).toEqual(['mat'])
  })
  it('searches aliases, muscle groups and new machine classifications without duplicates',()=>{
    expect(filterExercises(BUILTIN_EXERCISES,{query:'B-stance DB RDL'}).map(row=>row.name)).toContain('Kickstand dumbbell Romanian deadlift')
    expect(filterExercises(BUILTIN_EXERCISES,{query:'Bulgarian'})).toHaveLength(3)
    expect(filterExercises(BUILTIN_EXERCISES,{equipment:'machine',muscle:'quadriceps',primaryOnly:true}).some(row=>row.name==='Pendulum squat machine')).toBe(true)
    expect(filterExercises(BUILTIN_EXERCISES,{muscle:'glutes',primaryOnly:true}).some(row=>row.name==='Barbell hip thrust')).toBe(true)
  })
  it('rejects a renamed Batch 2 variation submitted as a partial update before touching storage',async()=>{
    const db=database();await installCatalogue(prior,db)
    const copy=structuredClone(BATCH_TWO_EXERCISES[0]);copy.id=crypto.randomUUID();copy.name='Another front squat'
    await expect(installCatalogue([copy],db)).rejects.toThrow('variation')
    expect(await db.exercises.toArray()).toEqual([...prior].sort((a,b)=>a.id.localeCompare(b.id)))
  })
  it('upgrades a populated 0.10.0 library with only 80 additions, preserving all personal and workout data',async()=>{
    const db=database();await restoreBackup(history,db);await installCatalogue(prior,db)
    const custom=await createCustomExercise({...prior[0],name:BATCH_TWO_EXERCISES[0].name,defaultRestSeconds:107},db)
    await setFavourite(custom.id,true,db)
    await db.exercises.update(prior[12].id,{notes:'My existing note',archived:true})
    const before=(await createBackup(db)).data
    expect(await installCatalogue([...prior,...BATCH_TWO_EXERCISES],db)).toEqual({added:80,updated:0,preserved:[]})
    const after=(await createBackup(db)).data
    for(const key of Object.keys(before) as (keyof typeof before)[])if(key!=='exercises'&&key!=='catalogueState')expect(after[key]).toEqual(before[key])
    for(const row of before.exercises)expect(await db.exercises.get(row.id)).toEqual(row)
    for(const marker of before.catalogueState)expect(await db.catalogueState.get(marker.exerciseId)).toEqual(marker)
    expect(await db.exercises.get(custom.id)).toEqual(custom)
    db.close();const reopened=database(db.name);await reopened.open()
    expect(await installCatalogue([...prior,...BATCH_TWO_EXERCISES],reopened)).toEqual({added:0,updated:0,preserved:[]})
    expect((await createBackup(reopened)).data).toEqual(after)
    const output=await exportBackupFile(reopened),target=database();await verifyLocalStorage(target)
    const incoming=await stageImport(output.blob,target),safety=await stageSnapshot(target)
    await restoreStagedBackup(incoming,safety,target)
    expect((await createBackup(target)).data).toEqual(after)
    expect(await installCatalogue([...prior,...BATCH_TWO_EXERCISES],target)).toEqual({added:0,updated:0,preserved:[]})
    await discardStage(output.snapshot.id,reopened)
  })
  it('rolls back every Batch 2 definition/marker after a halfway storage failure and safely retries',async()=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue(prior,db)
    const before=(await createBackup(db)).data;let writes=0
    const fail=()=>{if(++writes===40)throw new Error('Batch 2 quota failure')}
    db.catalogueState.hook('creating',fail)
    await expect(installCatalogue([...prior,...BATCH_TWO_EXERCISES],db)).rejects.toThrow('Batch 2 quota failure')
    expect((await createBackup(db)).data).toEqual(before)
    db.catalogueState.hook('creating').unsubscribe(fail)
    const results=await Promise.all([installCatalogue([...prior,...BATCH_TWO_EXERCISES],db),installCatalogue([...prior,...BATCH_TWO_EXERCISES],db)])
    expect(results.map(row=>row.added).sort((a,b)=>a-b)).toEqual([0,80])
    expect(await db.exercises.count()).toBe(172);expect(await db.catalogueState.count()).toBe(172)
  })
  it('restoring an older backup and reinstalling adds the missing definitions without rewriting imported history',async()=>{
    const db=database();await installCatalogue([...prior,...BATCH_TWO_EXERCISES],db);await restoreBackup(history,db)
    const before=(await createBackup(db)).data
    await installCatalogue([...prior,...BATCH_TWO_EXERCISES],db)
    const after=(await createBackup(db)).data
    for(const key of ['sessions','sessionExercises','strengthSets','editorDrafts','restTimers','exercisePreferences'] as const)expect(after[key]).toEqual(before[key])
    for(const row of before.exercises)expect(await db.exercises.get(row.id)).toEqual(row)
    expect(BATCH_TWO_EXERCISES.every(row=>after.exercises.some(saved=>saved.id===row.id))).toBe(true)
  })
  it.each([
    ['Barbell front squat','40'],['Single-leg dumbbell Romanian deadlift','10'],['Horizontal leg press machine','30'],['Bodyweight glute bridge',''],
  ])('logs, recovers, finishes and backs up %s using existing workout storage',async(name,weight)=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue([...prior,...BATCH_TWO_EXERCISES],db)
    const source=named(name),session=await startWorkout(db),instance=await addWorkoutExercise(session,source.id,db)
    await saveExerciseRest(session,instance,103,db);await setFavourite(source.id,true,db)
    const first=(await loadWorkout(session,db)).strengthSets[0]
    await commitSet(session,first.id,values(weight),true,db)
    const second=await addSet(session,instance,db),draft=values(weight);draft.values.reps=''
    await saveSetDraft(session,second,draft,db)
    const before=await loadWorkout(session,db)
    db.close();const reopened=database(db.name)
    expect(await loadWorkout(session,reopened)).toEqual(before)
    await commitSet(session,second,values(weight,'6'),true,reopened)
    await finishWorkout(session,true,reopened)
    const finished=await loadWorkout(session,reopened)
    expect(finished.strengthSets.every(row=>row.completed)).toBe(true)
    expect(finished.sessionExercises[0].snapshot).toEqual(source)
    const target=database();await restoreBackup(await createBackup(reopened),target)
    expect(await loadWorkout(session,target)).toEqual(finished)
    expect(await target.exercisePreferences.get(source.id)).toMatchObject({restSeconds:103,favourite:true})
  })
})
