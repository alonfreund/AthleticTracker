import { workoutElapsedMs } from '../../domain/strength/workoutTiming'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { readWorkoutRecapRecords } from '../../data/repositories/analytics'
import type { Workout } from '../../data/repositories/workouts'
import { isWorkingSet } from '../../domain/strength/analytics'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import type { WorkoutRecapRecord } from '../../domain/strength/workoutRecap'
import type { WeightUnit } from '../../domain/strength/models'
import { metricLabel, metricValueText } from '../analytics/metricText'

export function WorkoutRecap({ workout, onDone, onView, modal = false, disabled, saveError, onDirty, onSaveDuration, onSaveAsRoutine, message }: {
  workout: Workout
  onDone: () => void
  onView: () => void
  onSaveAsRoutine?: () => void
  message?: string
  modal?: boolean
  disabled?: boolean
  saveError?: string
  onDirty?: (dirty: boolean) => void
  onSaveDuration?: (seconds: number) => Promise<boolean | undefined>
}) {
  const session = workout.sessions[0]
  const [records, setRecords] = useState<WorkoutRecapRecord[]>()
  const [error, setError] = useState(false)
  const [unit, setUnit] = useState<WeightUnit>('kg')
  const heading = useRef<HTMLHeadingElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const elapsed = Math.floor(workoutElapsedMs(session) / 1000)
  const [draft, setDraft] = useState<{ minutes: string; seconds: string }>()
  const [durationError, setDurationError] = useState('')
  const dirty = !!draft && (draft.minutes !== String(Math.floor(elapsed / 60)) || draft.seconds !== String(elapsed % 60))
  function closeEditor() { setDraft(undefined); setDurationError(''); onDirty?.(false) }
  function dismiss(action: () => void) {
    if (disabled || (dirty && !window.confirm('Discard unsaved duration changes?'))) return
    closeEditor()
    action()
  }
  const workingSets = workout.strengthSets.filter(isWorkingSet).length
  useEffect(() => {
    if (modal && dialog.current && !dialog.current.open) dialog.current.showModal()
    heading.current?.focus()
    let mounted = true
    void readWorkoutRecapRecords(workout).then(
      rows => { if (mounted) setRecords(rows) },
      () => { if (mounted) setError(true) },
    )
    return () => { mounted = false }
  }, [workout, modal])

  const summary = <section className="surface-card workout-recap" aria-labelledby="workout-recap-heading">
    <h2 id="workout-recap-heading" tabIndex={-1} ref={heading}>Workout recap</h2>
    <p><strong>{session.title}</strong></p>
    <dl className="monthly-totals">
      <div><dt>Session time</dt><dd>{Math.floor(elapsed / 60)} min {elapsed % 60} sec</dd></div>
      <div><dt>Working sets</dt><dd>{workingSets}</dd></div>
    </dl>
    {onSaveDuration && (draft ? <form onSubmit={async event => {
      event.preventDefault()
      if (disabled) return
      const duration = Number(draft.minutes) * 60 + Number(draft.seconds)
      if (!/^\d+$/.test(draft.minutes) || !/^\d+$/.test(draft.seconds) || Number(draft.seconds) >= 60 || !Number.isSafeInteger(duration * 1000)) {
        setDurationError('Enter whole minutes and seconds from 0 to 59.')
        return
      }
      setDurationError('')
      if (!dirty || await onSaveDuration(duration)) closeEditor()
    }}>
      <fieldset className="form-fields" disabled={disabled}>
        <legend>Edit duration</legend>
        <div className="duration-fields">
          <label>Minutes<input inputMode="numeric" required value={draft.minutes} onChange={event => {
            setDraft({ ...draft, minutes: event.target.value }); onDirty?.(true)
          }} /></label>
          <label>Seconds<input inputMode="numeric" required value={draft.seconds} onChange={event => {
            setDraft({ ...draft, seconds: event.target.value }); onDirty?.(true)
          }} /></label>
        </div>
        <div className="actions">
          <Button type="submit">Save duration</Button>
          <Button variant="secondary" onClick={() => dismiss(() => {})}>Cancel</Button>
        </div>
      </fieldset>
      {(durationError || saveError) && <p role="alert" className="error">{durationError || saveError}</p>}
    </form> : <Button variant="secondary" disabled={disabled} onClick={() => {
      setDraft({ minutes: String(Math.floor(elapsed / 60)), seconds: String(elapsed % 60) })
    }}>Edit duration</Button>)}
    <div className="actions">
      <Button disabled={disabled} onClick={() => dismiss(onDone)}>Done</Button>
      <Button variant="secondary" disabled={disabled} onClick={() => dismiss(onView)}>View workout</Button>
      {onSaveAsRoutine && <Button variant="secondary" disabled={disabled} onClick={() => dismiss(onSaveAsRoutine)}>Save as routine</Button>}
    </div>
    {message && <p role="status">{message}</p>}
    <h3 className="recap-record-heading">Personal records</h3>
    {!records && !error && <p role="status" className="note">Checking for personal records…</p>}
    {error && <p role="status" className="note">Personal records couldn’t be loaded. Your workout is saved.</p>}
    {records?.length === 0 && <p className="note">No new personal records this workout.</p>}
    {records?.some(({ metric }) => metric !== 'reps' && metric !== 'hold') && <label>Weight unit<select value={unit}
      onChange={event => setUnit(event.target.value as WeightUnit)}><option value="kg">kg</option><option value="lb">lb</option></select></label>}
    {!!records?.length && <ul className="recap-records">
      {records.map(({ exerciseKey, snapshot, metric, previous, current }) => <li key={`${exerciseKey}:${metric}`}>
        <Icon name="medal" />
        <div><strong>{exerciseDisplayName(snapshot)}</strong><span>{metricLabel(metric, snapshot)}</span>
          <span>{metricValueText(previous, metric, unit, snapshot)} <span aria-hidden="true">→</span><span className="sr-only"> to </span> {metricValueText(current, metric, unit, snapshot)}</span>
        </div>
      </li>)}
    </ul>}
  </section>
  return modal ? <dialog ref={dialog} className="workout-recap-dialog" aria-labelledby="workout-recap-heading"
    onCancel={event => { event.preventDefault(); dismiss(onDone) }}>{summary}</dialog> : summary
}
