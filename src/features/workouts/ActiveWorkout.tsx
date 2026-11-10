import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import { filterExercises } from '../../data/repositories/exercises'
import { addSet, addWorkoutExercise, cancelWorkout, changeSetType, controlRest, discardSetDraft, finishWorkout, loadWorkout, moveWorkoutItem, previousPerformance, removeSet, removeWorkoutExercise, saveInlineSet, saveWorkoutDetails, setExerciseRest, saveExerciseRest, reorderExercises, replaceCurrentRest, timerSeconds, type PreviousExercise, type Workout } from '../../data/repositories/workouts'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableExercise } from './SortableExercise'
import { DurationEditor } from '../../components/DurationEditor'
import { inputFromSet } from '../../domain/strength/logging'
import type { Exercise } from '../../domain/strength/models'
import { CONVENTION_LABELS } from '../../domain/strength/catalog'
import { useAutosave } from './useAutosave'
import { durationText } from './WorkoutHistory'
import { InlineSetStore } from './InlineSetStore'
import { InlineSetRow } from './InlineSetRow'

function time(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
export function ActiveWorkout({ initial, library, onBack }: { initial: Workout; library: Exercise[]; onBack: () => void }) {
  const id = initial.sessions[0].id
  const [workout, setWorkout] = useState(initial)
  const [previous, setPrevious] = useState<Record<string, PreviousExercise>>({})
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [error, setError] = useState('')
  const [picker, setPicker] = useState(false)
  const [query, setQuery] = useState('')
  const [review, setReview] = useState<'finish' | 'cancel'>()
  const [removal, setRemoval] = useState<{ kind: 'exercise' | 'set'; id: string }>()
  const [dragging, setDragging] = useState<string>()
  const [restDrafts, setRestDrafts] = useState<Record<string, boolean>>({})
  const [timerEditor, setTimerEditor] = useState<number>()
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const reportRest = (key: string, dirty: boolean) => setRestDrafts(current => current[key] === dirty ? current : { ...current, [key]: dirty })
  const [now, setNow] = useState(Date.now())
  const mounted = useRef(true)
  const refreshRef = useRef<() => Promise<void>>(async () => {})
  const [store] = useState(() => new InlineSetStore(initial, async (setId, input, complete) => {
    const result = await saveInlineSet(id, setId, input, complete)
    await refreshRef.current()
    return result
  }))
  const rows = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  const details = useAutosave({ title: initial.sessions[0].title, notes: initial.sessions[0].notes }, value => saveWorkoutDetails(id, value.title, value.notes))
  const detailsRef = useRef(details); detailsRef.current = details
  const completing = useRef(new Set<string>())
  const dirty = details.dirty || rows.dirty || Object.values(restDrafts).some(Boolean)
  const saving = busy || details.saving || rows.saving || !!dragging
  useLayoutEffect(() => { updateSafety.setSafety({ dirty, busy: saving, restoring: false, loading: false }) }, [dirty, saving])
  refreshRef.current = async () => { const value = await loadWorkout(id); if (mounted.current) { store.sync(value); setWorkout(value); setNow(Date.now()) } }
  useEffect(() => {
    mounted.current = true
    const hidden = () => { if (document.visibilityState === 'hidden') void store.flush().catch(() => {}) }
    const guard = (event: BeforeUnloadEvent) => { const status = store.getSnapshot(); if (status.dirty || status.saving || lock.current || updateSafety.getSnapshot().dirty || detailsRef.current.dirty || detailsRef.current.saving) event.preventDefault() }
    document.addEventListener('visibilitychange', hidden); window.addEventListener('beforeunload', guard)
    return () => { mounted.current = false; store.dispose(); document.removeEventListener('visibilitychange', hidden); window.removeEventListener('beforeunload', guard) }
  }, [store])
  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(interval) }, [])
  const exerciseIds = workout.sessionExercises.map(row => row.id).join(',')
  useEffect(() => { let active = true; void previousPerformance(id).then(value => { if (active) setPrevious(value) }).catch(() => { if (active) setError('Previous performance could not be loaded. Current logging is still available.') }); return () => { active = false } }, [id, exerciseIds])
  async function run(action: () => Promise<unknown>, after?: () => void) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true; updateSafety.setBusy(true); setBusy(true); setError('')
    try { await store.flush(); await details.flush(); await action(); await refreshRef.current(); after?.() }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not save workout.'); await refreshRef.current().catch(() => {}) }
    finally { lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  const invoke = (action: () => Promise<unknown>, after?: () => void) => { void run(action, after) }
  const blocked = busy || applying || !!dragging
  async function saveRest(action: () => Promise<unknown>) {
    let saved = false
    await run(async () => { await action(); saved = true })
    if (!saved) throw new Error('Could not save rest settings. Please retry.')
  }
  function drop(event: DragEndEvent) {
    setDragging(undefined)
    if (!event.over || event.active.id === event.over.id) return
    const ids = workout.sessionExercises.map(row => row.id)
    const next = arrayMove(ids, ids.indexOf(String(event.active.id)), ids.indexOf(String(event.over.id)))
    // Keep IDs stable so inline input state and focus stay with their exercise.
    setWorkout(current => ({ ...current, sessionExercises: next.map(id => current.sessionExercises.find(row => row.id === id)!) }))
    invoke(() => reorderExercises(id, next))
  }
  const completed = workout.strengthSets.filter(set => set.completed).length
  const incomplete = workout.strengthSets.length - completed
  const timer = workout.restTimers[0]
  const remaining = timer ? timerSeconds(timer, now) : 0
  const showTimer = timer && ['running', 'paused'].includes(timer.status)
  return <section aria-label="Active workout" className={`active-workout inline-workout ${showTimer ? 'has-rest-timer' : ''}`}>
    <div className="workout-title"><p className="eyebrow">ACTIVE WORKOUT</p><strong>{durationText(workout.sessions[0].startedAt, new Date(now).toISOString())} elapsed</strong></div>
    <label className="sr-only" htmlFor="workout-title">Workout name</label><input className="workout-name" id="workout-title" maxLength={200} value={details.value.title} disabled={blocked} onChange={event => details.change({ ...details.value, title: event.target.value })} onBlur={() => void details.flush().catch(() => {})} />
    <details className="workout-notes"><summary>Workout notes{details.value.notes ? ' · added' : ''}</summary><label className="sr-only" htmlFor="workout-notes">Workout notes</label><textarea id="workout-notes" maxLength={10000} value={details.value.notes} disabled={blocked} onChange={event => details.change({ ...details.value, notes: event.target.value })} /></details>
    <div className="workout-save-line"><span>{completed} completed · {incomplete} incomplete</span><span role="status">{saving ? 'Saving…' : dirty ? 'Changes not saved yet' : Object.values(rows.rows).some(row => row.pending) ? 'Drafts saved · check pending rows' : 'Saved on this device'}</span></div>
    {details.error && <p role="alert" className="error">{details.error}<button onClick={() => void details.flush().catch(() => {})}>Retry</button></p>}
    {!workout.sessionExercises.length && <p>Add an exercise to begin. Your empty workout is already saved.</p>}
    <p id="exercise-drag-instructions" className="note drag-instructions">Hold ⠿ to reorder exercises. Scroll anywhere else.<span className="sr-only"> Keyboard: Space, arrow keys, Space to drop; Escape to cancel.</span></p>
    <DndContext accessibility={{ announcements: {
      onDragStart: ({ active }) => `Picked up ${workout.sessionExercises.find(row => row.id === active.id)?.snapshot.name ?? 'exercise'}.`,
      onDragOver: ({ over }) => over ? `Over ${workout.sessionExercises.find(row => row.id === over.id)?.snapshot.name ?? 'exercise'}.` : 'Outside exercise list.',
      onDragEnd: () => 'Dropped exercise. Saving order.', onDragCancel: () => 'Reordering cancelled. Order unchanged.',
    } }} sensors={sensors} collisionDetection={closestCenter} onDragStart={event => { setDragging(String(event.active.id)); updateSafety.setBusy(true) }} onDragEnd={drop} onDragCancel={() => setDragging(undefined)}>
    <SortableContext items={workout.sessionExercises.map(row => row.id)} strategy={verticalListSortingStrategy}>
    {workout.sessionExercises.map(exercise => {
      const config = exercise.snapshot.tracking
      const sets = workout.strengthSets.filter(set => set.sessionExerciseId === exercise.id).sort((a, b) => a.position - b.position)
      const prior = previous[exercise.id]
      const rest = exercise.restSeconds ?? exercise.snapshot.defaultRestSeconds
      const units = new Set(sets.map(set => rows.rows[set.id]?.input.weightUnit ?? 'kg'))
      const weightLabel = config.load === 'added' ? 'Added' : config.load === 'assisted' ? 'Assist' : config.load === 'bodyweight' ? 'BW' : config.load === 'none' ? 'Load' : units.size > 1 ? 'Weight' : [...units][0].toUpperCase()
      return <SortableExercise key={exercise.id} id={exercise.id} name={exercise.snapshot.name} disabled={busy || applying || rows.saving || details.saving || Object.values(restDrafts).some(Boolean)}>
        <div className="exercise-card-heading"><h3>{exercise.snapshot.name}</h3><details className="exercise-menu"><summary aria-label={`${exercise.snapshot.name}, exercise options`}>⋯</summary><div className="actions"><button className="secondary" disabled={blocked} onClick={() => setRemoval({ kind: 'exercise', id: exercise.id })}>Remove exercise</button></div></details></div>
        <div className="exercise-card-subtitle"><span>{config.load === 'assisted' ? 'Assistance' : config.load === 'added' ? 'Added weight' : config.load === 'bodyweight' ? 'Bodyweight' : config.weightConvention ? CONVENTION_LABELS[config.weightConvention] : 'Timed hold'}{config.load !== 'none' && ` · ${units.size > 1 ? 'units per row' : [...units][0]}`}</span><details className="rest-preference"><summary>Rest {rest ? time(rest) : 'off'}</summary><div className="rest-preference__editor"><p><strong>Saved exercise preference</strong></p><p className="note">Applies to this workout and future workouts. Does not change a countdown already running.</p><DurationEditor seconds={rest ?? 0} label={`${exercise.snapshot.name}, saved rest`} saveLabel={exercise.sourceExerciseId ? 'Save exercise default' : 'Save for this workout'} disabled={blocked} onDirty={value => reportRest(exercise.id, value)} onSave={seconds => saveRest(() => exercise.sourceExerciseId ? saveExerciseRest(id, exercise.id, seconds) : setExerciseRest(id, exercise.id, seconds))} onUseGlobal={exercise.sourceExerciseId ? () => saveRest(() => saveExerciseRest(id, exercise.id, null)) : undefined} /></div></details></div>
        {exercise.notes && <p className="note multiline">{exercise.notes}</p>}
        {prior && <p className="previous-date">Previous: {new Date(prior.date).toLocaleDateString()}</p>}
        <div className="inline-set__head" aria-hidden="true"><span>Set</span><span>Previous</span><span>{weightLabel}</span><span>{config.measurement === 'reps' ? 'Reps' : 'Secs'}</span><span>✓</span></div>
        {sets.map((set, index) => {
          const row = rows.rows[set.id]
          if (!row) return null
          const ordinal = sets.slice(0, index).filter(value => value.setType === set.setType).length
          const last = prior?.sets.filter(value => value.setType === set.setType)[ordinal]
          return <InlineSetRow key={set.id} exercise={exercise} set={set} row={row} index={index} last={index === sets.length - 1} previous={last} disabled={blocked}
            onChange={input => { if (!lock.current && !updateSafety.getSnapshot().applying) store.change(set.id, input) }} onSave={() => { void store.save(set.id).catch(() => {}) }}
            onComplete={() => { if (!lock.current && !completing.current.has(set.id)) { completing.current.add(set.id); void store.save(set.id, !set.completed).catch(() => {}).finally(() => completing.current.delete(set.id)) } }}
            onType={type => invoke(() => changeSetType(id, set.id, type))} onMove={direction => invoke(() => moveWorkoutItem(id, 'set', set.id, direction))} onRemove={() => setRemoval({ kind: 'set', id: set.id })}
            onRevert={() => invoke(async () => { await discardSetDraft(id, set.id); const current = await loadWorkout(id); store.reset(set.id, inputFromSet(current.strengthSets.find(value => value.id === set.id)!)) })} />
        })}
        <button className="add-set" disabled={blocked} onClick={() => invoke(() => addSet(id, exercise.id))}>+ Add set<span className="sr-only"> to {exercise.snapshot.name}</span></button>
      </SortableExercise>
    })}
    </SortableContext><DragOverlay dropAnimation={null}>{dragging && <div className="exercise-drag-overlay"><span aria-hidden="true">⠿</span><strong>{workout.sessionExercises.find(row => row.id === dragging)?.snapshot.name}</strong><span>Drop to save order</span></div>}</DragOverlay>
    </DndContext>
    <div className="actions workout-actions"><button disabled={blocked} onClick={() => { setPicker(!picker); setQuery('') }}>{picker ? 'Close exercise picker' : '+ Add exercise'}</button><button disabled={blocked || completed === 0} onClick={() => { setReview('finish'); setPicker(false) }}>Review and finish</button><button className="secondary" disabled={blocked} onClick={() => invoke(async () => {}, onBack)}>Back — workout stays active</button><button className="secondary" disabled={blocked} onClick={() => setReview('cancel')}>Cancel workout</button></div>
    {picker && <div className="exercise-picker"><h3>Add a library exercise</h3><label htmlFor="workout-exercise-search">Find exercise</label><input id="workout-exercise-search" type="search" value={query} onChange={event => setQuery(event.target.value)} /><ul className="exercise-list">{filterExercises(library, { query }).map(exercise => <li key={exercise.id}><button className="exercise-row" disabled={blocked} onClick={() => invoke(() => addWorkoutExercise(id, exercise.id), () => setPicker(false))}><strong>{exercise.name}</strong></button></li>)}</ul></div>}
    {removal && <div className="review-box" role="alert"><p>Remove this {removal.kind} and its saved values and drafts? This cannot be undone here.</p><div className="actions"><button disabled={blocked} onClick={() => invoke(() => removal.kind === 'exercise' ? removeWorkoutExercise(id, removal.id) : removeSet(id, removal.id), () => setRemoval(undefined))}>Confirm removal</button><button className="secondary" disabled={blocked} onClick={() => setRemoval(undefined)}>Keep it</button></div></div>}
    {review && <div className="review-box" role="alert"><h3>{review === 'finish' ? 'Finish this workout?' : 'Cancel this workout?'}</h3><p>{review === 'finish' ? `${completed} completed sets will count. ${incomplete} incomplete sets stay in history. Pending invalid edits must be corrected or reverted first.` : 'Recorded sets stay in cancelled history. Pending drafts will be discarded.'}</p><div className="actions"><button disabled={blocked} onClick={() => invoke(() => review === 'finish' ? finishWorkout(id, true) : cancelWorkout(id), onBack)}>{review === 'finish' ? 'Finish with completed sets' : 'Confirm cancellation'}</button><button className="secondary" disabled={blocked} onClick={() => setReview(undefined)}>Keep logging</button></div></div>}
    {error && <p role="alert" className="error">{error}</p>}
    {showTimer && <aside className="rest-timer" aria-label="Rest timer"><div className="rest-timer__heading"><strong>{remaining ? `${timer.status === 'paused' ? 'Paused' : 'Rest'} ${time(remaining)}` : 'Rest complete'}</strong><span>{workout.sessionExercises.find(exercise => workout.strengthSets.find(set => set.id === timer.sourceSetId)?.sessionExerciseId === exercise.id)?.snapshot.name}</span></div><p className="rest-timer__scope">Current timer only · saved defaults unchanged</p><div className="rest-timer__controls"><button disabled={blocked || !remaining} aria-label="Subtract 15 seconds" onClick={() => invoke(() => controlRest(id, 'adjust', -15))}>−15s</button><button disabled={blocked || !remaining} onClick={() => invoke(() => controlRest(id, timer.status === 'paused' ? 'resume' : 'pause'))}>{timer.status === 'paused' ? 'Resume' : 'Pause'}</button><button disabled={blocked || !remaining} aria-label="Add 15 seconds" onClick={() => invoke(() => controlRest(id, 'adjust', 15))}>+15s</button><button disabled={blocked} onClick={() => invoke(() => controlRest(id, 'skip'))}>{remaining ? 'Skip' : 'Dismiss'}</button></div><button className="timer-edit-toggle" aria-expanded={timerEditor !== undefined} disabled={blocked} onClick={() => setTimerEditor(timerEditor === undefined ? remaining : undefined)}>{timerEditor === undefined ? 'Set exact remaining time' : 'Close timer adjustment'}</button>{timerEditor !== undefined && <DurationEditor seconds={timerEditor} label="Current timer only" saveLabel="Apply to current timer" disabled={blocked} onDirty={value => reportRest('timer', value)} onSave={seconds => saveRest(async () => { await replaceCurrentRest(id, seconds); setTimerEditor(undefined) })} />}</aside>}
  </section>
}
