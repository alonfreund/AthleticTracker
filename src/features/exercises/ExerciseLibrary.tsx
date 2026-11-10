import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import { createCustomExercise, filterExercises, initializeExerciseLibrary, listExercises, type ExerciseFilters, type ExerciseInput } from '../../data/repositories/exercises'
import type { Exercise } from '../../domain/strength/models'
import { EQUIPMENT, label, MUSCLES, trackingLabel } from '../../domain/strength/catalog'
import { CustomExerciseForm } from './CustomExerciseForm'
import { ExerciseDetail } from './ExerciseDetail'

export function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [creating, setCreating] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [selected, setSelected] = useState<Exercise>()
  const [filters, setFilters] = useState<ExerciseFilters>({ query: '', origin: 'all', muscle: '', equipment: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  useLayoutEffect(() => { updateSafety.setSafety({ dirty, busy, restoring: false, loading }) }, [dirty, busy, loading])
  useEffect(() => {
    let active = true
    void initializeExerciseLibrary().then(result => { if (active && result.preserved.length) setMessage('Some built-in definitions were kept to preserve local changes. Your exercises and history remain available.'); return listExercises() }).then(value => {
      if (active) { setExercises(value); setLoading(false) }
    }).catch(() => { if (active) { setError('Could not load the exercise library. Reopen the app to retry.'); setLoading(false) } })
    return () => { active = false }
  }, [])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || lock.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])
  async function save(input: ExerciseInput) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true; setBusy(true); updateSafety.setBusy(true); setError('')
    try {
      const exercise = await createCustomExercise(input)
      setExercises(current => [...current, exercise]); setSelected(exercise); setCreating(false); setDirty(false)
      setMessage('Exercise saved on this device.')
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save the exercise. Please retry.') }
    finally { lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  const results = filterExercises(exercises, filters)
  const muscleIds = [...new Set(exercises.filter(exercise => !exercise.archived).flatMap(exercise => [...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds]))].sort((a, b) => label(a, MUSCLES).localeCompare(label(b, MUSCLES)))
  const equipmentIds = [...new Set(exercises.filter(exercise => !exercise.archived).flatMap(exercise => exercise.equipmentIds))].sort((a, b) => label(a, EQUIPMENT).localeCompare(label(b, EQUIPMENT)))
  return <section aria-label="Exercise library" className="library-panel">
    {creating ? <CustomExerciseForm disabled={busy || applying} onDirty={setDirty} onSave={save} onCancel={() => {
      if (dirty && !window.confirm('Discard the unsaved custom exercise?')) return
      setCreating(false); setDirty(false); setError('')
    }} /> : selected ? <ExerciseDetail exercise={selected} onBack={() => { setSelected(undefined); setMessage('') }} /> : <>
      <div className="library-heading"><div><p className="eyebrow">MOVEMENT CATALOGUE</p><h2 id="library-heading">Exercise library</h2></div>
        <button disabled={loading || applying} onClick={() => { setCreating(true); setMessage(''); setError('') }}>Create custom exercise</button>
      </div>
      <label htmlFor="exercise-search">Search exercises</label>
      <input id="exercise-search" type="search" placeholder="Name, muscle, equipment or category" value={filters.query} onChange={event => setFilters({ ...filters, query: event.target.value })} />
      <div className="filter-grid">
        <div><label htmlFor="muscle-filter">Muscle group</label><select id="muscle-filter" value={filters.muscle} onChange={event => setFilters({ ...filters, muscle: event.target.value })}><option value="">All muscles</option>{muscleIds.map(id => <option key={id} value={id}>{label(id, MUSCLES)}</option>)}</select></div>
        <div><label htmlFor="equipment-filter">Equipment</label><select id="equipment-filter" value={filters.equipment} onChange={event => setFilters({ ...filters, equipment: event.target.value })}><option value="">All equipment</option>{equipmentIds.map(id => <option key={id} value={id}>{label(id, EQUIPMENT)}</option>)}</select></div>
        <div><label htmlFor="source-filter">Source</label><select id="source-filter" value={filters.origin} onChange={event => setFilters({ ...filters, origin: event.target.value as ExerciseFilters['origin'] })}><option value="all">All exercises</option><option value="bundled">Built-in library</option><option value="custom">My exercises</option></select></div>
      </div>
      <p role="status">{loading ? 'Loading exercises…' : `${results.length} exercise${results.length === 1 ? '' : 's'}`}</p>
      {!loading && results.length === 0 && <p>No matching exercises. Try another search or create your own.</p>}
      <ul className="exercise-list">{results.map(exercise => <li key={exercise.id}><button className="exercise-row" disabled={applying} onClick={() => { setSelected(exercise); setMessage('') }}>
        <span className="exercise-row-top"><strong>{exercise.name}</strong><span className="badge">{exercise.origin === 'custom' ? 'Custom' : 'Built-in'}</span></span>
        <span>{exercise.primaryMuscleGroupIds.map(id => label(id, MUSCLES)).join(', ') || 'No primary muscles specified'}</span>
        <span className="note">{trackingLabel(exercise.tracking)}</span>
      </button></li>)}</ul>
    </>}
    {busy && <p role="status">Saving exercise…</p>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className="error">{error}</p>}
  </section>
}
