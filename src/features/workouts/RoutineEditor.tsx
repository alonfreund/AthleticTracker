import { useEffect, useId, useRef, useState } from 'react'
import { ExerciseBrowser } from '../exercises/ExerciseBrowser'
import type { ExerciseFilters } from '../../data/repositories/exercises'
import type { Exercise, StrengthSet } from '../../domain/strength/models'
import { matchesRoutineTracking, type Routine, type RoutineExercise } from '../../domain/strength/routines'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { groupLetter } from '../../domain/strength/supersets'
import { SET_TYPES } from '../../domain/strength/setTypes'

type SetDraft = { id: string; setType: StrengthSet['setType'] }
type ExerciseDraft = Omit<RoutineExercise, 'sets'> & { sets: SetDraft[] }
export type SavedRoutine = Routine & { exercises: RoutineExercise[] }

function setDraft(setType: StrengthSet['setType'] = 'normal'): SetDraft {
  return { id: crypto.randomUUID(), setType }
}

export function RoutineEditor({ routine, library, disabled, onDirty, onSave, onCancel }: {
  routine: SavedRoutine | null; library: Exercise[]; disabled: boolean
  onDirty: () => void
  onSave: (input: Pick<Routine, 'title' | 'notes' | 'supersets'> & { id?: string }, exercises: RoutineExercise[]) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(routine?.title ?? '')
  const [notes, setNotes] = useState(routine?.notes ?? '')
  const [exercises, setExercises] = useState<ExerciseDraft[]>(() => routine?.exercises.map(row => ({
    ...row, sets: row.sets.map(set => setDraft(set.setType)),
  })) ?? [])
  const [supersets, setSupersets] = useState(routine?.supersets ?? [])
  const [selection, setSelection] = useState<{ group: number; ids: string[] }>()
  const [picker, setPicker] = useState(false)
  const [filters, setFilters] = useState<ExerciseFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
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

  function rowPosition(id: string) { return exercises.findIndex(row => row.id === id) + 1 }
  function changeExercises(rows: ExerciseDraft[]) {
    setSelection(undefined)
    onDirty()
    setExercises(rows)
    const available = new Set(rows.map(row => row.id))
    setSupersets(groups => groups.map(group => group.filter(id => available.has(id))).filter(group => group.length > 1))
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
      const group = supersets.findIndex(members => members.includes(row.id))
      return <section className={`routine-card${group >= 0 ? ' superset-group' : ''}`} key={row.id} aria-label={`${index + 1}. ${name}`}>
        <h3 tabIndex={-1} ref={row.id === addedId ? addedHeading : undefined}>{index + 1}. {name}</h3>
        {group >= 0 && <p className="superset-member-label">Superset {groupLetter(group)}</p>}
        {!available && <p role="status">Remove and re-add this exercise, or choose a replacement, before starting.</p>}
        <div className="actions">
          <button className="secondary" disabled={disabled || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${name} up`}>Move up</button>
          <button className="secondary" disabled={disabled || index === exercises.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${name} down`}>Move down</button>
          <button className="secondary" disabled={disabled} onClick={() => changeExercises(exercises.filter(item => item.id !== row.id))} aria-label={`Remove ${name}`}>Remove exercise</button>
        </div>
        {row.sets.map((set, setIndex) => {
          return <div className="routine-set" key={set.id} role="group" aria-label={`${name}, set ${setIndex + 1}`}>
            <label>Set {setIndex + 1}<select aria-label={`${name}, set ${setIndex + 1} type`}
              className={`set-type-colour set-type--${set.setType}`} value={set.setType} disabled={disabled}
              onChange={event => {
                const setType = event.target.value as StrengthSet['setType']
                changeSets(row.id, row.sets.map(item => item.id === set.id ? { ...item, setType } : item))
              }}>
              {Object.entries(SET_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select></label>
            <button className="secondary" disabled={disabled || row.sets.length === 1}
              aria-label={`Remove ${name}, set ${setIndex + 1}`}
              onClick={() => changeSets(row.id, row.sets.filter(item => item.id !== set.id))}>Remove</button>
          </div>
        })}
        <button className="add-set" disabled={disabled || row.sets.length >= 100} onClick={() => {
          changeSets(row.id, [...row.sets, setDraft()])
        }}>+ Add set<span className="sr-only"> to {name}</span></button>
      </section>
    })}
    {exercises.length >= 2 && <section className="routine-card" aria-label="Routine supersets">
      <h3>Supersets</h3>
      {supersets.map((members, group) => <div className="actions" key={members[0]}>
        <strong>Superset {groupLetter(group)}</strong>
        <button className="secondary" disabled={disabled || !!selection} onClick={() => setSelection({ group, ids: members })}>Edit superset {groupLetter(group)}</button>
        <button className="secondary" disabled={disabled || !!selection} onClick={() => {
          onDirty()
          setSupersets(supersets.filter((_, index) => index !== group))
        }}>Ungroup superset {groupLetter(group)}</button>
      </div>)}
      {selection ? <fieldset disabled={disabled}>
        <legend>{selection.group < 0 ? 'Create superset' : 'Edit superset'}</legend>
        {exercises.map(row => {
          if (supersets.some((members, index) => index !== selection.group && members.includes(row.id))) return null
          const exercise = library.find(item => item.id === row.exerciseId)
          return <label className="superset-choice" key={row.id}>
            <input type="checkbox" checked={selection.ids.includes(row.id)} onChange={event => {
              const ids = event.target.checked ? [...selection.ids, row.id] : selection.ids.filter(id => id !== row.id)
              setSelection({ ...selection, ids })
            }} />
            {rowPosition(row.id)}. {exercise ? exerciseDisplayName(exercise) : 'Missing exercise'}
          </label>
        })}
        <div className="actions">
          <button disabled={selection.ids.length < 2} onClick={() => {
            onDirty()
            setSupersets(selection.group < 0 ? [...supersets, selection.ids] :
              supersets.map((members, index) => index === selection.group ? selection.ids : members))
            setSelection(undefined)
          }}>Save superset</button>
          <button className="secondary" onClick={() => setSelection(undefined)}>Cancel grouping</button>
        </div>
      </fieldset> : <button className="secondary" disabled={disabled || exercises.length - supersets.flat().length < 2}
        onClick={() => setSelection({ group: -1, ids: [] })}>Create superset</button>}
    </section>}
    <div className="actions">
      <button ref={addButton} disabled={disabled} aria-expanded={picker} aria-controls={picker ? pickerId : undefined} onClick={() => picker ? closePicker() : setPicker(true)}>{picker ? 'Close exercise picker' : '+ Add exercise'}</button>
      <button disabled={disabled || !exercises.length || !!selection} onClick={() => onSave({ id: routine?.id, title, notes, supersets }, exercises.map(row => ({
        ...row, sets: row.sets.map(({ setType }) => ({ setType, target: null })),
      })))}>Save routine</button>
      <button className="secondary" disabled={disabled} onClick={onCancel}>Cancel</button>
    </div>
    {picker && <section className="exercise-picker" id={pickerId} aria-label="Add a library exercise">
      <ExerciseBrowser picker exercises={library} filters={filters} onFiltersChange={setFilters}
        filtersOpen={filtersOpen} onFiltersOpenChange={setFiltersOpen} disabled={disabled}
        onSelect={exercise => {
          const id = crypto.randomUUID()
          changeExercises([...exercises, {
            id, routineId: routine?.id ?? '', exerciseId: exercise.id,
            tracking: exercise.tracking, position: exercises.length, sets: [setDraft()],
          }])
          setAddedId(id)
          setPicker(false)
        }} />
    </section>}
  </section>
}
