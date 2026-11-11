import { useEffect, useId, useRef, useState } from 'react'
import { ExerciseBrowser } from '../exercises/ExerciseBrowser'
import type { ExerciseFilters } from '../../data/repositories/exercises'
import type { Exercise, Mass, StrengthTarget, Tracking } from '../../domain/strength/models'
import { matchesRoutineTracking, type Routine, type RoutineExercise } from '../../domain/strength/routines'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { SET_TYPES } from '../../domain/strength/setTypes'

type PlannedSet = RoutineExercise['sets'][number]
type SetDraft = { id: string; set: PlannedSet; min: string; max: string; weight: string; unit: Mass['unit'] }
type ExerciseDraft = Omit<RoutineExercise, 'sets'> & { sets: SetDraft[] }
export type SavedRoutine = Routine & { exercises: RoutineExercise[] }

function setDraft(tracking: Tracking, set: PlannedSet = { setType: 'normal', target: null }): SetDraft {
  const target = set.target
  const range = tracking.measurement === 'reps' ? target?.reps : target?.durationSeconds
  const load = target?.load
  const mass = load?.mode === 'external' ? load.weight : load?.mode === 'added' ? load.addedWeight : load?.mode === 'assisted' ? load.assistance : null
  return { id: crypto.randomUUID(), set, min: range ? String(range.min) : '', max: range && range.min !== range.max ? String(range.max) : '', weight: mass ? String(mass.value) : '', unit: mass?.unit ?? 'kg' }
}

function numeric(value: string) {
  if (!/^\d+(?:[.,]\d+)?$/.test(value.trim())) throw new Error('Enter targets as numbers.')
  return Number(value.replace(',', '.'))
}

function plannedSet(row: SetDraft, tracking: Tracking): PlannedSet {
  if (row.max.trim() && !row.min.trim()) throw new Error('Enter a minimum before adding a maximum.')
  const min = row.min.trim() ? numeric(row.min) : null
  const range = min === null ? null : { min, max: row.max.trim() ? numeric(row.max) : min }
  const mass = row.weight.trim() ? { value: numeric(row.weight), unit: row.unit } : null
  let load = row.set.target?.load ?? null
  if (tracking.load === 'external') load = mass && { mode: 'external', weight: mass }
  if (tracking.load === 'added') load = mass && { mode: 'added', addedWeight: mass, bodyweight: load?.mode === 'added' ? load.bodyweight : null }
  if (tracking.load === 'assisted') load = mass && { mode: 'assisted', assistance: mass, bodyweight: load?.mode === 'assisted' ? load.bodyweight : null }
  const target: StrengthTarget = {
    reps: tracking.measurement === 'reps' ? range : null,
    durationSeconds: tracking.measurement === 'duration' ? range : row.set.target?.durationSeconds ?? null,
    load, rpe: row.set.target?.rpe ?? null, rir: row.set.target?.rir ?? null,
  }
  return { setType: row.set.setType, target: Object.values(target).some(value => value !== null) ? target : null }
}

export function RoutineEditor({ routine, library, disabled, onDirty, onSave, onCancel }: {
  routine: SavedRoutine | null; library: Exercise[]; disabled: boolean
  onDirty: () => void
  onSave: (input: Pick<Routine, 'title' | 'notes'> & { id?: string }, exercises: RoutineExercise[]) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(routine?.title ?? '')
  const [notes, setNotes] = useState(routine?.notes ?? '')
  const [exercises, setExercises] = useState<ExerciseDraft[]>(() => routine?.exercises.map(row => ({
    ...row, sets: row.sets.map(set => setDraft(row.tracking, set)),
  })) ?? [])
  const [picker, setPicker] = useState(false)
  const [filters, setFilters] = useState<ExerciseFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [error, setError] = useState('')
  const pickerId = useId()
  const addButton = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)
  const addedHeading = useRef<HTMLHeadingElement>(null)
  const [addedId, setAddedId] = useState<string>()
  useEffect(() => {
    if (!picker && addedId) {
      addedHeading.current?.focus()
      setAddedId(undefined)
    } else if (!picker && returnFocus.current) {
      returnFocus.current = false
      addButton.current?.focus()
    }
  }, [picker, addedId])

  function changeExercises(rows: ExerciseDraft[]) {
    onDirty()
    setExercises(rows)
  }
  function changeSets(id: string, sets: SetDraft[]) {
    changeExercises(exercises.map(row => row.id === id ? { ...row, sets } : row))
  }
  function move(index: number, direction: number) {
    const rows = [...exercises]
    const [row] = rows.splice(index, 1)
    rows.splice(index + direction, 0, row)
    changeExercises(rows)
  }
  function closePicker() {
    returnFocus.current = true
    setPicker(false)
  }

  return <section aria-label="Routine editor">
    <h2>{routine ? 'Edit routine' : 'New routine'}</h2>
    <div className="form-fields">
      <label>Routine name<input autoFocus required maxLength={200} value={title} disabled={disabled} onChange={event => { onDirty(); setTitle(event.target.value) }} /></label>
      <label>Workout notes (optional)<textarea maxLength={10000} value={notes} disabled={disabled} onChange={event => { onDirty(); setNotes(event.target.value) }} /></label>
    </div>
    {exercises.map((row, index) => {
      const source = library.find(exercise => exercise.id === row.exerciseId)
      const name = source ? exerciseDisplayName(source) : 'Missing exercise'
      const available = matchesRoutineTracking(row, source)
      const timed = row.tracking.measurement === 'duration'
      const load = row.tracking.load
      const weightLabel = load === 'assisted' ? 'Assistance target' : load === 'added' ? 'Added weight target' : 'Weight target'
      return <section className="routine-card" key={row.id} aria-label={`${index + 1}. ${name}`}>
        <h3 tabIndex={-1} ref={row.id === addedId ? addedHeading : undefined}>{index + 1}. {name}</h3>
        {!available && <p role="status">Remove and re-add this exercise, or choose a replacement, before starting.</p>}
        <div className="actions">
          <button className="secondary" disabled={disabled || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${name} up`}>Move up</button>
          <button className="secondary" disabled={disabled || index === exercises.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${name} down`}>Move down</button>
          <button className="secondary" disabled={disabled} onClick={() => changeExercises(exercises.filter(item => item.id !== row.id))} aria-label={`Remove ${name}`}>Remove exercise</button>
        </div>
        {row.sets.map((set, setIndex) => {
          const change = (fields: Partial<SetDraft>) => changeSets(row.id, row.sets.map(item => item.id === set.id ? { ...item, ...fields } : item))
          return <fieldset className="routine-set" key={set.id} disabled={disabled}>
            <legend>Set {setIndex + 1}</legend>
            <label>Set type<select className={`set-type-colour set-type--${set.set.setType}`} value={set.set.setType}
              onChange={event => change({ set: { ...set.set, setType: event.target.value as PlannedSet['setType'] } })}>
              {Object.entries(SET_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select></label>
            <div className="routine-fields">
              <label>{timed ? 'Target seconds' : 'Target reps'}<input inputMode={timed ? 'decimal' : 'numeric'} maxLength={24} value={set.min} onChange={event => change({ min: event.target.value })} /></label>
              <label>{timed ? 'Max seconds (optional)' : 'Max reps (optional)'}<input inputMode={timed ? 'decimal' : 'numeric'} maxLength={24} value={set.max} onChange={event => change({ max: event.target.value })} /></label>
            </div>
            {['external', 'added', 'assisted'].includes(load) && <div className="routine-fields">
              <label>{weightLabel}<input inputMode="decimal" maxLength={24} value={set.weight} onChange={event => change({ weight: event.target.value })} /></label>
              <label>Unit<select value={set.unit} onChange={event => change({ unit: event.target.value as Mass['unit'] })}><option value="kg">kg</option><option value="lb">lb</option></select></label>
            </div>}
            <button className="secondary" disabled={row.sets.length === 1} onClick={() => changeSets(row.id, row.sets.filter(item => item.id !== set.id))}>Remove set {setIndex + 1}</button>
          </fieldset>
        })}
        <button className="add-set" disabled={disabled || row.sets.length >= 100} onClick={() => {
          const last = row.sets.at(-1)!
          changeSets(row.id, [...row.sets, { ...last, id: crypto.randomUUID() }])
        }}>+ Add set<span className="sr-only"> to {name}</span></button>
      </section>
    })}
    <div className="actions">
      <button ref={addButton} disabled={disabled} aria-expanded={picker} aria-controls={picker ? pickerId : undefined} onClick={() => picker ? closePicker() : setPicker(true)}>{picker ? 'Close exercise picker' : '+ Add exercise'}</button>
      <button disabled={disabled || !exercises.length} onClick={() => {
        setError('')
        try {
          onSave({ id: routine?.id, title, notes }, exercises.map(row => ({
            ...row, sets: row.sets.map(set => plannedSet(set, row.tracking)),
          })))
        } catch (error) { setError(error instanceof Error ? error.message : 'Check your targets.') }
      }}>Save routine</button>
      <button className="secondary" disabled={disabled} onClick={onCancel}>Cancel</button>
    </div>
    {error && <p role="alert" className="error">{error}</p>}
    {picker && <section className="exercise-picker" id={pickerId} aria-label="Add a library exercise">
      <ExerciseBrowser picker exercises={library} filters={filters} onFiltersChange={setFilters}
        filtersOpen={filtersOpen} onFiltersOpenChange={setFiltersOpen} disabled={disabled}
        onSelect={exercise => {
          const id = crypto.randomUUID()
          changeExercises([...exercises, {
            id, routineId: routine?.id ?? '', exerciseId: exercise.id,
            tracking: exercise.tracking, position: exercises.length, sets: [setDraft(exercise.tracking)],
          }])
          setAddedId(id)
          setPicker(false)
        }} />
    </section>}
  </section>
}
