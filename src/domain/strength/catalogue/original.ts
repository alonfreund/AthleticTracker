// Original twelve current definitions, unchanged from 0.8/0.9.
import type { Exercise } from '../models'
import { defaultMetadata, normalizeDefinition } from '../exerciseMetadata'
import { LEGACY_STARTER_EXERCISES } from './legacy'
import { EXERCISE_FAMILIES } from './families'

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
export const STARTER_EXERCISES: readonly Exercise[] = LEGACY_STARTER_EXERCISES.map((exercise,index)=>{
  const [pattern,family,aliases]=metadata[index]
  const definition=normalizeDefinition(exercise)
  definition.revision=2
  definition.metadata={ ...defaultMetadata(exercise), aliases:[...aliases], familyId:Object.keys(EXERCISE_FAMILIES).find(id=>EXERCISE_FAMILIES[id]===family)!, movementPatternIds:[pattern] }
  definition.category=definition.metadata.exerciseType
  return definition
})
