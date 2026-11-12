import type { CardioTiming } from './timing'
import { isCardioActivity, type CardioActivity } from './activities'

export const CARDIO_SETTINGS: Record<CardioActivity, readonly string[]> = {
  running: ['Outdoor', 'Treadmill'], cycling: ['Outdoor', 'Indoor'], swimming: ['Pool', 'Open water'],
  walking: ['Outdoor', 'Treadmill'], hiking: ['Outdoor'], rowing: ['Machine', 'On water'], other: ['Indoor', 'Outdoor'],
}
export const DISTANCE_FACTORS = { km: 1000, mi: 1609.344, m: 1, yd: .9144 } as const
export type DistanceUnit = keyof typeof DISTANCE_FACTORS
export type CardioDetails = {
  id: string // Same ID as its parent session activity.
  sport: CardioActivity
  setting: string
  durationSeconds: number
  distanceMeters: number | null
  distanceUnit: DistanceUnit
  averageHeartRate: number | null
  maxHeartRate: number | null
  elevationGainMeters: number | null
  elevationLossMeters: number | null
  calories: number | null
  poolLength: number | null
  poolLengths: number | null
}

export const CARDIO_INPUT_FIELDS = ['title', 'date', 'time', 'hours', 'minutes', 'seconds', 'setting', 'distance', 'distanceUnit',
  'averageHeartRate', 'maxHeartRate', 'elevationGainMeters', 'elevationLossMeters', 'calories', 'poolLength', 'poolLengths', 'notes'] as const
export type CardioInput = Record<typeof CARDIO_INPUT_FIELDS[number], string>
export type CardioDraft = { id: CardioActivity; input: CardioInput }
export const CARDIO_TABLES = ['cardioDetails', 'cardioDrafts'] as const
export const CARDIO_TIMING_TABLES = ['cardioTiming', 'cardioLive'] as const

function fields(value: unknown, expected: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
    Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) {
    throw new Error('Invalid cardio record fields.')
  }
  return value as Record<string, unknown>
}

function validNumber(value: unknown, minimum: number, whole = false): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= Number.MAX_SAFE_INTEGER && (!whole || Number.isSafeInteger(value))
}

export function validateCardioDetails(value: unknown): asserts value is CardioDetails {
  const row = fields(value, ['id', 'sport', 'setting', 'durationSeconds', 'distanceMeters', 'distanceUnit', 'averageHeartRate',
    'maxHeartRate', 'elevationGainMeters', 'elevationLossMeters', 'calories', 'poolLength', 'poolLengths'])
  if (typeof row.id !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(row.id) ||
    typeof row.sport !== 'string' || !isCardioActivity(row.sport)) throw new Error('Invalid cardio activity.')
  if (typeof row.setting !== 'string' || (row.setting !== '' && !CARDIO_SETTINGS[row.sport].includes(row.setting))) throw new Error('Invalid cardio setting.')
  const units = distanceUnits(row.sport)
  if (!units.includes(row.distanceUnit as DistanceUnit) || !validNumber(row.durationSeconds, 1, true)) throw new Error('Invalid cardio duration or distance unit.')
  for (const key of ['distanceMeters', 'averageHeartRate', 'maxHeartRate', 'poolLength', 'poolLengths']) {
    if (row[key] !== null && !validNumber(row[key], key === 'distanceMeters' || key === 'poolLength' ? Number.MIN_VALUE : 1, key !== 'distanceMeters' && key !== 'poolLength')) {
      throw new Error('Distance, heart rate, and pool measurements must be positive.')
    }
  }
  for (const key of ['elevationGainMeters', 'elevationLossMeters', 'calories']) {
    if (row[key] !== null && !validNumber(row[key], 0)) throw new Error('Elevation and calories must be nonnegative.')
  }
  if (typeof row.averageHeartRate === 'number' && typeof row.maxHeartRate === 'number' && row.averageHeartRate > row.maxHeartRate) throw new Error('Average heart rate cannot exceed maximum heart rate.')
  if (row.poolLength !== null || row.poolLengths !== null) {
    if (row.sport !== 'swimming' || row.setting !== 'Pool' || typeof row.poolLength !== 'number' || typeof row.poolLengths !== 'number' ||
      row.distanceMeters !== row.poolLength * row.poolLengths * DISTANCE_FACTORS[row.distanceUnit as DistanceUnit]) {
      throw new Error('Pool distance must match the recorded pool length and number of lengths.')
    }
  }
}

export function validateCardioDraft(value: unknown): asserts value is CardioDraft {
  const row = fields(value, ['id', 'input'])
  if (typeof row.id !== 'string' || !isCardioActivity(row.id)) throw new Error('Invalid cardio draft activity.')
  const input = fields(row.input, CARDIO_INPUT_FIELDS)
  for (const key of CARDIO_INPUT_FIELDS) {
    if (typeof input[key] !== 'string' || input[key].length > (key === 'notes' ? 10000 : 200)) throw new Error('Invalid cardio draft input.')
  }
}

export function distanceUnits(sport: CardioActivity): DistanceUnit[] {
  return sport === 'swimming' ? ['m', 'yd'] : sport === 'rowing' ? ['m', 'km'] : ['km', 'mi']
}

export function validateCardioParent(row: CardioDetails, activity: { activityType: unknown } | undefined,
  session: { status: unknown; startedAt: string; endedAt: string | null } | undefined, timing?: CardioTiming) {
  if (activity?.activityType !== 'cardio' || session?.status !== 'finished') {
    throw new Error('Cardio details must belong to a finished cardio session with matching duration.')
  }
  const elapsed = Date.parse(session.endedAt ?? '') - Date.parse(session.startedAt)
  if (timing ? (timing.id !== row.id || elapsed < timing.activeMs || Math.floor(timing.activeMs / 1000) !== row.durationSeconds)
    : elapsed !== row.durationSeconds * 1000) {
    throw new Error('Cardio details must belong to a finished cardio session with matching duration.')
  }
}
