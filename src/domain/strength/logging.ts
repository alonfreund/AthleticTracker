import type { EditorDraft, Mass, StrengthLoad, StrengthSet, Tracking, WeightUnit } from './models'
import { massInKilograms } from './models'
export type SetInput = Pick<EditorDraft, 'values' | 'weightUnit'>
export function emptyLoad(mode: Tracking['load']): StrengthLoad {
  switch (mode) {
    case 'none': return { mode }
    case 'external': return { mode, weight: null }
    case 'bodyweight': return { mode, bodyweight: null }
    case 'added': return { mode, addedWeight: null, bodyweight: null }
    case 'assisted': return { mode, assistance: null, bodyweight: null }
  }
}
function inUnit(mass: Mass | null, unit: WeightUnit): string {
  if (!mass) return ''
  if (mass.unit === unit) return String(mass.value)
  return String(Number((massInKilograms(mass) / (unit === 'kg' ? 1 : 0.45359237)).toFixed(8)))
}
export function inputFromSet(set: StrengthSet): SetInput {
  const load = set.load
  const weight = load.mode === 'external' ? load.weight : load.mode === 'added' ? load.addedWeight : load.mode === 'assisted' ? load.assistance : null
  const bodyweight = 'bodyweight' in load ? load.bodyweight : null
  const unit = weight?.unit ?? bodyweight?.unit ?? 'kg'
  return { weightUnit: unit, values: { weight: inUnit(weight, unit), bodyweight: inUnit(bodyweight, unit), reps: set.reps === null ? '' : String(set.reps), durationSeconds: set.durationSeconds === null ? '' : String(set.durationSeconds), rpe: set.rpe === null ? '' : String(set.rpe), rir: set.rir === null ? '' : String(set.rir) } }
}
function number(value: string, name: string): number | null {
  const text = value.trim()
  if (!text) return null
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) throw new Error(`${name} must be a valid non-negative number.`)
  const result = Number(text)
  if (!Number.isFinite(result) || result > Number.MAX_SAFE_INTEGER) throw new Error(`${name} is too large.`)
  return result
}
export function measurements(input: SetInput, tracking: Tracking): Pick<StrengthSet, 'reps' | 'durationSeconds' | 'load' | 'rpe' | 'rir'> {
  const mass = (text: string, name: string): Mass | null => { const value = number(text, name); return value === null ? null : { value, unit: input.weightUnit } }
  let load = emptyLoad(tracking.load)
  switch (load.mode) {
    case 'external': load = { mode: load.mode, weight: mass(input.values.weight, 'Weight') }; break
    case 'bodyweight': load = { mode: load.mode, bodyweight: mass(input.values.bodyweight, 'Bodyweight') }; break
    case 'added': load = { mode: load.mode, addedWeight: mass(input.values.weight, 'Added weight'), bodyweight: mass(input.values.bodyweight, 'Bodyweight') }; break
    case 'assisted': load = { mode: load.mode, assistance: mass(input.values.weight, 'Assistance'), bodyweight: mass(input.values.bodyweight, 'Bodyweight') }; break
  }
  return { load, reps: tracking.measurement === 'reps' ? number(input.values.reps, 'Repetitions') : null, durationSeconds: number(input.values.durationSeconds, 'Duration'), rpe: number(input.values.rpe, 'RPE'), rir: number(input.values.rir, 'RIR') }
}
export function convertInputUnit(input: SetInput, unit: WeightUnit): SetInput {
  if (input.weightUnit === unit) return input
  const convert = (value: string, name: string) => { const parsed = number(value, name); return parsed === null ? '' : inUnit({ value: parsed, unit: input.weightUnit }, unit) }
  return { weightUnit: unit, values: { ...input.values, weight: convert(input.values.weight, 'Weight'), bodyweight: convert(input.values.bodyweight, 'Bodyweight') } }
}
export function performanceText(set: StrengthSet): string {
  const load = set.load
  const massText = (mass: Mass | null) => mass ? `${mass.value} ${mass.unit}` : '—'
  const parts: string[] = []
  if (load.mode === 'external') parts.push(massText(load.weight))
  if (load.mode === 'bodyweight') parts.push(load.bodyweight ? `Bodyweight ${massText(load.bodyweight)}` : 'Bodyweight')
  if (load.mode === 'added') parts.push(`Added ${massText(load.addedWeight)}`, load.bodyweight ? `bodyweight ${massText(load.bodyweight)}` : 'bodyweight not recorded')
  if (load.mode === 'assisted') parts.push(`Assistance ${massText(load.assistance)}`, load.bodyweight ? `bodyweight ${massText(load.bodyweight)}` : 'bodyweight not recorded')
  if (set.reps !== null) parts.push(`${set.reps} reps`)
  if (set.durationSeconds !== null) parts.push(`${set.durationSeconds} s`)
  if (set.rpe !== null) parts.push(`RPE ${set.rpe}`)
  if (set.rir !== null) parts.push(`RIR ${set.rir}`)
  return parts.join(' · ') || 'No values yet'
}
