import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import { createCustomExercise, initializeExerciseLibrary, listExercises, type ExerciseFilters, type ExerciseInput } from '../../data/repositories/exercises'
import type { Exercise } from '../../domain/strength/models'
import { ExerciseBrowser } from './ExerciseBrowser'
import { CustomExerciseForm } from './CustomExerciseForm'
import { ExerciseDetail } from './ExerciseDetail'

export function ExerciseLibrary({ onExerciseAnalytics }: { onExerciseAnalytics?: (exercise: Exercise) => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [creating, setCreating] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [selected, setSelected] = useState<Exercise>()
  const [filters, setFilters] = useState<ExerciseFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
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
  return <section aria-label="Exercise library" className="library-panel">
    {creating ? <CustomExerciseForm disabled={busy || applying} onDirty={setDirty} onSave={save} onCancel={() => {
      if (dirty && !window.confirm('Discard the unsaved custom exercise?')) return
      setCreating(false); setDirty(false); setError('')
    }} /> : selected ? <ExerciseDetail exercise={selected} onAnalytics={onExerciseAnalytics ? () => onExerciseAnalytics(selected) : undefined} onBack={() => { setSelected(undefined); setMessage('') }} /> : <>
      <div className="library-heading"><div><p className="eyebrow">MOVEMENT CATALOGUE</p><h2 id="library-heading">Exercise library</h2></div>
        <button disabled={loading || applying} onClick={() => { setCreating(true); setMessage(''); setError('') }}>Create custom exercise</button>
      </div>
      <ExerciseBrowser exercises={exercises} filters={filters} onFiltersChange={setFilters}
        filtersOpen={filtersOpen} onFiltersOpenChange={setFiltersOpen} loading={loading} disabled={applying}
        onSelect={exercise => { setSelected(exercise); setMessage('') }} />
    </>}
    {busy && <p role="status">Saving exercise…</p>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className="error">{error}</p>}
  </section>
}
