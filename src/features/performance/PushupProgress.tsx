import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { deletePushupAttempt, listPushupAttempts, recordPushupAttempt } from '../../data/repositories/pushups'
import { MAX_PUSHUP_REPS, PUSHUP_GOAL, PUSHUP_MILESTONES, pushupProgress, type PushupAttempt } from '../../domain/calisthenics/pushups'
import { ExerciseChart } from '../analytics/ExerciseChart'

const date = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export function PushupProgress({ onBack, applying }: { onBack: () => void; applying: boolean }) {
  const [attempts, setAttempts] = useState<PushupAttempt[]>()
  const [showForm, setShowForm] = useState(false)
  const [reps, setReps] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [readError, setReadError] = useState(false)
  const [chart, setChart] = useState<'attempts' | 'best'>('attempts')
  const lock = useRef(false)
  const dirty = !!(reps || notes)
  const disabled = busy || applying
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty, busy, loading: false, restoring: false })
  }, [dirty, busy])
  useEffect(() => {
    const subscription = liveQuery(() => listPushupAttempts()).subscribe({ next: setAttempts, error: () => setReadError(true) })
    return () => subscription.unsubscribe()
  }, [])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || lock.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])
  async function run(action: () => Promise<void>) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true
    setBusy(true)
    updateSafety.setBusy(true)
    setError('')
    try { await action() }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not update this attempt.') }
    finally { lock.current = false; setBusy(false); updateSafety.setBusy(false) }
  }
  function closeForm() {
    setReps(''); setNotes(''); setShowForm(false); setError('')
  }
  const progress = pushupProgress(attempts ?? [])
  const points = progress.timeline.map(attempt => ({
    ...attempt, at: Date.parse(attempt.recordedAt), label: date.format(new Date(attempt.recordedAt)),
    source: time.format(new Date(attempt.recordedAt)), value: chart === 'best' ? attempt.best : attempt.reps,
  }))

  return <>
    <Button className="section-back" variant="secondary" disabled={disabled} onClick={onBack}>Back to Calisthenics</Button>
    <div className="performance-disciplines">
      <section className="surface-card" aria-labelledby="pushup-goal">
        <h2 id="pushup-goal">100 clean push-ups in one go</h2>
        <dl className="cardio-week">
          <div><dt>Goal</dt><dd>{PUSHUP_GOAL}</dd></div>
          <div><dt>Latest</dt><dd>{progress.latest ?? '—'}</dd></div>
          <div><dt>Best</dt><dd>{progress.best ?? '—'}</dd></div>
        </dl>
        <p className="note">Log standard push-ups with consistent depth, full elbow extension, and a straight body.</p>
        {!showForm && <Button disabled={disabled} onClick={() => { setError(''); setShowForm(true) }}>Record attempt</Button>}
        {showForm && <form onSubmit={event => {
          event.preventDefault()
          if (!/^\d+$/.test(reps) || Number(reps) > MAX_PUSHUP_REPS) { setError('Enter a whole number of clean reps.'); return }
          void run(async () => { await recordPushupAttempt(Number(reps), notes); closeForm() })
        }}>
          <fieldset className="form-fields" disabled={disabled}>
            <label>Clean reps<input required inputMode="numeric" maxLength={5} value={reps} onChange={event => setReps(event.target.value)} /></label>
            <label>Notes (optional)<textarea maxLength={10000} value={notes} onChange={event => setNotes(event.target.value)} /></label>
            <div className="actions">
              <Button type="submit">{busy ? 'Saving…' : 'Save attempt'}</Button>
              <Button variant="secondary" onClick={() => { if (!dirty || window.confirm('Discard this attempt?')) closeForm() }}>Cancel</Button>
            </div>
          </fieldset>
        </form>}
        {error && <p role="alert" className="error">{error}</p>}
      </section>
      <section className="surface-card" aria-labelledby="pushup-milestones">
        <h2 id="pushup-milestones">Milestones</h2>
        <ol className="pushup-milestones">
          {PUSHUP_MILESTONES.map(reps => <li key={reps} data-achieved={(progress.best ?? 0) >= reps}>
            <strong>{reps} reps</strong><span>{(progress.best ?? 0) >= reps ? 'Achieved' : progress.next === reps ? 'Next' : 'Ahead'}</span>
          </li>)}
        </ol>
        {progress.next === undefined && <p role="status">Goal achieved.</p>}
      </section>
      <section className="surface-card" aria-labelledby="pushup-graph">
        <h2 id="pushup-graph">Reps over time</h2>
        {readError ? <p role="alert">Could not load attempts.</p> : !attempts ? <p role="status">Loading attempts…</p>
          : !attempts.length ? <p className="note">Your graph will appear after your first attempt.</p> : <>
            <label>Show<select value={chart} onChange={event => setChart(event.target.value as typeof chart)}>
              <option value="attempts">Each attempt</option><option value="best">Best so far</option>
            </select></label>
            <ExerciseChart key={chart} points={points} title={chart === 'best' ? 'Best so far' : 'Clean reps per attempt'} bars={false}
              format={value => `${value} ${value === 1 ? 'rep' : 'reps'}`}
              details={point => <>
                <p role="status">{point.reps} clean reps · {point.label} · {point.source}</p>
                {point.notes && <p className="multiline">{point.notes}</p>}
                <Button variant="secondary" disabled={disabled} onClick={() => {
                  if (window.confirm('Delete this push-up attempt?')) void run(() => deletePushupAttempt(point.id))
                }}>Delete attempt</Button>
              </>} />
          </>}
      </section>
    </div>
  </>
}
