import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import { initializeExerciseLibrary, listExercises, filterExercises } from '../../data/repositories/exercises'
import { addSet, addWorkoutExercise, cancelWorkout, changeSetType, commitSet, discardSetDraft, finishWorkout, listWorkouts, loadWorkout, moveWorkoutItem, removeSet, removeWorkoutExercise, saveSetDraft, saveWorkoutDetails, startWorkout, type Workout } from '../../data/repositories/workouts'
import { inputFromSet, performanceText, type SetInput } from '../../domain/strength/logging'
import type { Exercise, Session } from '../../domain/strength/models'
import { trackingLabel } from '../../domain/strength/catalog'
import { useAutosave } from './useAutosave'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { SetEditor } from './SetEditor'
import { durationText, WorkoutHistory } from './WorkoutHistory'

function ActiveWorkout({ initial, library, onBack }: { initial: Workout; library: Exercise[]; onBack: () => void }) {
  const id = initial.sessions[0].id
  const [workout, setWorkout] = useState(initial)
  const [editing, setEditing] = useState<string | undefined>(initial.editorDrafts[0]?.setId)
  const [editorStatus, setEditorStatus] = useState({ dirty: false, saving: false })
  const reportEditor = useCallback((value: typeof editorStatus) => setEditorStatus(value), [])
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [picker, setPicker] = useState(false)
  const [query, setQuery] = useState('')
  const [review, setReview] = useState<'finish' | 'cancel' | undefined>()
  const [removal, setRemoval] = useState<{ kind: 'exercise' | 'set'; id: string }>()
  const [now, setNow] = useState(new Date().toISOString())
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  const details = useAutosave({ title: initial.sessions[0].title, notes: initial.sessions[0].notes }, value => saveWorkoutDetails(id, value.title, value.notes))
  const dirty = details.dirty || editorStatus.dirty
  const saving = busy || details.saving || editorStatus.saving
  useLayoutEffect(() => { updateSafety.setSafety({ dirty, busy: saving, restoring: false, loading: false }) }, [dirty, saving])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || saving || lock.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty, saving])
  useEffect(() => { const timer = setInterval(() => setNow(new Date().toISOString()), 15000); return () => clearInterval(timer) }, [])
  async function refresh() { const value = await loadWorkout(id); setWorkout(value); return value }
  async function run(action: () => Promise<unknown>, after?: () => void) {
    if (lock.current || updateSafety.getSnapshot().applying) throw new Error('Wait for the current operation to finish.')
    lock.current = true; updateSafety.setBusy(true); setBusy(true); setError(''); setMessage('')
    try { await action(); await refresh(); after?.() }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not save workout.'); throw error }
    finally { lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  const invoke = (action: () => Promise<unknown>, after?: () => void) => { void run(action, after).catch(() => {}) }
  const blocked = busy || applying || editorStatus.saving
  const structuralBlocked = blocked || !!editing
  const completed = workout.strengthSets.filter(set => set.completed).length
  const incomplete = workout.strengthSets.length - completed
  return <section aria-label="Active workout" className="active-workout">
    <div className="workout-title"><p className="eyebrow">ACTIVE WORKOUT</p><strong>{durationText(workout.sessions[0].startedAt, now)} elapsed</strong></div>
    <label htmlFor="workout-title">Workout name</label>
    <input id="workout-title" maxLength={200} value={details.value.title} disabled={blocked} onChange={event => details.change({ ...details.value, title: event.target.value })} />
    <label htmlFor="workout-notes">Workout notes</label>
    <textarea id="workout-notes" maxLength={10000} value={details.value.notes} disabled={blocked} onChange={event => details.change({ ...details.value, notes: event.target.value })} />
    <p role="status">{details.saving ? 'Saving workout details…' : details.dirty ? 'Workout details not saved yet.' : 'Workout details saved on this device.'}</p>
    {details.error && <><p role="alert" className="error">{details.error}</p><button disabled={details.saving || blocked} onClick={() => void details.flush().catch(() => {})}>Retry saving details</button></>}
    <p>{completed} completed sets · {incomplete} incomplete</p>
    {!workout.sessionExercises.length && <p>Add an exercise to begin. Your empty workout is already saved.</p>}
    {workout.sessionExercises.map((exercise, exerciseIndex) => {
      const sets = workout.strengthSets.filter(set => set.sessionExerciseId === exercise.id).sort((a, b) => a.position - b.position)
      return <article className="workout-exercise" key={exercise.id}>
        <h3>{exercise.snapshot.name}</h3><p className="note">{trackingLabel(exercise.snapshot.tracking)}</p>
        {exercise.notes && <p className="multiline">{exercise.notes}</p>}
        <div className="actions compact-actions">
          <button className="secondary" disabled={structuralBlocked || exerciseIndex === 0} onClick={() => invoke(() => moveWorkoutItem(id, 'exercise', exercise.id, -1))} aria-label={`Move ${exercise.snapshot.name} up`}>↑ Exercise</button>
          <button className="secondary" disabled={structuralBlocked || exerciseIndex === workout.sessionExercises.length - 1} onClick={() => invoke(() => moveWorkoutItem(id, 'exercise', exercise.id, 1))} aria-label={`Move ${exercise.snapshot.name} down`}>↓ Exercise</button>
          <button className="secondary" disabled={structuralBlocked} onClick={() => setRemoval({ kind: 'exercise', id: exercise.id })}>Remove exercise</button>
        </div>
        {sets.map((set, index) => <div className={`set-row ${set.completed ? 'set-complete' : ''}`} key={set.id}>
          <p><strong>Set {index + 1}</strong> · {set.setType} · <strong>{set.completed ? 'Completed' : 'Incomplete'}</strong></p>
          {editing === set.id ? <SetEditor key={set.id} sessionId={id} exercise={exercise.snapshot} set={set} initial={workout.editorDrafts.find(draft => draft.setId === set.id) ?? inputFromSet(set)} disabled={busy || applying} onStatus={reportEditor}
            onCommit={async (input: SetInput, complete) => {
              await run(async () => { await saveSetDraft(id, set.id, input); await commitSet(id, set.id, input, complete) }, () => { setEditing(undefined); setEditorStatus({ dirty: false, saving: false }); setMessage(complete ? 'Set completed and saved.' : 'Set values saved.') })
            }} onDiscard={() => run(() => discardSetDraft(id, set.id), () => { setEditing(undefined); setEditorStatus({ dirty: false, saving: false }) })}
            onType={type => run(() => changeSetType(id, set.id, type))} /> : <>
              <p>{performanceText(set)}</p>
              {workout.editorDrafts.some(draft => draft.setId === set.id) && <p className="note">Saved draft available — resume editing.</p>}
              {set.target && <p className="note">Target: {set.target.reps ? `${set.target.reps.min}–${set.target.reps.max} reps` : set.target.durationSeconds ? `${set.target.durationSeconds.min}–${set.target.durationSeconds.max} seconds` : 'Prescription retained with this set'}</p>}
              <div className="actions compact-actions">
                <button disabled={structuralBlocked} onClick={() => { setEditing(set.id); setMessage(''); setError('') }}>Edit set {index + 1}</button>
                <button className="secondary" disabled={structuralBlocked || index === 0} onClick={() => invoke(() => moveWorkoutItem(id, 'set', set.id, -1))} aria-label={`Move set ${index + 1} up in ${exercise.snapshot.name}`}>↑</button>
                <button className="secondary" disabled={structuralBlocked || index === sets.length - 1} onClick={() => invoke(() => moveWorkoutItem(id, 'set', set.id, 1))} aria-label={`Move set ${index + 1} down in ${exercise.snapshot.name}`}>↓</button>
                <button className="secondary" disabled={structuralBlocked} onClick={() => setRemoval({ kind: 'set', id: set.id })}>Remove set {index + 1}</button>
              </div>
            </>}
        </div>)}
        <button className="secondary" disabled={structuralBlocked} onClick={() => invoke(() => addSet(id, exercise.id))}>Add set to {exercise.snapshot.name}</button>
      </article>
    })}
    <div className="actions">
      <button disabled={structuralBlocked} onClick={() => { setPicker(!picker); setQuery('') }}>{picker ? 'Close exercise picker' : 'Add exercise'}</button>
      <button disabled={structuralBlocked || details.saving || completed === 0} onClick={() => { setReview('finish'); setPicker(false) }}>Review and finish</button>
      <button className="secondary" disabled={structuralBlocked || details.dirty || details.saving} onClick={onBack}>Back — workout stays active</button>
      <button className="secondary" disabled={blocked || details.saving} onClick={() => setReview('cancel')}>Cancel workout</button>
    </div>
    {editing && <p className="note">Save values, complete the set or discard edits before changing workout structure or finishing. Saved set drafts can be resumed after reopening.</p>}
    {picker && <div className="exercise-picker"><h3>Add a library exercise</h3><label htmlFor="workout-exercise-search">Find exercise</label><input id="workout-exercise-search" type="search" value={query} onChange={event => setQuery(event.target.value)} />
      <ul className="exercise-list">{filterExercises(library, { query }).map(exercise => <li key={exercise.id}><button className="exercise-row" disabled={structuralBlocked} onClick={() => invoke(() => addWorkoutExercise(id, exercise.id), () => { setPicker(false); setMessage('Exercise added with its first empty set.') })}><strong>{exercise.name}</strong><span className="note">{trackingLabel(exercise.tracking)}</span></button></li>)}</ul>
    </div>}
    {removal && <div className="review-box" role="alert"><p>Remove this {removal.kind} and its saved set data? This cannot be undone here.</p><div className="actions"><button disabled={structuralBlocked} onClick={() => invoke(() => removal.kind === 'exercise' ? removeWorkoutExercise(id, removal.id) : removeSet(id, removal.id), () => setRemoval(undefined))}>Confirm removal</button><button className="secondary" disabled={blocked} onClick={() => setRemoval(undefined)}>Keep it</button></div></div>}
    {review && <div className="review-box" role="alert">
      <h3>{review === 'finish' ? 'Finish this workout?' : 'Cancel this workout?'}</h3>
      <p>{review === 'finish' ? `${completed} completed sets will count. ${incomplete} incomplete sets will be retained but excluded from results. Save or discard all set drafts first.` : 'Recorded sets stay in cancelled history. Pending drafts and any unsaved details will be discarded.'}</p>
      <div className="actions"><button disabled={blocked || details.saving || (review === 'finish' && !!editing)} onClick={() => invoke(async () => {
        if (review === 'finish') { await details.flush(); await finishWorkout(id, true) } else await cancelWorkout(id)
      }, onBack)}>{review === 'finish' ? 'Finish with completed sets' : 'Confirm cancellation'}</button><button className="secondary" disabled={blocked} onClick={() => setReview(undefined)}>Keep logging</button></div>
    </div>}
    {busy && <p role="status">Saving workout…</p>}{message && <p role="status">{message}</p>}{error && <p role="alert" className="error">{error}</p>}
  </section>
}

export function WorkoutsPanel({ mode = 'train', initialSessionId, onNavigateHistory }: { mode?: 'train' | 'history'; initialSessionId?: string; onNavigateHistory?: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [library, setLibrary] = useState<Exercise[]>([])
  const [selected, setSelected] = useState<Workout>()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [error, setError] = useState('')
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  useLayoutEffect(() => { if (!selected || selected.sessions[0].status !== 'active') updateSafety.setSafety({ dirty: false, busy, restoring: false, loading }) }, [selected, busy, loading])
  async function refresh() { setSessions(await listWorkouts()) }
  useEffect(() => {
    let active = true
    void initializeExerciseLibrary().then(async () => {
      const [sessions, library] = await Promise.all([listWorkouts(), listExercises()])
      const requested = initialSessionId ? await loadWorkout(initialSessionId) : undefined
      if (active) { setSessions(sessions); setLibrary(library); setSelected(requested); setLoading(false) }
    }).catch(() => { if (active) { setError('Could not load workouts. Reopen the app to retry.'); setLoading(false) } })
    return () => { active = false }
  }, [initialSessionId])
  async function open(id?: string) {
    if (lock.current || applying) return
    lock.current = true; setBusy(true); updateSafety.setBusy(true); setError('')
    try { const sessionId = id ?? await startWorkout(); setSelected(await loadWorkout(sessionId)) }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not open workout.') }
    finally { lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  function back() { setSelected(undefined); void refresh().catch(() => setError('Could not refresh workout list. Reopen to retry.')) }
  const active = sessions.find(session => session.status === 'active')
  if (selected) return selected.sessions[0].status === 'active' ? <ActiveWorkout key={selected.sessions[0].id} initial={selected} library={library} onBack={back} /> : <WorkoutHistory workout={selected} onBack={back} backLabel={mode === 'history' ? 'Back to history' : 'Back to Train'} />
  const history = sessions.filter(session => session.status !== 'active')
  const visibleHistory = mode === 'train' ? history.slice(0, 3) : history
  return <section aria-label={mode === 'train' ? 'Training' : 'Workout history'}>
    {mode === 'train' && <div className="training-hero">
      <span className="hero-symbol"><Icon name="train" /></span>
      {loading ? <p role="status">Opening your workouts…</p> : active ? <>
        <h2>Pick up where you left off</h2><div className="resume-card"><h3>{active.title}</h3><p>Started {new Date(active.startedAt).toLocaleString()}</p><Button disabled={busy || applying} onClick={() => void open(active.id)}>Resume workout <Icon name="arrow" /></Button></div>
      </> : <><h2>Strength workout</h2><Button disabled={busy || applying} onClick={() => void open()}>Start workout <Icon name="arrow" /></Button></>}
    </div>}
    <div className="section-heading"><h2>{mode === 'history' ? 'All sessions' : 'Recent sessions'}</h2>{mode === 'train' && onNavigateHistory && <Button variant="quiet" disabled={busy || applying || loading} onClick={onNavigateHistory}>View history <Icon name="arrow" /></Button>}</div>
    {mode === 'history' && loading && <p role="status">Opening your history…</p>}
    {!loading && !history.length && <div className="empty-state"><Icon name="history" /><h3>No sessions recorded yet</h3><p>Your finished workouts will appear here.</p></div>}
    <ul className="exercise-list">{visibleHistory.map(session => <li key={session.id}><button className="exercise-row" disabled={busy || applying} onClick={() => void open(session.id)}><strong>{session.title}</strong><span>{new Date(session.startedAt).toLocaleString()} · {durationText(session.startedAt, session.endedAt!)}</span><span className="badge">{session.status === 'cancelled' ? 'Cancelled' : 'Finished'}</span></button></li>)}</ul>
    {busy && <p role="status">Opening workout…</p>}{error && <p role="alert" className="error">{error}</p>}
  </section>
}
