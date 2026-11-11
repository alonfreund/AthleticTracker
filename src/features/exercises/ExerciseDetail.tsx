import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { db } from '../../data/db/database'
import { updateSafety } from '../../app/updateSafety'
import { globalRest, setFavourite } from '../../data/repositories/preferences'
import { defaultMetadata } from '../../domain/strength/exerciseMetadata'
import { EXERCISE_TYPES, MOVEMENT_PATTERNS, REPETITION_CONVENTIONS } from '../../domain/strength/taxonomy'
import type { Exercise } from '../../domain/strength/models'
import { CATEGORIES, EQUIPMENT, label, MUSCLES, trackingLabel } from '../../domain/strength/catalog'

export function ExerciseDetail({ exercise, onBack }: { exercise: Exercise; onBack: () => void }) {
  const metadata = exercise.metadata ?? defaultMetadata(exercise)
  const [rest, setRest] = useState('Loading saved rest…')
  const [favourite, setFavouriteState] = useState<boolean>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  useEffect(() => {
    let active = true
    void db.exercisePreferences.get(exercise.id).then(preference => {
      if (!active) return
      setFavouriteState(preference?.favourite ?? false)
      if (preference?.restSeconds != null) {
        setRest(`${preference.restSeconds} seconds · personal preference`)
        return
      }
      return globalRest().then(global => { if (active) setRest(`Uses global default (${global} seconds)`) })
    }).catch(() => {
      if (active) { setRest('Saved rest could not be loaded.'); setError('Could not load exercise preferences.') }
    })
    return () => { active = false }
  }, [exercise.id])
  async function toggleFavourite() {
    if (saving || favourite === undefined || updateSafety.getSnapshot().applying) return
    const next = !favourite
    setSaving(true)
    updateSafety.setBusy(true)
    setError('')
    try {
      await setFavourite(exercise.id, next)
      setFavouriteState(next)
    } catch {
      setError('Could not save favourite. Please try again.')
    } finally {
      setSaving(false)
      updateSafety.setBusy(false)
    }
  }
  const list = (ids: string[], dictionary: Record<string, string>) => ids.length ? ids.map(id => label(id, dictionary)).join(', ') : 'None specified'
  return <article className="exercise-detail">
    <button className="secondary" disabled={saving} onClick={onBack}>Back to exercises</button>
    <p className="eyebrow">{exercise.origin === 'custom' ? 'YOUR CUSTOM EXERCISE' : 'BUILT-IN EXERCISE'}</p>
    <h2>{exerciseDisplayName(exercise)}</h2>
    <button type="button" className="secondary" aria-pressed={favourite ?? false}
      disabled={favourite === undefined || saving || applying} onClick={() => void toggleFavourite()}>
      Favourite
    </button>
    {error && <p role="alert">{error}</p>}
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
