import 'fake-indexeddb/auto'
import { afterEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { createBackup, restoreBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import { groupProgress, supersetRound, workoutBlocks } from '../src/domain/strength/supersets'
import { addSet, addWorkoutExercise, cancelWorkout, changeSetType, commitSet, controlRest, finishWorkout, loadWorkout, moveSupersetExercise, moveWorkoutItem, removeSet, removeWorkoutExercise, reorderExercises, replaceCurrentRest, saveInlineSet, saveSetDraft, setExerciseRest, saveSuperset, saveSupersetRest, startRoutine, startWorkout, timerSeconds, ungroupSuperset } from '../src/data/repositories/workouts'
import { saveGlobalRest, setFavourite } from '../src/data/repositories/preferences'
import { saveRoutine, listRoutines } from '../src/data/repositories/routines'
import { WorkoutHistory } from '../src/features/workouts/WorkoutHistory'
import { SupersetEditor } from '../src/features/workouts/SupersetEditor'
import v2 from './fixtures/backup-v2-strength-0.2.0.json'

const databases: AthleticDatabase[] = []
function database(name = crypto.randomUUID()) {
  const db = new AthleticDatabase(name)
  databases.push(db)
  return db
}
afterEach(async () => {
  vi.restoreAllMocks()
  for (const db of databases.splice(0)) await db.delete()
})
async function setup(count = 3) {
  const db = database()
  await verifyLocalStorage(db)
  await db.exercises.bulkAdd(STARTER_EXERCISES.slice(0, count))
  await saveGlobalRest(77, db)
  const id = await startWorkout(db)
  const exercises: string[] = []
  for (const source of STARTER_EXERCISES.slice(0, count)) exercises.push(await addWorkoutExercise(id, source.id, db))
  const workout = await loadWorkout(id, db)
  const sets = exercises.map(exerciseId => workout.strengthSets.find(set => set.sessionExerciseId === exerciseId)!)
  async function complete(setId: string, useCommit = false) {
    const set = (await loadWorkout(id, db)).strengthSets.find(row => row.id === setId)!
    const input = inputFromSet(set)
    input.values.weight = '40'
    input.values.reps = '8'
    if (useCommit) await commitSet(id, setId, input, true, db)
    else expect((await saveInlineSet(id, setId, input, true, db)).applied).toBe(true)
  }
  return { db, id, exercises, sets, complete }
}
async function timer(db: AthleticDatabase, id: string) {
  return (await loadWorkout(id, db)).restTimers[0]
}

it('groups nonadjacent exercises atomically while preserving values, notes, drafts, library and preferences', async () => {
  const { db, id, exercises, sets, complete } = await setup()
  await complete(sets[0].id)
  const draft = inputFromSet(sets[2]); draft.values.reps = '.'
  await saveSetDraft(id, sets[2].id, draft, db)
  await db.sessionExercises.update(exercises[0], { notes: 'Keep this note' })
  await setFavourite(STARTER_EXERCISES[0].id, true, db)
  const before = await createBackup(db)
  const groupId = await saveSuperset(id, [exercises[0], exercises[2]], null, db)
  const after = await loadWorkout(id, db)
  expect(after.sessionExercises.map(row => row.id)).toEqual([exercises[0], exercises[2], exercises[1]])
  expect(after.supersetGroups[0]).toMatchObject({ id: groupId, betweenExerciseRestSeconds: 0, betweenRoundRestSeconds: 77 })
  expect([...after.strengthSets].sort((a, b) => a.id.localeCompare(b.id))).toEqual(before.data.strengthSets)
  expect(after.editorDrafts).toEqual(before.data.editorDrafts)
  expect(after.sessionExercises[0].notes).toBe('Keep this note')
  expect(after.sessionExercises[0].snapshot).toEqual(before.data.sessionExercises.find(row => row.id === exercises[0])!.snapshot)
  expect(await timer(db, id)).toMatchObject({ status: 'skipped', sourceSetId: null })
  const backup = await createBackup(db)
  expect(backup.data.exercises).toEqual(before.data.exercises)
  expect(backup.data.exercisePreferences).toEqual(before.data.exercisePreferences)
  expect(validateBackup(backup).data).toEqual(backup.data)
})

it('starts round rest only after all working sets in that round are completed, including out of order', async () => {
  const { db, id, exercises, sets, complete } = await setup()
  await saveSuperset(id, exercises.slice(0, 2), null, db)
  await complete(sets[1].id)
  expect(await timer(db, id)).toMatchObject({ status: 'skipped', remainingSeconds: 0 })
  expect(groupProgress(await loadWorkout(id, db), (await loadWorkout(id, db)).sessionExercises.slice(0, 2))).toMatchObject({ round: 1, participants: 2, next: { id: exercises[0] } })
  await complete(sets[0].id, true)
  const running = await timer(db, id)
  expect(timerSeconds(running, Date.parse(running.updatedAt))).toBe(77)
  expect(running.sourceSetId).toBe(sets[0].id)
  const saved = (await loadWorkout(id, db)).strengthSets.find(row => row.id === sets[0].id)!
  const input = inputFromSet(saved); input.values.reps = '9'
  await saveInlineSet(id, saved.id, input, true, db)
  expect(await timer(db, id)).toEqual(running)
})

it('handles three exercises, unequal set counts and rounds completed ahead of an earlier round', async () => {
  const { db, id, exercises, sets, complete } = await setup()
  const second = await addSet(id, exercises[0], db)
  await saveSuperset(id, exercises, null, db)
  await complete(sets[2].id)
  await complete(sets[0].id)
  expect((await timer(db, id)).status).toBe('skipped')
  await complete(sets[1].id)
  expect((await timer(db, id)).status).toBe('running')
  const workout = await loadWorkout(id, db)
  expect(groupProgress(workout, workout.sessionExercises)).toMatchObject({ round: 2, rounds: 2, participants: 1 })
  await complete(second)
  const done = await loadWorkout(id, db)
  expect(groupProgress(done, done.sessionExercises)).toEqual({ rounds: 2 })
  expect(supersetRound(done, done.strengthSets.find(row => row.id === second)!)).toMatchObject({ index: 1, complete: true })
})

it('matches each round by working-set order and skips warm-ups', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  await changeSetType(id, sets[0].id, 'warm-up', db)
  const working = await addSet(id, exercises[0], db)
  await saveSuperset(id, exercises, null, db)
  await setExerciseRest(id, exercises[0], 49, db)
  await complete(sets[0].id)
  const warmup = await timer(db, id)
  expect(timerSeconds(warmup, Date.parse(warmup.updatedAt))).toBe(49)
  expect(supersetRound(await loadWorkout(id, db), (await loadWorkout(id, db)).strengthSets.find(row => row.id === sets[0].id)!)).toBeUndefined()
  await complete(sets[1].id)
  expect((await timer(db, id)).status).toBe('skipped')
  await complete(working)
  expect((await timer(db, id)).status).toBe('running')
})

it('uses separate transition rest, exact round rest, pause, adjustment and deadline recovery', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  const groupId = await saveSuperset(id, exercises, null, db)
  await saveSupersetRest(id, groupId, 'betweenExerciseRestSeconds', 13, db)
  await saveSupersetRest(id, groupId, 'betweenRoundRestSeconds', 83, db)
  await complete(sets[0].id)
  let running = await timer(db, id)
  expect(timerSeconds(running, Date.parse(running.updatedAt))).toBe(13)
  await saveSupersetRest(id, groupId, 'betweenExerciseRestSeconds', 19, db)
  expect(await timer(db, id)).toEqual(running)
  await complete(sets[1].id)
  running = await timer(db, id)
  expect(timerSeconds(running, Date.parse(running.updatedAt))).toBe(83)
  expect(timerSeconds(running, Date.parse(running.updatedAt) + 23000)).toBe(60)
  await controlRest(id, 'pause', 0, db)
  await replaceCurrentRest(id, 47, db)
  expect(await timer(db, id)).toMatchObject({ status: 'paused', remainingSeconds: 47 })
  await controlRest(id, 'adjust', 15, db)
  await controlRest(id, 'resume', 0, db)
  running = await timer(db, id)
  expect(timerSeconds(running, Date.parse(running.updatedAt))).toBe(62)
  await controlRest(id, 'skip', 0, db)
  expect((await timer(db, id)).status).toBe('skipped')
  expect(() => saveSupersetRest(id, groupId, 'betweenRoundRestSeconds', -1, db)).toThrow()
})

it('unchecking any member of the current round stops that round timer', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  await saveSuperset(id, exercises, null, db)
  await complete(sets[0].id)
  await complete(sets[1].id)
  const input = inputFromSet((await loadWorkout(id, db)).strengthSets.find(row => row.id === sets[0].id)!)
  await saveInlineSet(id, sets[0].id, input, false, db)
  expect(await timer(db, id)).toMatchObject({ status: 'skipped', sourceSetId: null })
  expect((await loadWorkout(id, db)).strengthSets.find(row => row.id === sets[1].id)!.completed).toBe(true)
})

it('unchecking another round or changing another exercise leaves the current timer intact', async () => {
  const { db, id, exercises, sets, complete } = await setup()
  const later = await addSet(id, exercises[0], db)
  await saveSuperset(id, exercises.slice(0, 2), null, db)
  await complete(later)
  const running = await timer(db, id)
  await saveInlineSet(id, sets[0].id, inputFromSet(sets[0]), false, db)
  await addSet(id, exercises[2], db)
  expect(await timer(db, id)).toEqual(running)
})

it.each(['add', 'remove', 'type', 'order', 'members', 'ungroup', 'delete'] as const)('stops group rest safely when changing %s', async action => {
  const { db, id, exercises, sets, complete } = await setup()
  const extra = await addSet(id, exercises[0], db)
  const groupId = await saveSuperset(id, exercises.slice(0, 2), null, db)
  await complete(sets[0].id); await complete(sets[1].id)
  if (action === 'add') await addSet(id, exercises[0], db)
  if (action === 'remove') await removeSet(id, extra, db)
  if (action === 'type') await changeSetType(id, extra, 'warm-up', db)
  if (action === 'order') await moveWorkoutItem(id, 'set', extra, -1, db)
  if (action === 'members') await saveSuperset(id, [exercises[1], exercises[2]], groupId, db)
  if (action === 'ungroup') await ungroupSuperset(id, groupId, db)
  if (action === 'delete') await removeWorkoutExercise(id, exercises[0], db)
  const workout = await loadWorkout(id, db)
  expect(workout.restTimers[0]).toMatchObject({ status: 'skipped', sourceSetId: null })
  if (action === 'delete' || action === 'ungroup') {
    expect(workout.supersetGroups).toEqual([])
    expect(workout.sessionExercises.every(row => row.supersetGroupId === null)).toBe(true)
  }
  validateBackup(await createBackup(db))
})

it('keeps a group together on reorder and permits explicit member reorder without losing drafts', async () => {
  const { db, id, exercises, sets, complete } = await setup()
  const groupId = await saveSuperset(id, exercises.slice(0, 2), null, db)
  const draft = inputFromSet(sets[0]); draft.values.weight = '.'
  await saveSetDraft(id, sets[0].id, draft, db)
  const savedDraft = await db.editorDrafts.toArray()
  await complete(sets[1].id)
  const before = await timer(db, id)
  await expect(reorderExercises(id, [exercises[0], exercises[2], exercises[1]], db)).rejects.toThrow('together')
  await reorderExercises(id, [exercises[2], exercises[0], exercises[1]], db)
  expect(await timer(db, id)).toEqual(before)
  await moveSupersetExercise(id, groupId, exercises[1], -1, db)
  const workout = await loadWorkout(id, db)
  expect(workout.sessionExercises.map(row => row.id)).toEqual([exercises[2], exercises[1], exercises[0]])
  expect(workout.editorDrafts).toEqual(savedDraft)
  expect(workoutBlocks(workout).map(block => block.exercises.map(row => row.id))).toEqual([[exercises[2]], [exercises[1], exercises[0]]])
  await moveWorkoutItem(id, 'exercise', exercises[0], -1, db)
  expect((await loadWorkout(id, db)).sessionExercises.map(row => row.id)).toEqual([exercises[1], exercises[0], exercises[2]])
})

it('rejects invalid membership and preserves both groups on failed selection', async () => {
  const { db, id, exercises } = await setup(4)
  const first = await saveSuperset(id, exercises.slice(0, 2), null, db)
  await saveSuperset(id, exercises.slice(2), null, db)
  const before = (await createBackup(db)).data
  for (const ids of [[exercises[0]], [exercises[0], exercises[0]], [exercises[0], crypto.randomUUID()], [exercises[0], exercises[2]]]) {
    await expect(saveSuperset(id, ids, first, db)).rejects.toThrow()
  }
  expect((await createBackup(db)).data).toEqual(before)
})

it('rolls back grouping and set completion if a later database write fails', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  const before = (await createBackup(db)).data
  vi.spyOn(db.supersetGroups, 'bulkPut').mockRejectedValueOnce(new Error('Disk full'))
  await expect(saveSuperset(id, exercises, null, db)).rejects.toThrow('Disk full')
  expect((await createBackup(db)).data).toEqual(before)
  await saveSuperset(id, exercises, null, db)
  await complete(sets[0].id)
  const grouped = (await createBackup(db)).data
  vi.spyOn(db.restTimers, 'bulkPut').mockRejectedValueOnce(new Error('Disk full'))
  await expect(complete(sets[1].id)).rejects.toThrow('Disk full')
  expect((await createBackup(db)).data).toEqual(grouped)
})

it('preserves invalid drafts without completing the round or starting rest', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  await saveSuperset(id, exercises, null, db)
  await complete(sets[0].id)
  const input = inputFromSet(sets[1]); input.values.reps = '.'
  const result = await saveInlineSet(id, sets[1].id, input, true, db)
  expect(result.applied).toBe(false)
  const workout = await loadWorkout(id, db)
  expect(workout.strengthSets.find(row => row.id === sets[1].id)!.completed).toBe(false)
  expect(workout.editorDrafts[0].values.reps).toBe('.')
  expect(workout.restTimers[0].status).toBe('skipped')
})

it('round-trips groups, timers and raw drafts with the current backup format and reopens the active workout', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  const groupId = await saveSuperset(id, exercises, null, db)
  await saveSupersetRest(id, groupId, 'betweenRoundRestSeconds', 83, db)
  await complete(sets[0].id); await complete(sets[1].id)
  const input = inputFromSet((await loadWorkout(id, db)).strengthSets.find(row => row.id === sets[0].id)!)
  input.values.weight = '.'
  await saveInlineSet(id, sets[0].id, input, undefined, db)
  const saved = await loadWorkout(id, db)
  db.close()
  const reopened = database(db.name)
  expect(await loadWorkout(id, reopened)).toEqual(saved)
  const exported = await exportBackupFile(reopened)
  expect(JSON.parse(await exported.blob.text()).formatVersion).toBe(12)
  const target = database(); await verifyLocalStorage(target)
  const incoming = await stageImport(exported.blob, target)
  const safety = await stageSnapshot(target)
  await restoreStagedBackup(incoming, safety, target)
  expect(await loadWorkout(id, target)).toEqual(saved)
  expect((await createBackup(target)).data).toEqual((await createBackup(reopened)).data)
  await discardStage(exported.snapshot.id, reopened)
})

it('starts a routine normally and preserves its definition through grouping, finishing and backup', async () => {
  const { db, id, exercises } = await setup(2)
  await cancelWorkout(id, db)
  const sources = (await loadWorkout(id, db)).sessionExercises
  const routineId = await saveRoutine({ title: 'Simple routine', notes: '' }, sources.map(row => ({
    id: crypto.randomUUID(), routineId: '', exerciseId: row.sourceExerciseId!, tracking: row.snapshot.tracking,
    position: row.position, sets: [{ setType: 'normal', target: null }],
  })), db)
  const before = await listRoutines(db)
  const sessionId = await startRoutine(routineId, db)
  const started = await loadWorkout(sessionId, db)
  const groupId = await saveSuperset(sessionId, started.sessionExercises.map(row => row.id), null, db)
  const set = started.strengthSets[0]
  const input = inputFromSet(set); input.values.weight = '35'; input.values.reps = '10'
  await saveInlineSet(sessionId, set.id, input, true, db)
  await finishWorkout(sessionId, true, db)
  expect((await loadWorkout(sessionId, db)).supersetGroups[0].id).toBe(groupId)
  expect(await listRoutines(db)).toEqual(before)
  const backup = await createBackup(db)
  const target = database(); await restoreBackup(backup, target)
  expect(await listRoutines(target)).toEqual(before)
  expect(backup.data.sessionExercises.filter(row => exercises.includes(row.id)).every(row => row.supersetGroupId === null)).toBe(true)
})

it('accepts older imported supersets and shows their grouping in history without rewriting snapshots', async () => {
  const db = database()
  await restoreBackup(v2, db)
  const before = await createBackup(db)
  const sessionId = before.data.sessions[0].id
  const workout = await loadWorkout(sessionId, db)
  const grouped = workoutBlocks(workout).find(block => block.group)!
  expect(grouped.exercises).toHaveLength(2)
  const html = renderToStaticMarkup(<WorkoutHistory workout={workout} onBack={() => {}} />)
  expect(html).toContain('Superset A')
  expect(html).toContain('A1')
  expect(html).toContain('A2')
  expect(html).toContain('superset-group')
  expect((await createBackup(db)).data).toEqual(before.data)
})

it('labels selection accessibly and prevents selecting exercises from another group', async () => {
  const { db, id, exercises } = await setup()
  await saveSuperset(id, exercises.slice(0, 2), null, db)
  const workout = await loadWorkout(id, db)
  const html = renderToStaticMarkup(<SupersetEditor exercises={workout.sessionExercises} initialIds={[exercises[2]]}
    disabled={false} onDirty={() => {}} onSave={() => {}} onCancel={() => {}} />)
  expect(html).toContain('Create superset')
  expect(html.match(/disabled=""/g)).toHaveLength(3)
  expect(html).toContain('Already in another superset')
  expect(html).toContain('<label')
})

it('completes a later round independently while retaining the earlier pending round', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  const secondA = await addSet(id, exercises[0], db)
  const secondB = await addSet(id, exercises[1], db)
  await saveSuperset(id, exercises, null, db)
  await complete(secondB); await complete(secondA)
  const workout = await loadWorkout(id, db)
  expect(workout.restTimers[0].status).toBe('running')
  expect(groupProgress(workout, workout.sessionExercises)).toMatchObject({ round: 1, participants: 2 })
  expect(workout.strengthSets.find(set => set.id === sets[0].id)!.completed).toBe(false)
})

it('typing into an incomplete set preserves the transition timer from the preceding member', async () => {
  const { db, id, exercises, sets, complete } = await setup(2)
  const groupId = await saveSuperset(id, exercises, null, db)
  await saveSupersetRest(id, groupId, 'betweenExerciseRestSeconds', 17, db)
  await complete(sets[0].id)
  const running = await timer(db, id)
  const input = inputFromSet(sets[1])
  input.values.weight = '30'
  await saveInlineSet(id, sets[1].id, input, undefined, db)
  expect(await timer(db, id)).toEqual(running)
})
