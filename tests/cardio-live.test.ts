import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, restoreBackup, validateBackup } from '../src/data/backup/backup'
import { discardStage, exportBackupFile, restoreStagedBackup, stageImport, stageSnapshot } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { cardioWeek, listCardioSessions, saveCardioSession } from '../src/data/repositories/cardio'
import { changeLiveCardio, loadLiveCardio, saveLiveReview, startLiveCardio } from '../src/data/repositories/cardioLive'
import { activeWorkout, startWorkout } from '../src/data/repositories/workouts'
import { activeMilliseconds, currentInterval, segments } from '../src/domain/cardio/timing'

const start = new Date(2026, 10, 9, 8).getTime()
const plan = { workSeconds: 10, recoverySeconds: 5, repeats: 3 }

it('recovers the clock, excludes paused time, and saves laps and partial timed intervals with the session', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(db)
    const strengthId = await startWorkout(db)
    const recording = await startLiveCardio('running', plan, db, start)
    await expect(startLiveCardio('cycling', null, db, start)).rejects.toThrow('current cardio recording')
    await changeLiveCardio(recording.token, 'lap', db, start + 8000)
    const paused = (await changeLiveCardio(recording.token, 'pause', db, start + 12000))!
    expect(activeMilliseconds(paused, start + 30000)).toBe(12000)
    expect(currentInterval(plan, paused.activeMs)).toEqual({ kind: 'Recovery', repeat: 1, remaining: 3000 })
    db.close()
    await db.open()
    expect(await loadLiveCardio(db)).toEqual(paused)
    await changeLiveCardio(recording.token, 'resume', db, start + 30000)
    const running = (await loadLiveCardio(db))!
    expect(currentInterval(plan, activeMilliseconds(running, start + 49000))).toEqual({ kind: 'Work', repeat: 3, remaining: 9000 })
    const finished = (await changeLiveCardio(recording.token, 'finish', db, start + 49000))!
    expect(finished.activeMs).toBe(31000)
    expect(segments(finished.activeMs, finished.laps, finished.plan)).toEqual({
      laps: [{ start: 0, end: 8000 }, { start: 8000, end: 31000 }],
      intervals: [
        { start: 0, end: 10000, kind: 'Work', repeat: 1 }, { start: 10000, end: 15000, kind: 'Recovery', repeat: 1 },
        { start: 15000, end: 25000, kind: 'Work', repeat: 2 }, { start: 25000, end: 30000, kind: 'Recovery', repeat: 2 },
        { start: 30000, end: 31000, kind: 'Work', repeat: 3 },
      ],
    })
    const input = { ...finished.review!, distance: '1' }
    await saveLiveReview(recording.token, input, db)
    expect((await loadLiveCardio(db))?.review).toEqual(input)
    await saveCardioSession('running', input, undefined, db, finished)
    expect(await loadLiveCardio(db)).toBeUndefined()
    const sessions = await listCardioSessions(db)
    expect(sessions[0]).toMatchObject({ details: { durationSeconds: 31 }, timing: { activeMs: 31000, laps: [8000], plan } })
    expect(Date.parse(sessions[0].session.endedAt!) - Date.parse(sessions[0].session.startedAt)).toBe(49000)
    expect(cardioWeek(sessions, new Date(start))).toEqual({ sessions: 1, duration: 31, distance: 1000 })
    expect((await activeWorkout(db))?.id).toBe(strengthId)
    const backup = await createBackup(db)
    backup.data.cardioTiming[0].laps = [32000]
    expect(() => validateBackup(backup)).toThrow('lap boundaries')
    await expect(stageImport(new Blob([JSON.stringify(backup)]), db)).rejects.toThrow('lap boundaries')
    expect((await listCardioSessions(db))[0].timing?.laps).toEqual([8000])
  } finally { await db.delete() }
})

it('restores a running recording paused at export time in both restore paths', async () => {
  const source = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  try {
    vi.setSystemTime(start + 18000)
    await verifyLocalStorage(source)
    await verifyLocalStorage(target)
    const recording = await startLiveCardio('rowing', plan, source, start)
    const backup = await createBackup(source)
    const exported = await exportBackupFile(source)
    vi.setSystemTime(start + 999000)
    await restoreBackup(backup, target)
    const paused = { ...recording, state: 'paused', checkpoint: start + 18000, activeMs: 18000 }
    expect(await loadLiveCardio(target)).toEqual(paused)
    const incoming = await stageImport(exported.blob, target)
    await restoreStagedBackup(incoming, await stageSnapshot(target), target)
    expect(await loadLiveCardio(target)).toEqual(paused)
    expect(await loadLiveCardio(source)).toEqual(recording)
    await discardStage(exported.snapshot.id, source)
  } finally { vi.useRealTimers(); await source.delete(); await target.delete() }
})
