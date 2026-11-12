import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { createBackup, restoreBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readAnalyticsOverview } from '../src/data/repositories/analytics'
import { blankCardioInput, cardioWeek, deleteCardioSession, inputFromCardio, listCardioSessions, loadCardioDraft, localDateTime, saveCardioDraft, saveCardioSession } from '../src/data/repositories/cardio'
import { activeWorkout, finishWorkout, listWorkouts, loadWorkout, startWorkout } from '../src/data/repositories/workouts'
import { paceText } from '../src/features/performance/cardioDisplay'

it('recovers drafts, saves without touching an active strength workout, and derives totals from finished cardio', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(db)
    const strengthId = await startWorkout(db)
    const strength = await loadWorkout(strengthId, db)
    const monday = new Date(2026, 10, 9, 8)
    const running = { ...blankCardioInput('running'), ...localDateTime(monday), minutes: '25', distance: '5' }
    await saveCardioDraft('running', running, db)
    db.close()
    await db.open()
    expect((await loadCardioDraft('running', db))?.input).toEqual(running)
    expect(await listCardioSessions(db)).toEqual([])
    const runId = await saveCardioSession('running', running, undefined, db)
    expect(await loadCardioDraft('running', db)).toBeUndefined()
    const swimming = { ...blankCardioInput('swimming'), ...localDateTime(monday), minutes: '10', setting: 'Pool',
      poolLength: '25', poolLengths: '20', distanceUnit: 'yd' }
    await saveCardioSession('swimming', swimming, undefined, db)
    await saveCardioSession('cycling', { ...blankCardioInput('cycling'), ...localDateTime(monday), minutes: '15', setting: 'Indoor' }, undefined, db)
    await saveCardioSession('walking', { ...blankCardioInput('walking'), ...localDateTime(new Date(2026, 10, 8, 23, 59)), minutes: '2', distance: '1' }, undefined, db)
    const sessions = await listCardioSessions(db)
    const run = sessions.find(row => row.session.id === runId)!
    expect(paceText(run.details)).toBe('5:00 / km')
    expect(paceText(sessions.find(row => row.details.sport === 'swimming')!.details)).toBe('2:00 / 100 yd')
    expect(cardioWeek(sessions, monday)).toEqual({ sessions: 3, duration: 3000, distance: 5457.2 })
    expect((await activeWorkout(db))?.id).toBe(strengthId)
    expect(await loadWorkout(strengthId, db)).toEqual(strength)
    expect((await listWorkouts(db)).map(row => row.id)).toEqual([strengthId])
    expect((await readAnalyticsOverview(8, db, monday)).weeks.every(week => !week.workouts)).toBe(true)
    await expect(loadWorkout(runId, db)).rejects.toThrow('cardio')
    await expect(finishWorkout(runId, true, db)).rejects.toThrow('cardio')

    await saveCardioSession('running', { ...inputFromCardio(run), distance: '6' }, run, db)
    const updated = (await listCardioSessions(db)).find(row => row.session.id === runId)!
    expect(updated.details.distanceMeters).toBe(6000)
    await expect(deleteCardioSession(run, db)).rejects.toThrow('changed')
    await deleteCardioSession(updated, db)
    expect((await listCardioSessions(db)).some(row => row.session.id === runId)).toBe(false)
  } finally { await db.delete() }
})

it('validates format 7 cardio links and preserves strength and drafts in both restore paths', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    const strength = await startWorkout(source)
    const draft = { ...blankCardioInput('cycling'), minutes: 'bad input' }
    await saveCardioDraft('cycling', draft, source)
    await saveCardioSession('running', { ...blankCardioInput('running'), minutes: '20', distance: '4' }, undefined, source)
    const backup = await createBackup(source)
    await restoreBackup(backup, target)
    expect((await createBackup(target)).data).toEqual(backup.data)
    const exported = await exportBackupFile(source)
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    await discardStage(exported.snapshot.id, source)
    expect((await createBackup(target)).data).toEqual(backup.data)
    const missing = structuredClone(backup)
    missing.data.cardioDetails = []
    expect(() => validateBackup(missing)).toThrow('Missing cardio details')
    await expect(stageImport(new Blob([JSON.stringify(missing)]), target)).rejects.toThrow('Missing cardio details')
    const wrong = structuredClone(backup)
    wrong.data.cardioDetails[0].durationSeconds++
    expect(() => validateBackup(wrong)).toThrow('matching duration')
    await expect(stageImport(new Blob([JSON.stringify(wrong)]), target)).rejects.toThrow('matching duration')
    expect((await createBackup(target)).data).toEqual(backup.data)
    expect((await activeWorkout(target))?.id).toBe(strength)
  } finally { await source.delete(); await target.delete() }
})
