export const METRIC_TYPES = {
  time: 'Time (seconds)', reps: 'Repetitions', distance: 'Distance (m)', weight: 'Weight (kg)',
  rounds: 'Rounds', 'rounds-reps': 'Rounds + extra reps', custom: 'Custom score',
} as const
export type MetricType = keyof typeof METRIC_TYPES
export type Direction = 'higher' | 'lower' | 'trend'
export type Result = number | { rounds: number; reps: number }
export type ChallengeMetric = { name: string; type: MetricType; direction: Direction; unit: string }
export type Challenge = { id: string; name: string; rules: string; kind: 'Challenge' | 'Finisher' | 'Performance test'; metrics: ChallengeMetric[]; target?: Result }
export type ChallengeAttempt = { id: string; challengeId: string; recordedAt: string; results: (Result | null)[]; notes: string }
export const MAX_METRICS = 8

const units: Partial<Record<MetricType, string>> = { time: 's', reps: 'reps', distance: 'm', weight: 'kg', rounds: 'rounds' }
const uuid = (value: unknown) => typeof value === 'string' && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value)
const text = (value: unknown, max: number) => typeof value === 'string' && value.length <= max
const named = (value: unknown, max: number) => text(value, max) && !!(value as string).trim()
function shape(value: unknown, required: string[], optional: string[] = []): boolean {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    required.every(key => Object.hasOwn(value, key)) && Object.keys(value).every(key => required.includes(key) || optional.includes(key))
}
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER

export function validResult(value: unknown, type: MetricType): value is Result {
  if (type === 'rounds-reps') {
    const pair = value as { rounds: unknown; reps: unknown }
    return shape(value, ['rounds', 'reps']) && count(pair.rounds) && count(pair.reps)
  }
  if (type === 'rounds' || type === 'reps') return count(value)
  return finite(value) && (type === 'custom' || value >= 0)
}

export function validateChallenge(value: unknown): asserts value is Challenge {
  const row = value as Challenge
  if (!shape(value, ['id', 'name', 'rules', 'kind', 'metrics'], ['target']) || !uuid(row.id) || !named(row.name, 100) ||
    !text(row.rules, 3000) || !['Challenge', 'Finisher', 'Performance test'].includes(row.kind) ||
    !Array.isArray(row.metrics) || row.metrics.length < 1 || row.metrics.length > MAX_METRICS) throw new Error('Invalid challenge.')
  for (const metric of row.metrics) {
    if (!shape(metric, ['name', 'type', 'direction', 'unit']) || !named(metric.name, 60) ||
      typeof metric.type !== 'string' || !Object.hasOwn(METRIC_TYPES, metric.type) ||
      !['higher', 'lower', 'trend'].includes(metric.direction) || !text(metric.unit, 20) ||
      (metric.type !== 'custom' && metric.unit !== '')) throw new Error('Invalid challenge metric.')
  }
  if (new Set(row.metrics.map(metric => metric.name.trim().toLowerCase())).size !== row.metrics.length) throw new Error('Use a different name for each metric.')
  if (row.target !== undefined && (row.metrics[0].direction === 'trend' || !validResult(row.target, row.metrics[0].type))) throw new Error('Invalid challenge target.')
}

export function validateChallengeAttempt(value: unknown, challenge?: Challenge): asserts value is ChallengeAttempt {
  const row = value as ChallengeAttempt
  if (!shape(value, ['id', 'challengeId', 'recordedAt', 'results', 'notes']) || !uuid(row.id) || !uuid(row.challengeId) ||
    typeof row.recordedAt !== 'string' || !Number.isFinite(Date.parse(row.recordedAt)) ||
    new Date(row.recordedAt).toISOString() !== row.recordedAt || !text(row.notes, 3000) ||
    !Array.isArray(row.results) || row.results.length < 1 || row.results.length > MAX_METRICS ||
    row.results[0] == null || Array.from(row.results).some(result => result !== null && !finite(result) && !validResult(result, 'rounds-reps'))) throw new Error('Invalid challenge attempt.')
  if (challenge && (row.challengeId !== challenge.id || row.results.length !== challenge.metrics.length ||
    row.results.some((result, index) => result !== null && !validResult(result, challenge.metrics[index].type)))) throw new Error('Attempt measurements do not match the challenge.')
}

export function compareResults(a: Result, b: Result): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'object' && typeof b === 'object') return a.rounds - b.rounds || a.reps - b.reps
  throw new Error('Results use different measurement types.')
}

export function isBetter(a: Result, b: Result, direction: Direction) {
  return direction === 'higher' ? compareResults(a, b) > 0 : direction === 'lower' && compareResults(a, b) < 0
}

export function formatResult(result: Result, metric: ChallengeMetric): string {
  if (typeof result === 'object') return `${result.rounds} ${result.rounds === 1 ? 'round' : 'rounds'} + ${result.reps} ${result.reps === 1 ? 'rep' : 'reps'}`
  const unit = units[metric.type] ?? metric.unit.trim()
  return unit ? `${result} ${unit}` : String(result)
}

export type ResultInput = { value: string; extra: string }
export const emptyResult = (): ResultInput => ({ value: '', extra: '' })
export function parseResult(input: ResultInput, metric: ChallengeMetric): Result | null {
  const main = input.value.trim()
  const extra = input.extra.trim()
  if (!main && !extra) return null
  const number = (part: string) => /^-?\d+(?:[.,]\d+)?$/.test(part) ? Number(part.replace(',', '.')) : NaN
  const result = metric.type === 'rounds-reps' ? { rounds: number(main), reps: number(extra || '0') } : number(main)
  if (!validResult(result, metric.type)) throw new Error(`Enter a valid result for ${metric.name || 'the primary metric'}.`)
  return result
}
