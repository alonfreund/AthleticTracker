import 'fake-indexeddb/auto'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { globalRest, saveGlobalRest } from '../src/data/repositories/preferences'
import { initializeExerciseLibrary } from '../src/data/repositories/exercises'
import { addWorkoutExercise, addSet, cancelWorkout, saveSetDraft, saveWorkoutDetails, loadWorkout, startWorkout, saveInlineSet, saveExerciseRest, replaceCurrentRest, reorderExercises, timerSeconds } from '../src/data/repositories/workouts'
import { createBackup, parseBackup, serializeBackup, restoreBackup, validateBackup } from '../src/data/backup/backup'
import { durationFromFields, MAX_REST_SECONDS } from '../src/domain/rest'
import { inputFromSet } from '../src/domain/strength/logging'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { SET_TYPES } from '../src/domain/strength/setTypes'
import { InlineSetRow } from '../src/features/workouts/InlineSetRow'
import { WorkoutHistory } from '../src/features/workouts/WorkoutHistory'
import oldBackup from './fixtures/backup-v2-strength-0.2.0.json'
import oldestBackup from './fixtures/backup-v1-app-0.0.0.json'
const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) { const db = new AthleticDatabase(name); databases.push(db); return db }
async function setup() {
  const db = database(); await verifyLocalStorage(db); await initializeExerciseLibrary(db)
  const id = await startWorkout(db); const exerciseId = await addWorkoutExercise(id, STARTER_EXERCISES[0].id, db)
  const workout = await loadWorkout(id, db), set = workout.strengthSets[0]
  const input = inputFromSet(set); input.values.weight = '40'; input.values.reps = '8'
  return { db, id, exerciseId, set, input }
}
afterEach(async () => { vi.restoreAllMocks(); for (const db of databases.splice(0)) await db.delete() })
describe('exact rest preferences and compatibility', () => {
  it('normalises arbitrary whole minutes and seconds and rejects malformed or oversized input', () => {
    expect(durationFromFields('1', '17')).toBe(77)
    expect(durationFromFields('0', '75')).toBe(75)
    expect(durationFromFields('', '')).toBe(0)
    for (const [m,s] of [['-1','0'], ['1.5','0'], ['1','a'], [String(MAX_REST_SECONDS),'0']]) expect(() => durationFromFields(m,s)).toThrow()
  })
  it('persists global default through a fresh connection and backup while preserving older imports', async () => {
    const { db } = await setup(); await saveGlobalRest(77, db)
    db.close(); const reopened = database(db.name); expect(await globalRest(reopened)).toBe(77)
    const backup = parseBackup(serializeBackup(await createBackup(reopened)))
    expect(backup.formatVersion).toBe(16)
    const target = database(); await restoreBackup(backup, target); expect(await globalRest(target)).toBe(77)
    await restoreBackup(oldBackup, target); expect(await globalRest(target)).toBe(90)
    expect((await createBackup(target)).data.sessionExercises).toEqual(oldBackup.data.sessionExercises)
    await restoreBackup(oldestBackup, target); expect(await globalRest(target)).toBe(90)
  })
  it('rejects bad or duplicate settings before any restore writes', async () => {
    const { db } = await setup(); const original = await createBackup(db)
    for (const value of ['-5', '2.5', 'NaN', String(MAX_REST_SECONDS + 1)]) {
      const bad = structuredClone(original); bad.data.metadata.push({ key:'defaultRestSeconds',value })
      await expect(restoreBackup(bad, db)).rejects.toThrow()
    }
    const duplicate = structuredClone(original); duplicate.data.metadata.push(original.data.metadata[0])
    expect(() => validateBackup(duplicate)).toThrow('creation date')
    expect((await createBackup(db)).data).toEqual(original.data)
  })
  it('saves the exercise preference atomically, reuses it next time and preserves snapshots and active timer', async () => {
    const { db, id, exerciseId, set, input } = await setup()
    const snapshot = (await loadWorkout(id,db)).sessionExercises[0].snapshot
    await saveInlineSet(id,set.id,input,true,db)
    const timer = (await loadWorkout(id,db)).restTimers[0]
    await saveExerciseRest(id,exerciseId,77,db)
    let current = await loadWorkout(id,db)
    expect(current.sessionExercises[0]).toMatchObject({ restSeconds:77, snapshot })
    expect(current.restTimers[0]).toEqual(timer)
    expect((await db.exercisePreferences.get(snapshot.id))?.restSeconds).toBe(77)
    await cancelWorkout(id,db); const next = await startWorkout(db)
    await addWorkoutExercise(next,snapshot.id,db)
    expect((await loadWorkout(next,db)).sessionExercises[0].restSeconds).toBe(77)
    expect((await loadWorkout(id,db)).sessionExercises[0].snapshot).toEqual(snapshot)
    const restored = database(); await restoreBackup(await createBackup(db),restored)
    expect((await restored.exercisePreferences.get(snapshot.id))?.restSeconds).toBe(77)
  })
  it('resolves exercise override before global; changing global never alters existing sessions', async () => {
    const { db,id,exerciseId } = await setup()
    await saveGlobalRest(83,db); await saveExerciseRest(id,exerciseId,null,db)
    expect((await loadWorkout(id,db)).sessionExercises[0].restSeconds).toBe(83)
    await saveGlobalRest(95,db)
    expect((await loadWorkout(id,db)).sessionExercises[0].restSeconds).toBe(83)
    const added = await addWorkoutExercise(id,STARTER_EXERCISES[0].id,db)
    expect((await loadWorkout(id,db)).sessionExercises.find(row=>row.id===added)?.restSeconds).toBe(95)
    await saveExerciseRest(id,exerciseId,0,db)
    const another = await addWorkoutExercise(id,STARTER_EXERCISES[0].id,db)
    expect((await loadWorkout(id,db)).sessionExercises.find(row=>row.id===another)?.restSeconds).toBe(0)
  })
  it('rolls back library preference when the active exercise write fails', async () => {
    const { db,id,exerciseId } = await setup(); const before = (await createBackup(db)).data
    vi.spyOn(db.sessionExercises,'bulkPut').mockRejectedValueOnce(new Error('Storage full'))
    await expect(saveExerciseRest(id,exerciseId,77,db)).rejects.toThrow('Storage full')
    expect((await createBackup(db)).data).toEqual(before)
  })
  it('sets exact remaining time without changing saved defaults, retaining paused/running state', async () => {
    const { db,id,exerciseId,set,input } = await setup(); await saveExerciseRest(id,exerciseId,77,db)
    await saveInlineSet(id,set.id,input,true,db); await replaceCurrentRest(id,43,db)
    let timer = (await loadWorkout(id,db)).restTimers[0]
    expect(timer.status).toBe('running'); expect(timerSeconds(timer,Date.parse(timer.updatedAt))).toBe(43)
    await db.restTimers.update(id,{ status:'paused', deadline:null,remainingSeconds:43 })
    await replaceCurrentRest(id,67,db); timer = (await loadWorkout(id,db)).restTimers[0]
    expect(timer).toMatchObject({ status:'paused', remainingSeconds:67,deadline:null })
    expect((await db.exercisePreferences.get(STARTER_EXERCISES[0].id))?.restSeconds).toBe(77)
    await replaceCurrentRest(id,0,db); expect((await loadWorkout(id,db)).restTimers[0].status).toBe('finished')
  })
})
describe('drag order persistence', () => {
  it('changes only positions/timestamps and preserves sets, notes, drafts, timer and IDs across reopening/restore', async () => {
    const { db,id,exerciseId,set,input } = await setup()
    const second = await addWorkoutExercise(id,STARTER_EXERCISES[1].id,db)
    const third = await addWorkoutExercise(id,STARTER_EXERCISES[2].id,db)
    await saveWorkoutDetails(id,'Reorder test','Workout note',db)
    await db.sessionExercises.update(exerciseId,{ notes:'Exercise note' })
    await addSet(id,exerciseId,db); await saveInlineSet(id,set.id,input,true,db)
    input.values.weight='.'; await saveSetDraft(id,set.id,input,db)
    const before = await loadWorkout(id,db)
    await reorderExercises(id,[third,exerciseId,second],db)
    db.close(); const reopened=database(db.name), after=await loadWorkout(id,reopened)
    expect(after.sessionExercises.map(row=>row.id)).toEqual([third,exerciseId,second])
    for (const key of ['strengthSets','editorDrafts','restTimers','supersetGroups'] as const) expect(after[key]).toEqual(before[key])
    const original = before.sessionExercises.find(row=>row.id===exerciseId)!, changed=after.sessionExercises.find(row=>row.id===exerciseId)!
    expect({ ...changed,position:original.position,updatedAt:original.updatedAt }).toEqual(original)
    const target=database(); await restoreBackup(await createBackup(reopened),target)
    expect(await loadWorkout(id,target)).toEqual(after)
  })
  it('rejects stale/duplicate orders and rolls back failed saves',async()=>{
    const { db,id,exerciseId }=await setup(); const second=await addWorkoutExercise(id,STARTER_EXERCISES[1].id,db)
    const before=(await createBackup(db)).data
    await expect(reorderExercises(id,[exerciseId,exerciseId],db)).rejects.toThrow('list changed')
    await expect(reorderExercises(id,[exerciseId],db)).rejects.toThrow('list changed')
    vi.spyOn(db.sessionExercises,'bulkPut').mockRejectedValueOnce(new Error('Storage full'))
    await expect(reorderExercises(id,[second,exerciseId],db)).rejects.toThrow('Storage full')
    expect((await createBackup(db)).data).toEqual(before)
  })
})
describe('set-type presentation',()=>{
  it('uses shared named types and classes in logging and history',async()=>{
    const { db,id }=await setup(); const workout=await loadWorkout(id,db), exercise=workout.sessionExercises[0], set=workout.strengthSets[0]
    for(const [type,label] of Object.entries(SET_TYPES)) {
      set.setType=type as typeof set.setType
      const html=renderToStaticMarkup(<InlineSetRow exercise={exercise} set={set} index={0} last row={{input:inputFromSet(set),dirty:false,pending:false,error:'',saving:0}} disabled={false} onChange={()=>{}} onSave={()=>{}} onComplete={()=>{}} onType={()=>{}} onRemove={()=>{}} onMove={()=>{}} onRevert={()=>{}} />)
      expect(html).toContain(`set-type--${type}`); expect(html).toContain(label)
      expect(renderToStaticMarkup(<WorkoutHistory workout={workout} onBack={()=>{}} />)).toContain(`set-type--${type}`)
    }
  })
  it('provides WCAG AA text contrast for each set colour in both palettes',()=>{
    const css=readFileSync(new URL('../src/styles/tokens.css',import.meta.url),'utf8')
    function luminance(hex:string){const c=hex.match(/[0-9a-f]{2}/g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722}
    for(const type of ['warm-up','failure','drop-set','amrap','back-off']) {
      const pairs=[...css.matchAll(new RegExp(`--set-${type}-bg: (#\\w+); --set-${type}-text: (#\\w+);`,'g'))]
      expect(pairs).toHaveLength(2)
      for(const [,bg,fg]of pairs){const a=luminance(bg.slice(1)),b=luminance(fg.slice(1));expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(4.5)}
    }
  })
})
