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


export { LEGACY_STARTER_EXERCISES } from './catalogue/legacy'
export { STARTER_EXERCISES } from './catalogue/original'
export { EXERCISE_FAMILIES } from './catalogue/families'
export { BUILTIN_EXERCISES, CATALOGUE_BATCHES } from './catalogue/manifest'
