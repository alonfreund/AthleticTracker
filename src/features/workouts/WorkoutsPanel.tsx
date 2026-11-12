import { WorkoutRecap } from './WorkoutRecap'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import { initializeExerciseLibrary, listExercises } from '../../data/repositories/exercises'
import { deleteFinishedWorkout, editFinishedWorkout, startWorkout, startRoutine, listWorkouts, loadWorkout, type Workout } from '../../data/repositories/workouts'
import type { Exercise, Session } from '../../domain/strength/models'
import { deleteRoutine, listRoutines, saveRoutine } from '../../data/repositories/routines'
import { RoutineEditor, type SavedRoutine } from './RoutineEditor'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { ActiveWorkout } from './ActiveWorkout'
import { durationText, WorkoutHistory } from './WorkoutHistory'
import { FinishedWorkoutEditor } from './FinishedWorkoutEditor'

export function WorkoutsPanel({ mode = 'train', initialSessionId, onNavigateHistory }: { mode?: 'train' | 'history'; initialSessionId?: string; onNavigateHistory?: (id?: string) => void }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [library, setLibrary] = useState<Exercise[]>([])
  const [selected, setSelected] = useState<Workout>()
  const [showRecap, setShowRecap] = useState(false)
  const [routines, setRoutines] = useState<SavedRoutine[]>([])
  const [editing, setEditing] = useState<SavedRoutine | null>()
  const [deleting, setDeleting] = useState<string>()
  const [editingHistory, setEditingHistory] = useState(false)
  const [historyDirty, setHistoryDirty] = useState(false)
  const [historyMessage, setHistoryMessage] = useState('')
  const [routineDirty, setRoutineDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [error, setError] = useState('')
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  useLayoutEffect(() => { if (!selected || selected.sessions[0].status !== 'active') updateSafety.setSafety({ dirty: routineDirty || historyDirty, busy, restoring: false, loading }) }, [selected, busy, loading, routineDirty, historyDirty])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (historyDirty || (selected?.sessions[0].status === 'finished' && lock.current)) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [historyDirty, selected])
  async function refresh() { setSessions(await listWorkouts()) }
  useEffect(() => {
    let active = true
    void initializeExerciseLibrary().then(async () => {
      const [sessions, library, savedRoutines] = await Promise.all([listWorkouts(), listExercises(), mode === 'train' ? listRoutines() : []])
      const requested = initialSessionId ? await loadWorkout(initialSessionId) : undefined
      if (active) { setSessions(sessions); setLibrary(library); setRoutines(savedRoutines); setSelected(requested); setLoading(false) }
    }).catch(() => { if (active) { setError('Could not load workouts. Reopen the app to retry.'); setLoading(false) } })
    return () => { active = false }
  }, [initialSessionId, mode])
  async function perform(action: () => Promise<void>, fallback: string) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true; setBusy(true); updateSafety.setBusy(true); setError('')
    try { await action() }
    catch (error) { setError(error instanceof Error ? error.message : fallback) }
    finally { lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  function open(id?: string, routineId?: string) {
    return perform(async () => {
      const sessionId = id ?? (routineId ? await startRoutine(routineId) : await startWorkout())
      setHistoryMessage(''); setSelected(await loadWorkout(sessionId))
    }, 'Could not open workout.')
  }
  function closeEditor() {
    setEditing(undefined)
    setRoutineDirty(false)
    setError('')
  }
  if (editing !== undefined) return <>
    <RoutineEditor routine={editing} library={library} disabled={busy || applying} onDirty={() => setRoutineDirty(true)}
      onCancel={() => { if (!routineDirty || window.confirm('Discard your unsaved routine changes?')) closeEditor() }}
      onSave={(input, exercises) => void perform(async () => {
        await saveRoutine(input, exercises)
        const updated = await listRoutines()
        setRoutines(updated)
        closeEditor()
      }, 'Could not save routine.')} />
    {busy && <p role="status">Saving routine…</p>}{error && <p role="alert" className="error">{error}</p>}
  </>
  function back() { setShowRecap(false); setSelected(undefined); setHistoryMessage(''); setError(''); void refresh().catch(() => setError('Could not refresh workout list. Reopen to retry.')) }
  const active = sessions.find(session => session.status === 'active')
  function closeHistoryEditor() { setEditingHistory(false); setHistoryDirty(false); setError('') }
  if (selected) {
    const session = selected.sessions[0]
    if (session.status === 'active') return <ActiveWorkout key={session.id} initial={selected} library={library} onBack={back} onFinished={workout => {
      setSelected(workout)
      setShowRecap(true)
    }} />
    if (showRecap) return <WorkoutRecap workout={selected} onDone={back} onView={() => {
      if (onNavigateHistory) onNavigateHistory(session.id)
      else setShowRecap(false)
    }} />
    const disabled = busy || applying
    if (editingHistory) return <FinishedWorkoutEditor key={session.id} workout={selected} disabled={disabled} error={error}
      onDirty={setHistoryDirty} onCancel={closeHistoryEditor} onSave={edit => void perform(async () => {
        const updated = await editFinishedWorkout(selected, edit)
        setSelected(updated); closeHistoryEditor(); setHistoryMessage('Workout changes saved on this device.')
      }, 'Could not save workout changes.')} />
    return <WorkoutHistory workout={selected} onBack={back} backLabel={mode === 'history' ? 'Back to history' : 'Back to Train'}
      disabled={disabled} message={historyMessage} error={error}
      onEdit={() => { setError(''); setEditingHistory(true) }}
      onDelete={() => {
        if (!window.confirm(`Delete “${session.title}” from ${new Date(session.startedAt).toLocaleString()}? This permanently removes the workout and its sets from this device.`)) return
        void perform(async () => {
          await deleteFinishedWorkout(selected)
          setSessions(current => current.filter(row => row.id !== session.id))
          setSelected(undefined); setHistoryMessage('Workout deleted from this device.')
        }, 'Could not delete workout.')
      }} />
  }
  const history = sessions.filter(session => session.status !== 'active')
  const visibleHistory = mode === 'train' ? history.slice(0, 3) : history
  return <section aria-label={mode === 'train' ? 'Training' : 'Workout history'}>
    {historyMessage && <p role="status">{historyMessage}</p>}
    {mode === 'train' && <div className="training-hero">
      <span className="hero-symbol"><Icon name="train" /></span>
      {loading ? <p role="status">Opening your workouts…</p> : active ? <>
        <h2>Pick up where you left off</h2><div className="resume-card"><h3>{active.title}</h3><p>Started {new Date(active.startedAt).toLocaleString()}</p><Button disabled={busy || applying} onClick={() => void open(active.id)}>Resume workout <Icon name="arrow" /></Button></div>
      </> : <><h2>Strength workout</h2><Button disabled={busy || applying} onClick={() => void open()}>Start workout <Icon name="arrow" /></Button></>}
    </div>}
    {mode === 'train' && !loading && <section aria-labelledby="routines-heading">
      <div className="section-heading">
        <h2 id="routines-heading">Routines</h2>
        <Button variant="quiet" disabled={busy || applying} onClick={() => { setError(''); setEditing(null) }}>New routine</Button>
      </div>
      {!routines.length && <p className="note">Save your exercises and sets to use them again.</p>}
      <ul className="exercise-list">{routines.map(routine => <li className="routine-card" key={routine.id}>
        <h3>{routine.title}</h3>
        <p className="note">{routine.exercises.length} {routine.exercises.length === 1 ? 'exercise' : 'exercises'}</p>
        <div className="actions">
          <Button disabled={busy || applying || !!active} aria-label={`Start routine: ${routine.title}`} onClick={() => void open(undefined, routine.id)}>Start routine</Button>
          <Button variant="quiet" disabled={busy || applying} aria-label={`Edit routine: ${routine.title}`} onClick={() => { setError(''); setEditing(routine) }}>Edit</Button>
          <Button variant="quiet" disabled={busy || applying} aria-label={`Delete routine: ${routine.title}`} onClick={() => setDeleting(routine.id)}>Delete</Button>
        </div>
        {deleting === routine.id && <div>
          <p>Delete this routine?</p>
          <div className="actions">
            <button className="secondary" disabled={busy || applying} onClick={() => void perform(async () => {
              await deleteRoutine(routine.id)
              setRoutines(rows => rows.filter(row => row.id !== routine.id))
              setDeleting(undefined)
            }, 'Could not delete routine.')}>Confirm delete</button>
            <button className="secondary" disabled={busy || applying} onClick={() => setDeleting(undefined)}>Keep routine</button>
          </div>
        </div>}
      </li>)}</ul>
    </section>}
    <div className="section-heading"><h2>{mode === 'history' ? 'All sessions' : 'Recent sessions'}</h2>{mode === 'train' && onNavigateHistory && <Button variant="quiet" disabled={busy || applying || loading} onClick={() => onNavigateHistory()}>View history <Icon name="arrow" /></Button>}</div>
    {mode === 'history' && loading && <p role="status">Opening your history…</p>}
    {!loading && !history.length && <div className="empty-state"><Icon name="history" /><h3>No sessions recorded yet</h3><p>Your finished workouts will appear here.</p></div>}
    <ul className="exercise-list">{visibleHistory.map(session => <li key={session.id}><button className="exercise-row" disabled={busy || applying} onClick={() => void open(session.id)}><strong>{session.title}</strong><span>{new Date(session.startedAt).toLocaleString()} · {durationText(session.startedAt, session.endedAt!)}</span><span className="badge">{session.status === 'cancelled' ? 'Cancelled' : 'Finished'}</span></button></li>)}</ul>
    {busy && <p role="status">Opening workout…</p>}{error && <p role="alert" className="error">{error}</p>}
  </section>
}
