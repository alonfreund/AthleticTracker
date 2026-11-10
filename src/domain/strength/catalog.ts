import type { Tracking } from './models'

export { MUSCLES, EQUIPMENT, CATEGORIES } from './taxonomy'
export const LOAD_LABELS: Record<Tracking['load'], string> = {
  external: 'External weight', bodyweight: 'Bodyweight only', added: 'Bodyweight + added weight', assisted: 'Assisted bodyweight', none: 'No load measurement',
}
export const CONVENTION_LABELS = { total: 'Total load', 'per-hand': 'Per hand', 'machine-display': 'Machine display' }
export function label(id: string, dictionary: Record<string, string>): string { return dictionary[id] ?? id.replaceAll('-', ' ') }
export function trackingLabel(tracking: Tracking): string {
  return `${LOAD_LABELS[tracking.load]} · ${tracking.measurement === 'reps' ? 'Repetitions' : 'Duration / timed hold'}${tracking.weightConvention ? ` · ${CONVENTION_LABELS[tracking.weightConvention]}` : ''}`
}

/** Compact active-workout label; unweighted repetitions are not timed holds. */
export function workoutLoadLabel(config: Tracking): string {
  if (config.load === 'assisted') return 'Assistance'
  if (config.load === 'added') return 'Added weight'
  if (config.load === 'bodyweight') return 'Bodyweight'
  if (config.weightConvention) return CONVENTION_LABELS[config.weightConvention]
  return config.measurement === 'duration' ? 'Timed hold' : 'Reps only'
}

export { LEGACY_STARTER_EXERCISES } from './catalogue/legacy'
export { STARTER_EXERCISES } from './catalogue/original'
export { EXERCISE_FAMILIES } from './catalogue/families'
export { BUILTIN_EXERCISES, CATALOGUE_BATCHES } from './catalogue/manifest'
