import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { installCatalogue, validateCatalogue } from '../src/data/catalogue'
import { BUILTIN_EXERCISES, CATALOGUE_BATCHES, workoutLoadLabel } from '../src/domain/strength/catalog'
import { BATCH_THREE_EXERCISES } from '../src/domain/strength/catalogue/batch3'
import { createCustomExercise, filterExercises } from '../src/data/repositories/exercises'
import { setFavourite } from '../src/data/repositories/preferences'
import { addSet, addWorkoutExercise, commitSet, finishWorkout, loadWorkout, saveExerciseRest, saveSetDraft, startWorkout } from '../src/data/repositories/workouts'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import released from './fixtures/catalogue-0.11.0.json'
import reservations from './fixtures/batch-three-ids.json'
import history from './fixtures/backup-v3-rest-0.7.0.json'
import type { Exercise } from '../src/domain/strength/models'
import type { SetInput } from '../src/domain/strength/logging'
const prior=released as Exercise[]
const databases:AthleticDatabase[]=[]
function database(name=crypto.randomUUID()){const db=new AthleticDatabase(name);databases.push(db);return db}
const named=(name:string)=>BATCH_THREE_EXERCISES.find(row=>row.name===name)!
const values=(weight:string,reps='8'):SetInput=>({weightUnit:'kg',values:{weight,bodyweight:'',reps,durationSeconds:'',rpe:'8',rir:'2'}})
afterEach(async()=>{
  const opened=databases.splice(0)
  for(const db of opened)db.close()
  for(const name of new Set(opened.map(db=>db.name)))await new AthleticDatabase(name).delete()
})
describe('Batch 3 shoulder, arm and grip catalogue',()=>{
  it('adds exactly 80 permanent IDs and leaves every released definition unchanged',()=>{
    expect([...prior,...BATCH_THREE_EXERCISES]).toHaveLength(252)
    expect(CATALOGUE_BATCHES.map(batch=>batch.id)).toEqual(['original','batch-1','batch-2','batch-3','batch-4','batches-5-8','grip-variations','wrist-curls'])
    expect(BATCH_THREE_EXERCISES).toHaveLength(80)
    expect(BUILTIN_EXERCISES.filter(row=>prior.some(old=>old.id===row.id))).toEqual(prior)
    expect(Object.fromEntries(BATCH_THREE_EXERCISES.map(row=>[row.id,row.name]))).toEqual(reservations)
    expect(new Set(BUILTIN_EXERCISES.map(row=>row.id)).size).toBe(BUILTIN_EXERCISES.length)
    for(const row of BATCH_THREE_EXERCISES)expect(row.id).toMatch(/^ba51c300-0000-4000-8000-\d{12}$/)
  })
  it('validates the accumulated catalogue and provides complete, distinct descriptions',()=>{
    expect(()=>validateCatalogue(BUILTIN_EXERCISES)).not.toThrow()
    expect(new Set(BATCH_THREE_EXERCISES.map(row=>row.instructions)).size).toBe(80)
    for(const row of BATCH_THREE_EXERCISES){
      expect(row.instructions.length).toBeGreaterThan(100)
      expect(row.notes.length).toBeGreaterThan(50)
      expect(row.metadata!.aliases.length).toBeGreaterThan(0)
      expect(row.metadata!.movementPatternIds.length).toBeGreaterThan(0)
      expect(row.defaultRestSeconds).toBeNull()
      expect(row.metadata!.variant.stance).toBeTruthy()
      if(row.tracking.measurement==='duration'){
        expect(row.metadata!.repetitionConvention).toBe('unspecified')
        expect(row.notes).toContain('Log hold duration in seconds')
        expect(row.notes).not.toContain('One complete bilateral movement')
      } else {
        expect(['per-side','total']).toContain(row.metadata!.repetitionConvention)
        expect(row.notes).toContain(row.metadata!.repetitionConvention==='per-side'?'Reps are per side':'one rep')
      }
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
  it('labels unweighted reps correctly without changing timed, loaded, bodyweight or assistance labels',()=>{
    expect(workoutLoadLabel(named('Hand-gripper close').tracking)).toBe('Reps only')
    expect(workoutLoadLabel({measurement:'duration',load:'none',weightConvention:null})).toBe('Timed hold')
    expect(workoutLoadLabel(named('Dead hang').tracking)).toBe('Bodyweight')
    expect(workoutLoadLabel(named('Dumbbell farmer hold').tracking)).toBe('Per hand')
    expect(workoutLoadLabel(named('Weighted triceps dip').tracking)).toBe('Added weight')
    expect(workoutLoadLabel(named('Assisted dip machine').tracking)).toBe('Assistance')
  })
  it('uses explicit duration, per-side, plate, gripper and bodyweight load conventions',()=>{
    expect(named('Dumbbell farmer hold').tracking).toEqual({measurement:'duration',load:'external',weightConvention:'per-hand'})
    expect(named('Dumbbell suitcase hold').notes).toContain('Duration is per side')
    expect(named('Single-hand plate pinch hold').tracking.weightConvention).toBe('total')
    expect(named('Dead hang').tracking).toEqual({measurement:'duration',load:'bodyweight',weightConvention:null})
    expect(named('Dead hang').notes).not.toContain('Log repetitions')
    expect(named('Hand-gripper close').tracking).toEqual({measurement:'reps',load:'none',weightConvention:null})
    expect(named('Hand-gripper close').notes).not.toContain('band type')
    expect(named('Weighted triceps dip').tracking.load).toBe('added')
    expect(named('Assisted dip machine').tracking.load).toBe('assisted')
    expect(named('Plate front raise').notes).toContain('plate weight once')
    expect(named('EZ-bar curl').notes).toContain('actual EZ-bar mass')
  })
  it('finds aliases and grouped muscles/machines without inventing duplicate definitions',()=>{
    expect(filterExercises(BUILTIN_EXERCISES,{query:'Bayesian'}).map(row=>row.name)).toEqual(['Behind-the-body cable curl'])
    expect(filterExercises(BUILTIN_EXERCISES,{query:'Pinwheel'}).map(row=>row.name)).toEqual(['Cross-body dumbbell hammer curl'])
    expect(filterExercises(BUILTIN_EXERCISES,{equipment:'machine',muscle:'shoulders',primaryOnly:true}).some(row=>row.name==='Lateral raise machine')).toBe(true)
    expect(filterExercises(BUILTIN_EXERCISES,{muscle:'forearms',primaryOnly:true}).some(row=>row.name==='Dead hang')).toBe(true)
  })
  it('rejects a renamed Batch 3 variation submitted as a partial update before touching storage',async()=>{
    const db=database();await installCatalogue(prior,db)
    const copy=structuredClone(BATCH_THREE_EXERCISES[0]);copy.id=crypto.randomUUID();copy.name='Another seated side raise'
    await expect(installCatalogue([copy],db)).rejects.toThrow('variation')
    expect(await db.exercises.toArray()).toEqual([...prior].sort((a,b)=>a.id.localeCompare(b.id)))
  })
  it('upgrades a populated 0.11.0 library with only 80 additions, preserving all personal and workout data',async()=>{
    const db=database();await restoreBackup(history,db);await installCatalogue(prior,db)
    const custom=await createCustomExercise({...prior[0],name:BATCH_THREE_EXERCISES[0].name,defaultRestSeconds:107},db)
    await setFavourite(custom.id,true,db)
    await db.exercises.update(prior[12].id,{notes:'My existing note',archived:true})
    const before=(await createBackup(db)).data
    expect(await installCatalogue([...prior,...BATCH_THREE_EXERCISES],db)).toEqual({added:80,updated:0,preserved:[]})
    const after=(await createBackup(db)).data
    for(const key of Object.keys(before) as (keyof typeof before)[])if(key!=='exercises'&&key!=='catalogueState')expect(after[key]).toEqual(before[key])
    for(const row of before.exercises)expect(await db.exercises.get(row.id)).toEqual(row)
    for(const marker of before.catalogueState)expect(await db.catalogueState.get(marker.exerciseId)).toEqual(marker)
    expect(await db.exercises.get(custom.id)).toEqual(custom)
    db.close();const reopened=database(db.name);await reopened.open()
    expect(await installCatalogue([...prior,...BATCH_THREE_EXERCISES],reopened)).toEqual({added:0,updated:0,preserved:[]})
    expect((await createBackup(reopened)).data).toEqual(after)
    const output=await exportBackupFile(reopened),target=database();await verifyLocalStorage(target)
    const incoming=await stageImport(output.blob,target),safety=await stageSnapshot(target)
    await restoreStagedBackup(incoming,safety,target)
    expect((await createBackup(target)).data).toEqual(after)
    expect(await installCatalogue([...prior,...BATCH_THREE_EXERCISES],target)).toEqual({added:0,updated:0,preserved:[]})
    await discardStage(output.snapshot.id,reopened)
  })
  it('rolls back every Batch 3 definition/marker after a halfway storage failure and safely retries',async()=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue(prior,db)
    const before=(await createBackup(db)).data;let writes=0
    const fail=()=>{if(++writes===40)throw new Error('Batch 3 quota failure')}
    db.catalogueState.hook('creating',fail)
    await expect(installCatalogue([...prior,...BATCH_THREE_EXERCISES],db)).rejects.toThrow('Batch 3 quota failure')
    expect((await createBackup(db)).data).toEqual(before)
    db.catalogueState.hook('creating').unsubscribe(fail)
    const results=await Promise.all([installCatalogue([...prior,...BATCH_THREE_EXERCISES],db),installCatalogue([...prior,...BATCH_THREE_EXERCISES],db)])
    expect(results.map(row=>row.added).sort((a,b)=>a-b)).toEqual([0,80])
    expect(await db.exercises.count()).toBe(252);expect(await db.catalogueState.count()).toBe(252)
  })
  it('restoring an older backup and reinstalling adds the missing definitions without rewriting imported history',async()=>{
    const db=database();await installCatalogue([...prior,...BATCH_THREE_EXERCISES],db);await restoreBackup(history,db)
    const before=(await createBackup(db)).data
    await installCatalogue([...prior,...BATCH_THREE_EXERCISES],db)
    const after=(await createBackup(db)).data
    for(const key of ['sessions','sessionExercises','strengthSets','editorDrafts','restTimers','exercisePreferences'] as const)expect(after[key]).toEqual(before[key])
    for(const row of before.exercises)expect(await db.exercises.get(row.id)).toEqual(row)
    expect(BATCH_THREE_EXERCISES.every(row=>after.exercises.some(saved=>saved.id===row.id))).toBe(true)
  })
  it('can complete every Batch 3 exercise with its declared measurement and load, and retain all snapshots in history',async()=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue([...prior,...BATCH_THREE_EXERCISES],db)
    const session=await startWorkout(db)
    for(const source of BATCH_THREE_EXERCISES){
      const instance=await addWorkoutExercise(session,source.id,db)
      const set=(await db.strengthSets.where('sessionExerciseId').equals(instance).toArray())[0]
      const input=values(['external','added','assisted'].includes(source.tracking.load)?'5':'')
      if(source.tracking.measurement==='duration'){input.values.reps='';input.values.durationSeconds='30'}
      await commitSet(session,set.id,input,true,db)
    }
    await finishWorkout(session,true,db)
    const workout=await loadWorkout(session,db)
    expect(workout.strengthSets).toHaveLength(80)
    expect(workout.strengthSets.every(set=>set.completed)).toBe(true)
    expect(workout.sessionExercises.map(row=>row.snapshot)).toEqual(BATCH_THREE_EXERCISES)
    const target=database();await restoreBackup(await createBackup(db),target)
    expect(await loadWorkout(session,target)).toEqual(workout)
  })
  it.each([
    ['Rope triceps pushdown','10'],['Dumbbell farmer hold','10'],['Dead hang',''],
    ['Single-hand plate pinch hold','5'],['Hand-gripper close',''],['Weighted triceps dip','5'],['Assisted dip machine','20'],
  ])('logs, recovers, finishes and backs up %s using existing workout storage',async(name,weight)=>{
    const db=database();await verifyLocalStorage(db);await installCatalogue([...prior,...BATCH_THREE_EXERCISES],db)
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
