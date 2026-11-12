import { isCardioActivity, type CardioActivity } from './activities'
import { validateCardioDraft, type CardioInput } from './models'

export const MAX_LAPS = 1000
export const LIVE_ID = 'active'
export type IntervalPlan = { workSeconds: number; recoverySeconds: number; repeats: number }
export type LiveCardio = {
  id: typeof LIVE_ID
  token: string
  sport: CardioActivity
  started: number
  checkpoint: number
  activeMs: number
  state: 'running' | 'paused' | 'review'
  laps: number[]
  plan: IntervalPlan | null
  review: CardioInput | null
}
export type CardioTiming = {
  id: string
  activeMs: number
  laps: number[]
  plan: IntervalPlan | null
}

export function activeMilliseconds(record: LiveCardio, now: number): number {
  return record.activeMs + (record.state === 'running' ? Math.max(0, now - record.checkpoint) : 0)
}

export function pauseRestoredRecording(record: LiveCardio, exportedAt: string): LiveCardio {
  if (record.state !== 'running') return record
  const checkpoint = Math.max(record.checkpoint, Date.parse(exportedAt))
  return { ...record, checkpoint, activeMs: activeMilliseconds(record, checkpoint), state: 'paused' }
}

export function segments(activeMs: number, laps: number[], plan: IntervalPlan | null) {
  const lapEnds = [...laps]
  if (activeMs > (lapEnds.at(-1) ?? 0)) lapEnds.push(activeMs)
  const lapSegments = lapEnds.map((end, index) => ({ start: lapEnds[index - 1] ?? 0, end }))
  const intervals: { start: number; end: number; kind: 'Work' | 'Recovery'; repeat: number }[] = []
  if (plan) {
    let start = 0
    for (let repeat = 1; repeat <= plan.repeats && start < activeMs; repeat++) {
      const workEnd = start + plan.workSeconds * 1000
      intervals.push({ start, end: Math.min(workEnd, activeMs), kind: 'Work', repeat })
      start = workEnd
      if (repeat < plan.repeats && start < activeMs && plan.recoverySeconds > 0) {
        const end = start + plan.recoverySeconds * 1000
        intervals.push({ start, end: Math.min(end, activeMs), kind: 'Recovery', repeat })
        start = end
      }
    }
  }
  return { laps: lapSegments, intervals }
}

export function currentInterval(plan: IntervalPlan, activeMs: number) {
  const cycle = (plan.workSeconds + plan.recoverySeconds) * 1000
  const repeat = Math.floor(activeMs / cycle) + 1
  const offset = activeMs % cycle
  const workMs = plan.workSeconds * 1000
  if (repeat > plan.repeats || (repeat === plan.repeats && offset >= workMs)) return undefined
  return offset < workMs ? { kind: 'Work', repeat, remaining: workMs - offset }
    : { kind: 'Recovery', repeat, remaining: cycle - offset }
}

const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i
const integer = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max
function exact(value: unknown, keys: string[]): boolean {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
}
export function validateIntervalPlan(plan: IntervalPlan | null) {
  if (plan === null) return
  if (!exact(plan, ['workSeconds', 'recoverySeconds', 'repeats']) || !integer(plan.workSeconds, 1, 3600)
    || !integer(plan.recoverySeconds, 0, 3600) || !integer(plan.repeats, 1, 100)) throw new Error('Invalid interval plan.')
}
function validateLaps(laps: number[], activeMs: number) {
  if (!Array.isArray(laps) || laps.length > MAX_LAPS ||
    laps.some((end, index) => !integer(end, 1, activeMs) || end <= (laps[index - 1] ?? 0))) throw new Error('Invalid lap boundaries.')
}
export function validateLiveCardio(value: unknown): asserts value is LiveCardio {
  const row = value as LiveCardio
  if (!exact(row, ['id', 'token', 'sport', 'started', 'checkpoint', 'activeMs', 'state', 'laps', 'plan', 'review']) ||
    row.id !== LIVE_ID || typeof row.token !== 'string' || !uuid.test(row.token) || typeof row.sport !== 'string' || !isCardioActivity(row.sport) ||
    !integer(row.started, 0, 8640000000000000) || !integer(row.checkpoint, row.started, 8640000000000000) ||
    !integer(row.activeMs, 0, row.checkpoint - row.started) || !['running', 'paused', 'review'].includes(row.state)) throw new Error('Invalid live cardio recording.')
  validateIntervalPlan(row.plan)
  validateLaps(row.laps, row.activeMs)
  if (row.state === 'review') {
    if (row.activeMs < 1000) throw new Error('Record at least one second before finishing.')
    validateCardioDraft({ id: row.sport, input: row.review })
    const seconds = Math.floor(row.activeMs / 1000)
    if (row.review!.hours !== String(Math.floor(seconds / 3600)) || row.review!.minutes !== String(Math.floor(seconds / 60) % 60) ||
      row.review!.seconds !== String(seconds % 60)) throw new Error('The review duration must match the recording.')
  } else if (row.review !== null) throw new Error('Only a finished recording can have review fields.')
}
export function validateCardioTiming(value: unknown): asserts value is CardioTiming {
  const row = value as CardioTiming
  if (!exact(row, ['id', 'activeMs', 'laps', 'plan']) || typeof row.id !== 'string' || !uuid.test(row.id) || !integer(row.activeMs, 1000)) {
    throw new Error('Invalid saved cardio timing.')
  }
  validateLaps(row.laps, row.activeMs)
  validateIntervalPlan(row.plan)
}
