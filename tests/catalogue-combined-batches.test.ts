import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { installCatalogue, validateCatalogue } from '../src/data/catalogue'
import { BUILTIN_EXERCISES, CATALOGUE_BATCHES } from '../src/domain/strength/catalog'
import { COMBINED_BATCH_EXERCISES } from '../src/domain/strength/catalogue/batches5to8'
import { createCustomExercise, filterExercises } from '../src/data/repositories/exercises'
import { setFavourite } from '../src/data/repositories/preferences'
import { addSet, addWorkoutExercise, commitSet, finishWorkout, loadWorkout, saveExerciseRest, saveSetDraft, startWorkout } from '../src/data/repositories/workouts'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import released from './fixtures/catalogue-0.13.0.json'
import reservations from './fixtures/combined-batches-ids.json'
import history from './fixtures/backup-v3-rest-0.7.0.json'
import type { Exercise } from '../src/domain/strength/models'
import type { SetInput } from '../src/domain/strength/logging'
const prior=released as Exercise[]
const databases:AthleticDatabase[]=[]
function database(name=crypto.randomUUID()){const db=new AthleticDatabase(name);databases.push(db);return db}
const named=(name:string)=>COMBINED_BATCH_EXERCISES.find(row=>row.name===name)!
const values=(weight:string,reps='8'):SetInput=>({weightUnit:'kg',values:{weight,bodyweight:'',reps,durationSeconds:'',rpe:'8',rir:'2'}})
afterEach(async()=>{
  const opened=databases.splice(0)
  for(const db of opened)db.close()
  for(const name of new Set(opened.map(db=>db.name)))await new AthleticDatabase(name).delete()
})
describe('combined Batches 5–8 catalogue expansion',()=>{
  it('adds exactly 100 permanent IDs and leaves every released definition unchanged',()=>{
    expect([...prior,...COMBINED_BATCH_EXERCISES]).toHaveLength(432)
    expect(CATALOGUE_BATCHES.map(batch=>batch.id)).toEqual(['original','batch-1','batch-2','batch-3','batch-4','batches-5-8','grip-variations'])
    expect(COMBINED_BATCH_EXERCISES).toHaveLength(100)
    expect(BUILTIN_EXERCISES.filter(row=>prior.some(old=>old.id===row.id))).toEqual(prior)
    expect(Object.fromEntries(COMBINED_BATCH_EXERCISES.map(row=>[row.id,row.name]))).toEqual(reservations)
    expect(new Set(BUILTIN_EXERCISES.map(row=>row.id)).size).toBe(BUILTIN_EXERCISES.length)
    for(const row of COMBINED_BATCH_EXERCISES)expect(row.id).toMatch(/^ba51c580-0000-4000-8000-\d{12}$/)
  })
  it('validates the accumulated catalogue and provides complete, distinct descriptions',()=>{
    expect(()=>validateCatalogue(BUILTIN_EXERCISES)).not.toThrow()
    expect(new Set(COMBINED_BATCH_EXERCISES.map(row=>row.instructions)).size).toBe(100)
    for(const row of COMBINED_BATCH_EXERCISES){
      expect(row.instructions.length).toBeGreaterThan(100)
      expect(row.notes.length).toBeGreaterThan(50)
      expect(row.metadata!.aliases.length).toBeGreaterThan(0)
      expect(row.metadata!.movementPatternIds.length).toBeGreaterThan(0)
      expect(row.defaultRestSeconds).toBeNull()
      expect(row.metadata!.variant.stance).toBeTruthy()
      if(row.tracking.measurement==='duration'){
        expect(row.metadata!.repetitionConvention).toBe('unspecified')
        expect(row.notes).toMatch(/Log (?:hold )?duration in seconds/)
        expect(row.notes).not.toContain('One complete bilateral movement')
      } else {
        expect(['per-side','total']).toContain(row.metadata!.repetitionConvention)
        expect(row.notes).toContain(row.metadata!.repetitionConvention==='per-side'?'Reps are per side':'one rep')
      }
    }
  })
  it('has no canonical-name or alias ownership collisions across the whole catalogue',()=>{
    const terms=new Map<string,string>()
    const canonical=(value:string)=>value.normalize('NFKC').toLowerCase().trim().replace(/[\s‐‑–—-]+/gu,' ')
    for(const row of BUILTIN_EXERCISES)for(const term of [row.name,...row.metadata!.aliases]){
      const key=canonical(term)
      expect(terms.get(key)??row.id,`${term} resolves to two definitions`).toBe(row.id)
      terms.set(key,row.id)
    }
  })
  it('distinguishes bodyweight, band reps, bell load, timed manual resistance and measured implements',()=>{
    expect(named('Suspension-assisted pistol squat').tracking.load).toBe('bodyweight')
    expect(named('Suspension-assisted pistol squat').notes).toContain('Hand support is unmeasured')
    expect(named('Resistance-band biceps curl').tracking).toEqual({load:'none',measurement:'reps',weightConvention:null})
    expect(named('Resistance-band biceps curl').notes).toContain('without a kilogram estimate')
    expect(named('Single-arm kettlebell swing').tracking.weightConvention).toBe('total')
    expect(named('Single-arm kettlebell swing').metadata!.repetitionConvention).toBe('per-side')
    expect(named('Double-kettlebell front squat').tracking.weightConvention).toBe('per-hand')
    expect(named('Double-kettlebell front squat').notes).toContain('weight of one kettlebell')
    expect(named('Standing single-arm landmine press').notes).toContain('plates added at the free end only')
    expect(named('Hand-resisted lateral neck hold').tracking).toEqual({load:'none',measurement:'duration',weightConvention:null})
    expect(named('Hand-resisted lateral neck hold').notes).toContain('Duration is per side')
    expect(named('Ring support hold').tracking).toEqual({load:'bodyweight',measurement:'duration',weightConvention:null})
    expect(named('Medicine-ball chest pass').tracking.weightConvention).toBe('total')
    expect(named('Weighted 45-degree back extension').tracking.load).toBe('added')
    expect(named('Timed sled push').tracking).toEqual({load:'external',measurement:'duration',weightConvention:'total'})
    expect(named('Timed sled push').notes).toContain('excluding the unloaded sled')
    expect(named('Timed sled push').notes).toContain('distance is not measured')
    expect(named('Jump rope').notes).toContain('Log duration in seconds')
    expect(named('Jump rope').notes).not.toContain('hold duration')
  })
  it('finds new aliases and muscle/equipment groups and keeps editorial areas balanced',()=>{
    expect(filterExercises(BUILTIN_EXERCISES,{query:'TGU'}).map(row=>row.name)).toEqual(['Kettlebell Turkish get-up'])
    expect(filterExercises(BUILTIN_EXERCISES,{query:'TRX row'}).map(row=>row.name)).toContain('Suspension trainer row')
    expect(filterExercises(BUILTIN_EXERCISES,{equipment:'rings',muscle:'chest',primaryOnly:true}).some(row=>row.name==='Ring push-up')).toBe(true)
    expect(filterExercises(BUILTIN_EXERCISES,{muscle:'neck',primaryOnly:true})).toHaveLength(5)
    expect(filterExercises(BUILTIN_EXERCISES,{equipment:'sled'})).toHaveLength(2)
    expect(COMBINED_BATCH_EXERCISES.slice(0,25).some(row=>row.equipmentIds.includes('suspension-trainer'))).toBe(true)
    expect(COMBINED_BATCH_EXERCISES.slice(25,50).some(row=>row.equipmentIds.includes('kettlebell'))).toBe(true)
    expect(COMBINED_BATCH_EXERCISES.slice(50,75).some(row=>row.primaryMuscleGroupIds.includes('neck'))).toBe(true)
    expect(COMBINED_BATCH_EXERCISES.slice(75).some(row=>row.category==='conditioning')).toBe(true)
  })
  it('rejects a renamed combined Batches 5–8 variation submitted as a partial update before touching storage',async()=>{
    const db=database();await installCatalogue(prior,db)
    const copy=structuredClone(COMBINED_BATCH_EXERCISES[0]);copy.id=crypto.randomUUID();copy.name='Another hands-elevated press'
    await expect(installCatalogue([copy],db)).rejects.toThrow('variation')
    expect(await db.exercises.toArray()).toEqual([...prior].sort((a,b)=>a.id.localeCompare(b.id)))
  })
  it('upgrades a populated 0.13.0 library with only 100 additions, preserving all personal and workout data',async()=>{
    const db=database();await restoreBackup(history,db);await installCatalogue(prior,db)
    const custom=await createCustomExercise({...prior[0],name:COMBINED_BATCH_EXERCISES[0].name,defaultRestSeconds:107},db)
    await setFavourite(custom.id,true,db)
    await db.exercises.update(prior[12].id,{notes:'My existing note',archived:true})
    const before=(await createBackup(db)).data
    expect(await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db)).toEqual({added:100,updated:0,preserved:[]})
    const after=(await createBackup(db)).data
    for(const key of Object.keys(before) as (keyof typeof before)[])if(key!=='exercises'&&key!=='catalogueState')expect(after[key]).toEqual(before[key])
    for(const row of before.exercises)expect(await db.exercises.get(row.id)).toEqual(row)
    for(const marker of before.catalogueState)expect(await db.catalogueState.get(marker.exerciseId)).toEqual(marker)
    expect(await db.exercises.get(custom.id)).toEqual(custom)
    db.close();const reopened=database(db.name);await reopened.open()
    expect(await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],reopened)).toEqual({added:0,updated:0,preserved:[]})
    expect((await createBackup(reopened)).data).toEqual(after)
    const output=await exportBackupFile(reopened),target=database();await verifyLocalStorage(target)
    const incoming=await stageImport(output.blob,target),safety=await stageSnapshot(target)
    await restoreStagedBackup(incoming,safety,target)
    expect((await createBackup(target)).data).toEqual(after)
    expect(await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],target)).toEqual({added:0,updated:0,preserved:[]})
    await discardStage(output.snapshot.id,reopened)
  })
  it('preserves a custom definition and preference even if its ID collides with a new reservation',async()=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue(prior,db)
    const source=COMBINED_BATCH_EXERCISES[0]
    const custom={...structuredClone(source),origin:'custom' as const,name:'My private pressing exercise',notes:'Keep this record'}
    await db.exercises.put(custom)
    await setFavourite(custom.id,true,db)
    const preference=await db.exercisePreferences.get(custom.id)
    expect(await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db)).toEqual({added:99,updated:0,preserved:[custom.id]})
    expect(await db.exercises.get(custom.id)).toEqual(custom)
    expect(await db.exercisePreferences.get(custom.id)).toEqual(preference)
    expect(await db.catalogueState.get(custom.id)).toBeUndefined()
  })
  it('rolls back every combined Batches 5–8 definition/marker after a halfway storage failure and safely retries',async()=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue(prior,db)
    const before=(await createBackup(db)).data;let writes=0
    const fail=()=>{if(++writes===50)throw new Error('combined Batches 5–8 quota failure')}
    db.catalogueState.hook('creating',fail)
    await expect(installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db)).rejects.toThrow('combined Batches 5–8 quota failure')
    expect((await createBackup(db)).data).toEqual(before)
    db.catalogueState.hook('creating').unsubscribe(fail)
    const results=await Promise.all([installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db),installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db)])
    expect(results.map(row=>row.added).sort((a,b)=>a-b)).toEqual([0,100])
    expect(await db.exercises.count()).toBe(432);expect(await db.catalogueState.count()).toBe(432)
  })
  it('restoring an older backup and reinstalling adds the missing definitions without rewriting imported history',async()=>{
    const db=database();await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db);await restoreBackup(history,db)
    const before=(await createBackup(db)).data
    await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db)
    const after=(await createBackup(db)).data
    for(const key of ['sessions','sessionExercises','strengthSets','editorDrafts','restTimers','exercisePreferences'] as const)expect(after[key]).toEqual(before[key])
    for(const row of before.exercises)expect(await db.exercises.get(row.id)).toEqual(row)
    expect(COMBINED_BATCH_EXERCISES.every(row=>after.exercises.some(saved=>saved.id===row.id))).toBe(true)
  })
  it('can complete every combined Batches 5–8 exercise with its declared measurement and load, and retain all snapshots in history',async()=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db)
    const session=await startWorkout(db)
    for(const source of COMBINED_BATCH_EXERCISES){
      const instance=await addWorkoutExercise(session,source.id,db)
      const set=(await db.strengthSets.where('sessionExerciseId').equals(instance).toArray())[0]
      const input=values(['external','added','assisted'].includes(source.tracking.load)?'5':'')
      if(source.tracking.measurement==='duration'){input.values.reps='';input.values.durationSeconds='30'}
      await commitSet(session,set.id,input,true,db)
    }
    await finishWorkout(session,true,db)
    const workout=await loadWorkout(session,db)
    expect(workout.strengthSets).toHaveLength(100)
    expect(workout.strengthSets.every(set=>set.completed)).toBe(true)
    expect(workout.sessionExercises.map(row=>row.snapshot)).toEqual(COMBINED_BATCH_EXERCISES)
    const target=database();await restoreBackup(await createBackup(db),target)
    expect(await loadWorkout(session,target)).toEqual(workout)
  })
  it.each([
    ['Resistance-band biceps curl',''],['Double-kettlebell front squat','12'],
    ['Ring support hold',''],['Hand-resisted lateral neck hold',''],
    ['Weighted 45-degree back extension','5'],['Timed sled push','20'],
  ])('logs, recovers, finishes and backs up %s using existing workout storage',async(name,weight)=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue([...prior,...COMBINED_BATCH_EXERCISES],db)
    const source=named(name),session=await startWorkout(db),instance=await addWorkoutExercise(session,source.id,db)
    await saveExerciseRest(session,instance,103,db);await setFavourite(source.id,true,db)
    const input=values(weight)
    if(source.tracking.measurement==='duration'){input.values.reps='';input.values.durationSeconds='30'}
    const first=(await loadWorkout(session,db)).strengthSets[0]
    await commitSet(session,first.id,input,true,db)
    const second=await addSet(session,instance,db),draft=structuredClone(input)
    const field=source.tracking.measurement==='duration'?'durationSeconds':'reps'
    draft.values[field]='.'
    await saveSetDraft(session,second,draft,db)
    const before=await loadWorkout(session,db)
    db.close();const reopened=database(db.name)
    expect(await loadWorkout(session,reopened)).toEqual(before)
    const completed=structuredClone(input);completed.values[field]=source.tracking.measurement==='duration'?'25':'6'
    await commitSet(session,second,completed,true,reopened)
    await finishWorkout(session,true,reopened)
    const finished=await loadWorkout(session,reopened)
    expect(finished.strengthSets.every(row=>row.completed)).toBe(true)
    expect(finished.sessionExercises[0].snapshot).toEqual(source)
    const target=database();await restoreBackup(await createBackup(reopened),target)
    expect(await loadWorkout(session,target)).toEqual(finished)
    expect(await target.exercisePreferences.get(source.id)).toMatchObject({restSeconds:103,favourite:true})
  })
})
