import type { Exercise } from '../../domain/strength/models'
import { CATEGORIES, EQUIPMENT, label, MUSCLES, trackingLabel } from '../../domain/strength/catalog'

export function ExerciseDetail({ exercise, onBack }: { exercise: Exercise; onBack: () => void }) {
  const list = (ids: string[], dictionary: Record<string, string>) => ids.length ? ids.map(id => label(id, dictionary)).join(', ') : 'None specified'
  return <article className="exercise-detail">
    <button className="secondary" onClick={onBack}>Back to exercises</button>
    <p className="eyebrow">{exercise.origin === 'custom' ? 'YOUR CUSTOM EXERCISE' : 'STARTER EXERCISE'}</p>
    <h2>{exercise.name}</h2>
    <dl>
      <dt>Primary muscles</dt><dd>{list(exercise.primaryMuscleGroupIds, MUSCLES)}</dd>
      <dt>Secondary muscles</dt><dd>{list(exercise.secondaryMuscleGroupIds, MUSCLES)}</dd>
      <dt>Equipment</dt><dd>{list(exercise.equipmentIds, EQUIPMENT)}</dd>
      <dt>Category</dt><dd>{label(exercise.category, CATEGORIES)}</dd>
      <dt>Tracking</dt><dd>{trackingLabel(exercise.tracking)}</dd>
      <dt>Default rest</dt><dd>{exercise.defaultRestSeconds === null ? 'No default set' : `${exercise.defaultRestSeconds} seconds`}</dd>
    </dl>
    <h3>Instructions</h3><p className="multiline">{exercise.instructions || 'No instructions added.'}</p>
    <h3>Notes</h3><p className="multiline">{exercise.notes || 'No notes added.'}</p>
    <p className="note">Weight will be recorded in kg or lb when workout logging is available. Added weight and assistance are separate from bodyweight.</p>
  </article>
}
