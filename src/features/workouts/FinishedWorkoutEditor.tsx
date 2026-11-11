import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import type { FinishedSetEdit, FinishedWorkoutEdit, Workout } from '../../data/repositories/workouts'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { emptyLoad, inputFromSet, type SetInput } from '../../domain/strength/logging'
import type { StrengthSet, WeightUnit } from '../../domain/strength/models'
import { SET_TYPES } from '../../domain/strength/setTypes'

type Row = FinishedSetEdit & { key: string }
function localMinute(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function FinishedWorkoutEditor({ workout, disabled, error, onDirty, onCancel, onSave }: {
  workout: Workout; disabled: boolean; error: string; onDirty: (dirty: boolean) => void
  onCancel: () => void; onSave: (edit: FinishedWorkoutEdit) => void
}) {
  const session = workout.sessions[0]
  const originalStart = localMinute(new Date(session.startedAt))
  const [title, setTitle] = useState(session.title)
  const [notes, setNotes] = useState(session.notes)
  const [start, setStart] = useState(originalStart)
  const [dateError, setDateError] = useState('')
  const [originalRows] = useState<Row[]>(() => workout.strengthSets.slice().sort((a, b) => a.position - b.position).map(set => ({
    key: set.id, id: set.id, exerciseId: set.sessionExerciseId, input: inputFromSet(set), setType: set.setType, completed: set.completed,
  })))
  const [rows, setRows] = useState(originalRows)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  const dirty = title !== session.title || notes !== session.notes || start !== originalStart || JSON.stringify(rows) !== JSON.stringify(originalRows)
  useLayoutEffect(() => onDirty(dirty), [dirty, onDirty])
  function change(key: string, edit: (row: Row) => Row) { setRows(current => current.map(row => row.key === key ? edit(row) : row)) }
  function field(row: Row, key: keyof SetInput['values'], label: string, integer = false) {
    return <label>{label}<input type="text" inputMode={integer ? 'numeric' : 'decimal'} maxLength={128} value={row.input.values[key]}
      onChange={event => { const value = event.target.value.replace(',', '.'); change(row.key, item => ({ ...item, input: { ...item.input, values: { ...item.input.values, [key]: value } } })) }} /></label>
  }
  return <form aria-labelledby="finished-edit-heading" className="workout-history" onSubmit={event => {
    event.preventDefault()
    const local = new Date(start)
    if (start !== originalStart && (!Number.isFinite(local.getTime()) || localMinute(local) !== start)) {
      setDateError('Choose a valid local workout date and time.'); return
    }
    setDateError('')
    const original = new Map(originalRows.map(row => [row.key, row]))
    const kept = new Set(rows.map(row => row.key))
    onSave({ title, notes, startedAt: start === originalStart ? session.startedAt : local.toISOString(),
      sets: rows.filter(row => JSON.stringify(row) !== JSON.stringify(original.get(row.key))).map(({ id, exerciseId, input, setType, completed }) => ({ id, exerciseId, input, setType, completed })),
      removedSetIds: originalRows.filter(row => !kept.has(row.key)).map(row => row.key) })
  }}>
    <h2 id="finished-edit-heading" ref={heading} tabIndex={-1}>Edit finished workout</h2>
    <p className="note">Changes apply when you save. Changing the start time keeps the original workout duration.</p>
    <fieldset className="form-fields" disabled={disabled}>
      <label>Workout name<input required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} /></label>
      <label>Start date and time<input required type="datetime-local" value={start} onChange={event => { setStart(event.target.value); setDateError('') }} /></label>
      {dateError && <p role="alert" className="error">{dateError}</p>}
      <label>Workout notes<textarea maxLength={10000} value={notes} onChange={event => setNotes(event.target.value)} /></label>
      {workout.sessionExercises.map(exercise => {
        const { tracking } = exercise.snapshot
        const hasMass = tracking.load !== 'none'
        const loadLabel = tracking.load === 'added' ? 'Added weight' : tracking.load === 'assisted' ? 'Assistance' : 'Weight'
        const name = exerciseDisplayName(exercise.snapshot)
        return <section className="workout-exercise" key={exercise.id}>
          <h3>{name}</h3>
          {rows.filter(row => row.exerciseId === exercise.id).map((row, index) => {
            const originalSet = workout.strengthSets.find(set => set.id === row.id)
            return <fieldset className="choices" key={row.key}>
              <legend>Set {index + 1}{originalSet?.supersetRoundIndex !== undefined && ` · Superset round ${originalSet.supersetRoundIndex + 1}`}</legend>
              <div className="finished-set-fields">
                <label>Set type<select value={row.setType} onChange={event => { const setType = event.target.value as StrengthSet['setType']; change(row.key, item => ({ ...item, setType })) }}>
                  {Object.entries(SET_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></label>
                {hasMass && <label>Weight unit<select value={row.input.weightUnit} onChange={event => { const weightUnit = event.target.value as WeightUnit; change(row.key, item => ({ ...item, input: { ...item.input, weightUnit } })) }}><option value="kg">kg</option><option value="lb">lb</option></select></label>}
                {hasMass && tracking.load !== 'bodyweight' && field(row, 'weight', loadLabel)}
                {hasMass && tracking.load !== 'external' && field(row, 'bodyweight', 'Bodyweight (optional)')}
                {tracking.measurement === 'reps' && field(row, 'reps', 'Reps', true)}
                {field(row, 'durationSeconds', tracking.measurement === 'reps' ? 'Seconds (optional)' : 'Seconds')}
              </div>
              <details><summary>Effort (optional)</summary><div className="finished-set-fields">{field(row, 'rpe', 'RPE')}{field(row, 'rir', 'RIR', true)}</div></details>
              <label className="finished-set-complete"><input type="checkbox" checked={row.completed} onChange={event => { const completed = event.target.checked; change(row.key, item => ({ ...item, completed })) }} /> Completed set</label>
              <Button variant="secondary" aria-label={`Remove set ${index + 1} from ${name}`} onClick={() => { setRows(current => current.filter(item => item.key !== row.key)) }}>Remove set</Button>
            </fieldset>
          })}
          <Button variant="secondary" aria-label={`Add set to ${name}`} onClick={() => {
            const input = inputFromSet({ load: emptyLoad(tracking.load), reps: null, durationSeconds: null, rpe: null, rir: null })
            const previous = rows.filter(row => row.exerciseId === exercise.id).at(-1)
            if (previous) input.weightUnit = previous.input.weightUnit
            setRows(current => [...current, { key: crypto.randomUUID(), exerciseId: exercise.id, input, setType: 'normal', completed: true }])
          }}>Add set</Button>
        </section>
      })}
      {error && <p role="alert" className="error">{error}</p>}
      <div className="actions">
        <Button type="submit" disabled={!dirty}>Save changes</Button>
        <Button variant="secondary" onClick={() => { if (!dirty || window.confirm('Discard unsaved workout changes?')) onCancel() }}>Cancel editing</Button>
      </div>
    </fieldset>
  </form>
}
