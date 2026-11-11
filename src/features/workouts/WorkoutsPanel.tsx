import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import { initializeExerciseLibrary, listExercises } from '../../data/repositories/exercises'
import { startWorkout, listWorkouts, loadWorkout, type Workout } from '../../data/repositories/workouts'
import type { Exercise, Session } from '../../domain/strength/models'
import { trackingLabel } from '../../domain/strength/catalog'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { ActiveWorkout } from './ActiveWorkout'
import { durationText, WorkoutHistory } from './WorkoutHistory'

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
