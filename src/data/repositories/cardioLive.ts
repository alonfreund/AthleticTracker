import type { CardioActivity } from '../../domain/cardio/activities'
import type { CardioInput } from '../../domain/cardio/models'
import { activeMilliseconds, LIVE_ID, MAX_LAPS, validateLiveCardio, type IntervalPlan, type LiveCardio } from '../../domain/cardio/timing'
import { db } from '../db/database'
import { blankCardioInput, localDateTime } from './cardio'

export const loadLiveCardio = (database = db) => database.cardioLive.get(LIVE_ID)

export function startLiveCardio(sport: CardioActivity, plan: IntervalPlan | null, database = db, now = Date.now()) {
  return database.transaction('rw', database.cardioLive, async () => {
    if (await loadLiveCardio(database)) throw new Error('Resume or discard the current cardio recording first.')
    const row: LiveCardio = { id: LIVE_ID, token: crypto.randomUUID(), sport, started: now, checkpoint: now,
      activeMs: 0, state: 'running', laps: [], plan, review: null }
    validateLiveCardio(row)
    await database.cardioLive.add(row)
    return row
  })
}

type Command = 'pause' | 'resume' | 'lap' | 'finish' | 'discard'
export function changeLiveCardio(token: string, command: Command, database = db, now = Date.now()) {
  return database.transaction('rw', database.cardioLive, async () => {
    const row = await loadLiveCardio(database)
    if (!row || row.token !== token) throw new Error('This recording is no longer available.')
    if (command === 'discard') { await database.cardioLive.delete(LIVE_ID); return }
    if (row.state === 'review') return row
    if ((command === 'resume' && row.state !== 'paused') ||
      ((command === 'pause' || command === 'lap') && row.state !== 'running')) return row

    const checkpoint = Math.max(now, row.checkpoint)
    const activeMs = activeMilliseconds(row, checkpoint)
    const updated = { ...row, checkpoint, activeMs }
    if (command === 'pause') updated.state = 'paused'
    if (command === 'resume') updated.state = 'running'
    if (command === 'lap') {
      if (row.laps.length >= MAX_LAPS) throw new Error('This recording has reached its lap limit.')
      if (activeMs <= (row.laps.at(-1) ?? 0)) return row
      updated.laps = [...row.laps, activeMs]
    }
    if (command === 'finish') {
      const seconds = Math.floor(activeMs / 1000)
      updated.state = 'review'
      updated.review = { ...blankCardioInput(row.sport), ...localDateTime(new Date(row.started)),
        hours: String(Math.floor(seconds / 3600)), minutes: String(Math.floor(seconds / 60) % 60), seconds: String(seconds % 60) }
    }
    validateLiveCardio(updated)
    await database.cardioLive.put(updated)
    return updated
  })
}
export function saveLiveReview(token: string, input: CardioInput, database = db) {
  return database.transaction('rw', database.cardioLive, async () => {
    const row = await loadLiveCardio(database)
    if (!row || row.token !== token || row.state !== 'review') throw new Error('This recording is no longer available.')
    const updated = { ...row, review: input }
    validateLiveCardio(updated)
    await database.cardioLive.put(updated)
  })
}
