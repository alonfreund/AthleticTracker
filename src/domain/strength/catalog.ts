import type { Exercise, Tracking } from './models'

export { MUSCLES, EQUIPMENT, CATEGORIES } from './taxonomy'
import { defaultMetadata, normalizeDefinition } from './exerciseMetadata'
export const LOAD_LABELS: Record<Tracking['load'], string> = {
  external: 'External weight', bodyweight: 'Bodyweight only', added: 'Bodyweight + added weight', assisted: 'Assisted bodyweight', none: 'No load measurement',
}
export const CONVENTION_LABELS = { total: 'Total load', 'per-hand': 'Per hand', 'machine-display': 'Machine display' }
export function label(id: string, dictionary: Record<string, string>): string { return dictionary[id] ?? id.replaceAll('-', ' ') }
export function trackingLabel(tracking: Tracking): string {
  return `${LOAD_LABELS[tracking.load]} · ${tracking.measurement === 'reps' ? 'Repetitions' : 'Duration / timed hold'}${tracking.weightConvention ? ` · ${CONVENTION_LABELS[tracking.weightConvention]}` : ''}`
}

// Stable reserved IDs. These are sample movement definitions, not a training programme.
const timestamp = '2026-11-10T00:00:00.000Z'
function exercise(number: number, name: string, primary: string[], secondary: string[], equipment: string[], category: string, tracking: Tracking, instructions: string, rest = 90): Exercise {
  return {
    id: `ba51c000-0000-4000-8000-${String(number).padStart(12, '0')}`, createdAt: timestamp, updatedAt: timestamp,
    revision: 1, origin: 'bundled', name, primaryMuscleGroupIds: primary, secondaryMuscleGroupIds: secondary,
    equipmentIds: equipment, category, instructions, notes: '', tracking, defaultRestSeconds: rest, archived: false,
  }
}
const external = (convention: Tracking['weightConvention'] = 'total'): Tracking => ({ measurement: 'reps', load: 'external', weightConvention: convention })
export const LEGACY_STARTER_EXERCISES: readonly Exercise[] = [
  exercise(1, 'Barbell bench press', ['chest'], ['triceps', 'shoulders'], ['barbell', 'bench'], 'compound', external(), 'Lie on a bench with feet supported. Lower the bar under control, then press it upward. Use safeties or a spotter when appropriate.'),
  exercise(2, 'Barbell back squat', ['quadriceps', 'glutes'], ['adductors', 'core'], ['barbell'], 'compound', external(), 'Support the bar securely on your upper back. Bend at the hips and knees, then return to standing with a controlled movement.'),
  exercise(3, 'Romanian deadlift', ['hamstrings', 'glutes'], ['upper-back', 'core'], ['barbell'], 'compound', external(), 'With a slight knee bend, move the hips backward while lowering the bar close to the legs. Return to standing under control.'),
  exercise(4, 'Dumbbell shoulder press', ['shoulders'], ['triceps'], ['dumbbells'], 'compound', external('per-hand'), 'Begin with dumbbells near shoulder height. Press overhead under control, then lower. Record the weight of one dumbbell.'),
  exercise(5, 'Dumbbell curl', ['biceps'], ['forearms'], ['dumbbells'], 'isolation', external('per-hand'), 'Keep the upper arms steady while bending the elbows to lift the dumbbells. Lower under control. Record the weight of one dumbbell.'),
  exercise(6, 'Cable triceps pushdown', ['triceps'], [], ['cable'], 'isolation', external('machine-display'), 'Keep the upper arms near your sides. Extend the elbows to press the attachment down, then return under control. Record the displayed load.'),
  exercise(7, 'Lat pulldown', ['lats'], ['biceps', 'upper-back'], ['machine', 'cable'], 'compound', external('machine-display'), 'With a secure seated position, pull the attachment toward the upper chest, then return under control. Record the displayed load.'),
  exercise(8, 'Push-up', ['chest'], ['triceps', 'shoulders', 'core'], [], 'bodyweight', { measurement: 'reps', load: 'bodyweight', weightConvention: null }, 'Maintain a stable body position. Bend the elbows to lower your torso, then press back up.'),
  exercise(9, 'Pull-up', ['lats'], ['biceps', 'upper-back'], ['pull-up-bar'], 'bodyweight', { measurement: 'reps', load: 'bodyweight', weightConvention: null }, 'From a controlled hang, pull upward toward the bar, then lower under control.'),
  exercise(10, 'Weighted pull-up', ['lats'], ['biceps', 'upper-back'], ['pull-up-bar', 'dip-belt'], 'bodyweight', { measurement: 'reps', load: 'added', weightConvention: 'total' }, 'Secure the added load before starting. Perform controlled pull-ups. Record added weight separately from bodyweight.'),
  exercise(11, 'Assisted pull-up', ['lats'], ['biceps', 'upper-back'], ['machine'], 'bodyweight', { measurement: 'reps', load: 'assisted', weightConvention: 'machine-display' }, 'Set the machine assistance and follow its setup instructions. Perform controlled pull-ups. Record assistance as a positive amount, not a negative weight.'),
  exercise(12, 'Plank', ['core'], ['shoulders', 'glutes'], ['mat'], 'isometric', { measurement: 'duration', load: 'none', weightConvention: null }, 'Support yourself on forearms and toes, keeping a stable trunk. Record the time held in seconds.', 60),
]

// Same twelve reserved IDs; metadata revision only, no library expansion.
const metadata = [
  ['horizontal-push', 'bench-press', ['Bench press', 'BB bench press']],
  ['squat', 'squat', ['Back squat', 'BB squat']],
  ['hinge', 'deadlift', ['Barbell Romanian deadlift', 'RDL']],
  ['vertical-push', 'shoulder-press', ['DB overhead press']],
  ['elbow-flexion', 'curl', ['DB curl']],
  ['elbow-extension', 'triceps-extension', ['Triceps pressdown']],
  ['vertical-pull', 'pulldown', ['Cable pulldown']],
  ['horizontal-push', 'push-up', ['Pushup', 'Press-up']],
  ['vertical-pull', 'pull-up', ['Pullup']],
  ['vertical-pull', 'pull-up', ['Weighted pullup']],
  ['vertical-pull', 'pull-up', ['Machine-assisted pull-up']],
  ['anti-extension', 'plank', ['Forearm plank', 'Isometric plank']],
] as const
export const EXERCISE_FAMILIES: Record<string,string> = {
  'ba51f000-0000-4000-8000-000000000001': 'bench-press',
  'ba51f000-0000-4000-8000-000000000002': 'squat',
  'ba51f000-0000-4000-8000-000000000003': 'deadlift',
  'ba51f000-0000-4000-8000-000000000004': 'shoulder-press',
  'ba51f000-0000-4000-8000-000000000005': 'curl',
  'ba51f000-0000-4000-8000-000000000006': 'triceps-extension',
  'ba51f000-0000-4000-8000-000000000007': 'pulldown',
  'ba51f000-0000-4000-8000-000000000008': 'push-up',
  'ba51f000-0000-4000-8000-000000000009': 'pull-up',
  'ba51f000-0000-4000-8000-000000000010': 'plank',
}
export const STARTER_EXERCISES: readonly Exercise[] = LEGACY_STARTER_EXERCISES.map((exercise,index)=>{
  const [pattern,family,aliases]=metadata[index]
  const definition=normalizeDefinition(exercise)
  definition.revision=2
  definition.metadata={ ...defaultMetadata(exercise), aliases:[...aliases], familyId:Object.keys(EXERCISE_FAMILIES).find(id=>EXERCISE_FAMILIES[id]===family)!, movementPatternIds:[pattern] }
  definition.category=definition.metadata.exerciseType
  return definition
})
