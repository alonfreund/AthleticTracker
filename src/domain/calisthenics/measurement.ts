export type MeasurementUnit = 'kg' | 'reps' | 'seconds' | 'steps'

export function formatMeasurement(value: number, unit: MeasurementUnit) {
  if (unit === 'kg') return `${value} kg`
  if (unit === 'steps') return `${value} ${value === 1 ? 'step' : 'steps'}`
  if (unit === 'seconds') return `${value} sec`
  return `${value} ${value === 1 ? 'rep' : 'reps'}`
}

export function isMeasurementValue(value: number, unit: MeasurementUnit) {
  return Number.isFinite(value) && value >= (unit === 'steps' ? 1 : 0) && value <= Number.MAX_SAFE_INTEGER &&
    (unit === 'kg' || Number.isSafeInteger(value))
}

export function parseMeasurement(input: string, unit: MeasurementUnit): number | undefined {
  const trimmed = input.trim()
  const pattern = unit === 'kg' ? /^\d+(?:[.,]\d+)?$/ : /^\d+$/
  if (!pattern.test(trimmed)) return
  const value = Number(trimmed.replace(',', '.'))
  if (isMeasurementValue(value, unit)) return value
}
