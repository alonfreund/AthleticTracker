import { DISTANCE_FACTORS, type CardioDetails } from '../../domain/cardio/models'

const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
export function durationText(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor(seconds / 60) % 60
  const remainder = seconds % 60
  return [hours && `${hours} h`, minutes && `${minutes} min`, (remainder || !seconds) && `${remainder} s`].filter(Boolean).join(' ')
}
export function distanceText(row: CardioDetails) {
  return row.distanceMeters === null ? undefined : `${number.format(row.distanceMeters / DISTANCE_FACTORS[row.distanceUnit])} ${row.distanceUnit}`
}
export function paceText(row: Pick<CardioDetails, 'sport' | 'distanceMeters' | 'distanceUnit' | 'durationSeconds'>) {
  if (!row.distanceMeters) return undefined
  if (row.sport === 'other') return undefined
  if (row.sport === 'cycling') return `${number.format(row.distanceMeters / DISTANCE_FACTORS[row.distanceUnit] / (row.durationSeconds / 3600))} ${row.distanceUnit}/h`
  const [meters, label] = row.sport === 'rowing' ? [500, '500 m'] : row.sport === 'swimming'
    ? [100 * DISTANCE_FACTORS[row.distanceUnit], `100 ${row.distanceUnit}`] : [DISTANCE_FACTORS[row.distanceUnit], row.distanceUnit]
  const seconds = Math.round(row.durationSeconds * meters / row.distanceMeters)
  if (!Number.isFinite(seconds)) return undefined
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} / ${label}`
}
