import { LIVE_ID, type CardioTiming, type LiveCardio } from '../../domain/cardio/timing'
import { CARDIO_ACTIVITIES, type CardioActivity } from '../../domain/cardio/activities'
import { DISTANCE_FACTORS, distanceUnits, validateCardioDetails, validateCardioDraft, type CardioDetails, type CardioInput, type DistanceUnit } from '../../domain/cardio/models'
import type { Session, SessionActivity } from '../../domain/strength/models'
import { db } from '../db/database'

export type CardioSession = { session: Session; details: CardioDetails; timing?: CardioTiming }

function optionalNumber(text: string, label: string) {
  if (!text.trim()) return null
  const value = Number(text.replace(',', '.'))
  if (!Number.isFinite(value) || value < 0) throw new Error(`Enter a valid ${label}.`)
  return value
}
export function localDateTime(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
  return { date: local.slice(0, 10), time: local.slice(11, 16) }
}
export function blankCardioInput(sport: CardioActivity): CardioInput {
  return { ...localDateTime(), title: '', notes: '', setting: '', hours: '', minutes: '', seconds: '',
    distance: '', distanceUnit: distanceUnits(sport)[0], averageHeartRate: '', maxHeartRate: '', elevationGainMeters: '',
    elevationLossMeters: '', calories: '', poolLength: '', poolLengths: '' }
}
export function inputFromCardio({ session, details }: CardioSession): CardioInput {
  const str = (value: number | null) => value === null ? '' : String(value)
  const seconds = details.durationSeconds
  return {
    ...localDateTime(new Date(session.startedAt)), title: session.title, notes: session.notes, setting: details.setting,
    hours: str(Math.floor(seconds / 3600)), minutes: str(Math.floor(seconds / 60) % 60), seconds: str(seconds % 60),
    distance: str(details.distanceMeters === null || details.poolLength !== null ? null : Number((details.distanceMeters / DISTANCE_FACTORS[details.distanceUnit]).toPrecision(15))),
    distanceUnit: details.distanceUnit, poolLength: str(details.poolLength), poolLengths: str(details.poolLengths),
    averageHeartRate: str(details.averageHeartRate), maxHeartRate: str(details.maxHeartRate),
    elevationGainMeters: str(details.elevationGainMeters), elevationLossMeters: str(details.elevationLossMeters), calories: str(details.calories),
  }
}
export function saveCardioDraft(sport: CardioActivity, input: CardioInput, database = db) {
  const row = { id: sport, input }
  validateCardioDraft(row)
  return database.cardioDrafts.put(row)
}
export function discardCardioDraft(sport: CardioActivity, database = db) {
  return database.cardioDrafts.delete(sport)
}
export function loadCardioDraft(sport: CardioActivity, database = db) {
  return database.cardioDrafts.get(sport)
}
export function readCardioMeasurements(sport: CardioActivity, input: CardioInput) {
  const parts = [input.hours, input.minutes, input.seconds].map(value => optionalNumber(value, 'duration') ?? 0)
  if (parts.some(value => !Number.isSafeInteger(value)) || parts[1] >= 60 || parts[2] >= 60) throw new Error('Use whole hours and 0–59 minutes and seconds.')
  const durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (!Number.isSafeInteger(durationSeconds) || durationSeconds <= 0) throw new Error('Enter a positive duration.')
  const distanceUnit = input.distanceUnit as DistanceUnit
  const direct = optionalNumber(input.distance, 'distance')
  const poolLength = optionalNumber(input.poolLength, 'pool length')
  const poolLengths = optionalNumber(input.poolLengths, 'number of lengths')
  if (direct !== null && (poolLength !== null || poolLengths !== null)) throw new Error('Enter either distance or pool length and lengths swum.')
  if ((poolLength === null) !== (poolLengths === null)) throw new Error('Enter both pool length and lengths swum.')
  const distance = poolLength !== null && poolLengths !== null ? poolLength * poolLengths : direct
  if (!distanceUnits(sport).includes(distanceUnit)) throw new Error('Choose a distance unit for this activity.')
  if (distance !== null && (!Number.isFinite(distance) || distance <= 0)) throw new Error('Enter a positive distance.')
  if (poolLength !== null && (input.setting !== 'Pool' || sport !== 'swimming' || poolLength <= 0 || !Number.isSafeInteger(poolLengths) || poolLengths! < 1)) {
    throw new Error('Enter a positive pool length and a whole number of lengths.')
  }
  return { durationSeconds, distanceUnit, distanceMeters: distance === null ? null : distance * DISTANCE_FACTORS[distanceUnit], poolLength, poolLengths }
}
export function saveCardioSession(sport: CardioActivity, input: CardioInput, previous?: CardioSession, database = db, live?: LiveCardio) {
  validateCardioDraft({ id: sport, input })
  const start = new Date(`${input.date}T${input.time}`)
  if (!live && !previous?.timing && (!Number.isFinite(start.getTime()) || localDateTime(start).date !== input.date || localDateTime(start).time !== input.time)) {
    throw new Error('Enter a valid local date and time.')
  }
  const originalStart = previous && localDateTime(new Date(previous.session.startedAt))
  const startedAt = live ? new Date(live.started).toISOString() : previous?.timing ? previous.session.startedAt : previous && originalStart?.date === input.date && originalStart.time === input.time ? previous.session.startedAt : start.toISOString()
  const measurements = readCardioMeasurements(sport, input)
  const { durationSeconds } = measurements
  if ((live && durationSeconds !== Math.floor(live.activeMs / 1000)) ||
    (previous?.timing && (startedAt !== previous.session.startedAt || durationSeconds !== previous.details.durationSeconds))) {
    throw new Error('The recorded timing cannot be changed.')
  }
  const end = new Date(live ? live.checkpoint : previous?.timing ? Date.parse(previous.session.endedAt!) : Date.parse(startedAt) + durationSeconds * 1000)
  if (!Number.isFinite(end.getTime())) throw new Error('The duration extends beyond the supported date range.')
  const originalInput = previous && inputFromCardio(previous)
  const unchangedDistance = originalInput && ['distance', 'distanceUnit', 'poolLength', 'poolLengths'].every(key => {
    const field = key as keyof CardioInput
    return originalInput[field] === input[field]
  })
  const now = new Date(Math.max(Date.now(), Date.parse(previous?.session.updatedAt ?? startedAt))).toISOString()
  const id = previous?.session.id ?? crypto.randomUUID()
  const details: CardioDetails = {
    id: previous?.details.id ?? crypto.randomUUID(), sport, setting: input.setting, ...measurements,
    distanceMeters: unchangedDistance ? previous!.details.distanceMeters : measurements.distanceMeters,
    averageHeartRate: optionalNumber(input.averageHeartRate, 'average heart rate'), maxHeartRate: optionalNumber(input.maxHeartRate, 'maximum heart rate'),
    elevationGainMeters: optionalNumber(input.elevationGainMeters, 'elevation gain'), elevationLossMeters: optionalNumber(input.elevationLossMeters, 'elevation loss'),
    calories: optionalNumber(input.calories, 'calorie count'),
  }
  validateCardioDetails(details)
  const session: Session = { id, startedAt, endedAt: end.toISOString(),
    createdAt: previous?.session.createdAt ?? now, updatedAt: now, status: 'finished', title: input.title.trim() || CARDIO_ACTIVITIES[sport], notes: input.notes }
  const activity: SessionActivity = { id: details.id, sessionId: id, activityType: 'cardio', position: 0, createdAt: session.createdAt, updatedAt: now }
  return database.transaction('rw', [database.sessions, database.sessionActivities, database.cardioDetails, database.cardioDrafts, database.cardioTiming, database.cardioLive], async () => {
    if (previous) {
      await checkVersion(previous, database)
      await database.sessions.put(session)
      await database.cardioDetails.put(details)
    } else {
      if (live) {
        const current = await database.cardioLive.get(LIVE_ID)
        if (!current || current.token !== live.token || current.state !== 'review' || current.checkpoint !== live.checkpoint ||
          current.activeMs !== live.activeMs || current.sport !== sport || JSON.stringify(current.review) !== JSON.stringify(input)) {
          throw new Error('This recording changed. Reopen it and try again.')
        }
        await database.cardioTiming.add({ id: details.id, activeMs: current.activeMs, laps: current.laps, plan: current.plan })
        await database.cardioLive.delete(LIVE_ID)
      }
      await database.sessions.add(session)
      await database.sessionActivities.add(activity)
      await database.cardioDetails.add(details)
      if (!live) await database.cardioDrafts.delete(sport)
    }
    return id
  })
}
async function checkVersion(previous: CardioSession, database: typeof db) {
  const session = await database.sessions.get(previous.session.id)
  const details = await database.cardioDetails.get(previous.details.id)
  const activity = await database.sessionActivities.get(previous.details.id)
  const timing = await database.cardioTiming.get(previous.details.id)
  if (activity?.activityType !== 'cardio' || activity.sessionId !== previous.session.id ||
    JSON.stringify(session) !== JSON.stringify(previous.session) || JSON.stringify(details) !== JSON.stringify(previous.details) || JSON.stringify(timing) !== JSON.stringify(previous.timing)) {
    throw new Error('This session changed. Reopen it and try again.')
  }
}
export function deleteCardioSession(previous: CardioSession, database = db) {
  return database.transaction('rw', database.sessions, database.sessionActivities, database.cardioDetails, database.cardioTiming, async () => {
    await checkVersion(previous, database)
    await database.cardioTiming.delete(previous.details.id)
    await database.cardioDetails.delete(previous.details.id)
    await database.sessionActivities.delete(previous.details.id)
    await database.sessions.delete(previous.session.id)
  })
}
export function listCardioSessions(database = db): Promise<CardioSession[]> {
  return database.transaction('r', database.sessions, database.sessionActivities, database.cardioDetails, database.cardioTiming, async () => {
    const activities = await database.sessionActivities.where('activityType').equals('cardio').toArray()
    const [sessions, details, timings] = await Promise.all([
      database.sessions.bulkGet(activities.map(row => row.sessionId)),
      database.cardioDetails.bulkGet(activities.map(row => row.id)),
      database.cardioTiming.bulkGet(activities.map(row => row.id)),
    ])
    return sessions.flatMap((session, index) => {
      const detail = details[index]
      return session?.status === 'finished' && detail ? [{ session, details: detail, timing: timings[index] }] : []
    }).sort((a, b) => b.session.startedAt.localeCompare(a.session.startedAt) || b.session.id.localeCompare(a.session.id))
  })
}
export function cardioWeek(sessions: CardioSession[], now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
  return sessions.reduce((totals, { session, details }) => {
    const date = new Date(session.startedAt)
    if (date >= start && date < end) {
      totals.sessions++
      totals.duration += details.durationSeconds
      if (details.distanceMeters !== null) totals.distance = (totals.distance ?? 0) + details.distanceMeters
    }
    return totals
  }, { sessions: 0, duration: 0, distance: null as number | null })
}
