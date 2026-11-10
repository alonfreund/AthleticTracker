import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { useEffect, useState } from 'react'
import { db } from '../../data/db/database'
import { globalRest } from '../../data/repositories/preferences'
import { defaultMetadata } from '../../domain/strength/exerciseMetadata'
import { EXERCISE_TYPES, MOVEMENT_PATTERNS, REPETITION_CONVENTIONS } from '../../domain/strength/taxonomy'
import type { Exercise } from '../../domain/strength/models'
import { CATEGORIES, EQUIPMENT, label, MUSCLES, trackingLabel } from '../../domain/strength/catalog'

export function ExerciseDetail({ exercise, onBack }: { exercise: Exercise; onBack: () => void }) {
  const metadata = exercise.metadata ?? defaultMetadata(exercise)
  const [rest, setRest] = useState('Loading saved rest…')
  useEffect(() => { let active = true; void Promise.all([db.exercisePreferences.get(exercise.id), globalRest()]).then(([preference, global]) => { if (active) setRest(preference?.restSeconds == null ? `Uses global default (${global} seconds)` : `${preference.restSeconds} seconds · personal preference`) }).catch(() => { if (active) setRest('Saved rest could not be loaded.') }); return () => { active = false } }, [exercise.id])
  const list = (ids: string[], dictionary: Record<string, string>) => ids.length ? ids.map(id => label(id, dictionary)).join(', ') : 'None specified'
  return <article className="exercise-detail">
    <button className="secondary" onClick={onBack}>Back to exercises</button>
    <p className="eyebrow">{exercise.origin === 'custom' ? 'YOUR CUSTOM EXERCISE' : 'BUILT-IN EXERCISE'}</p>
    <h2>{exerciseDisplayName(exercise)}</h2>
    <dl>
      <dt>Primary muscles</dt><dd>{list(exercise.primaryMuscleGroupIds, MUSCLES)}</dd>
      <dt>Secondary muscles</dt><dd>{list(exercise.secondaryMuscleGroupIds, MUSCLES)}</dd>
      <dt>Equipment</dt><dd>{list(exercise.equipmentIds, EQUIPMENT)}</dd>
      <dt>Exercise type</dt><dd>{EXERCISE_TYPES[metadata.exerciseType]}{metadata.exerciseType === 'unspecified' ? ` · legacy category: ${label(exercise.category, CATEGORIES)}` : ''}</dd>
      <dt>Movement patterns</dt><dd>{list(metadata.movementPatternIds, MOVEMENT_PATTERNS)}</dd>
      <dt>Also known as</dt><dd>{metadata.aliases.join(', ') || 'None specified'}</dd>
      <dt>Optional equipment</dt><dd>{list(metadata.optionalEquipmentIds, EQUIPMENT)}</dd>
      <dt>Repetitions</dt><dd>{REPETITION_CONVENTIONS[metadata.repetitionConvention]}</dd>
      {Object.entries(metadata.variant).filter(([,value])=>value).map(([key,value])=><div key={key}><dt>{key[0].toUpperCase()+key.slice(1)}</dt><dd>{value}</dd></div>)}
      <dt>Tracking</dt><dd>{trackingLabel(exercise.tracking)}</dd>
      <dt>Default rest</dt><dd>{rest}</dd>
    </dl>
    <h3>Instructions</h3><p className="multiline">{exercise.instructions || 'No instructions added.'}</p>
    <h3>Notes</h3><p className="multiline">{exercise.notes || 'No notes added.'}</p>
    <p className="note">Workouts record weight in kg or lb. Added weight and assistance are separate from bodyweight.</p>
  </article>
}
