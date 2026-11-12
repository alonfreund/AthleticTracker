import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { deleteRepAttempt, listRepAttempts, recordRepAttempt } from '../../data/repositories/repAttempts'
import { deleteMuscleupAttempt, listMuscleupAttempts, recordMuscleupAttempt } from '../../data/repositories/muscleups'
import type { MuscleupMovement } from '../../domain/calisthenics/muscleups'
import { REP_TRACKS, type RepTrack } from '../../domain/calisthenics/repTracks'
import { MAX_PUSHUP_REPS, attemptProgress, type PushupAttempt } from '../../domain/calisthenics/pushups'
import { ExerciseChart } from '../analytics/ExerciseChart'

const date = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

type Attempt = Omit<PushupAttempt, 'reps'> & { value: number }
type Config = { heading: string; goal: number; technique?: string; unit?: 'seconds'; milestones?: readonly number[] }

export function RepProgress({ track, onBack, applying, config, backLabel = 'Back to Calisthenics' }: {
  track: RepTrack | MuscleupMovement
  onBack?: () => void
  applying: boolean
  config?: Config
  backLabel?: string
}) {
  const repTrack = track === 'pushups' || track === 'pullups' ? track : undefined
  const settings: Config | undefined = config ?? (repTrack ? REP_TRACKS[repTrack] : undefined)
  if (!settings) throw new Error('Missing progression settings.')
  const seconds = settings.unit === 'seconds'
  const milestones = settings.milestones ?? [settings.goal]
  const format = (value: number) => seconds ? `${value} sec` : `${value} ${value === 1 ? 'rep' : 'reps'}`
  const [attempts, setAttempts] = useState<Attempt[]>()
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
    const subscription = liveQuery(async () => {
      if (track === 'pushups' || track === 'pullups') {
        return (await listRepAttempts(track)).map(({ reps, ...attempt }) => ({ ...attempt, value: reps }))
      }
      return listMuscleupAttempts(track)
    }).subscribe({ next: setAttempts, error: () => setReadError(true) })
    return () => subscription.unsubscribe()
  }, [track])
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
  const progress = attemptProgress(attempts ?? [], attempt => attempt.value, milestones)
  const points = progress.timeline.map(attempt => ({
    ...attempt, at: Date.parse(attempt.recordedAt), label: date.format(new Date(attempt.recordedAt)),
    source: time.format(new Date(attempt.recordedAt)), measurement: attempt.value, value: chart === 'best' ? attempt.best : attempt.value,
  }))

  return <>
    {onBack && <Button className="section-back" variant="secondary" disabled={disabled} onClick={onBack}>{backLabel}</Button>}
    <div className="performance-disciplines">
      <section className="surface-card" aria-labelledby="rep-goal">
        <h2 id="rep-goal">{settings.heading}</h2>
        <dl className="cardio-week">
          <div><dt>Goal</dt><dd>{seconds ? format(settings.goal) : settings.goal}</dd></div>
          <div><dt>Latest</dt><dd>{progress.latest === undefined ? '—' : seconds ? format(progress.latest) : progress.latest}</dd></div>
          <div><dt>Best</dt><dd>{progress.best === undefined ? '—' : seconds ? format(progress.best) : progress.best}</dd></div>
        </dl>
        {settings.technique && <p className="note">{settings.technique}</p>}
        {!showForm && <Button disabled={disabled} onClick={() => { setError(''); setShowForm(true) }}>{track === 'muscleups' ? 'Log muscle-up attempt' : 'Record attempt'}</Button>}
        {showForm && <form onSubmit={event => {
          event.preventDefault()
          if (!/^\d+$/.test(reps) || Number(reps) > MAX_PUSHUP_REPS) { setError(seconds ? 'Enter a whole number of seconds.' : 'Enter a whole number of clean reps.'); return }
          void run(async () => { if (track === 'pushups' || track === 'pullups') await recordRepAttempt(track, Number(reps), notes)
            else await recordMuscleupAttempt(track, Number(reps), notes)
            closeForm() })
        }}>
          <fieldset className="form-fields" disabled={disabled}>
            <label>{seconds ? 'Hold duration (seconds)' : 'Clean reps'}<input required inputMode="numeric" maxLength={5} value={reps} onChange={event => setReps(event.target.value)} /></label>
            <label>Notes (optional)<textarea maxLength={10000} value={notes} onChange={event => setNotes(event.target.value)} /></label>
            <div className="actions">
              <Button type="submit">{busy ? 'Saving…' : 'Save attempt'}</Button>
              <Button variant="secondary" onClick={() => { if (!dirty || window.confirm('Discard this attempt?')) closeForm() }}>Cancel</Button>
            </div>
          </fieldset>
        </form>}
        {error && <p role="alert" className="error">{error}</p>}
      </section>
      <section className="surface-card" aria-labelledby="rep-milestones">
        <h2 id="rep-milestones">Milestones</h2>
        <ol className="rep-milestones">
          {milestones.map(reps => <li key={reps} data-achieved={(progress.best ?? 0) >= reps}>
            <strong>{format(reps)}</strong><span>{(progress.best ?? 0) >= reps ? 'Achieved' : progress.next === reps ? 'Next' : 'Ahead'}</span>
          </li>)}
        </ol>
        {progress.next === undefined && <p role="status">Goal achieved.</p>}
      </section>
      <section className="surface-card" aria-labelledby="rep-graph">
        <h2 id="rep-graph">{seconds ? 'Hold duration over time' : 'Reps over time'}</h2>
        {readError ? <p role="alert">Could not load attempts.</p> : !attempts ? <p role="status">Loading attempts…</p>
          : !attempts.length ? <p className="note">Your graph will appear after your first attempt.</p> : <>
            <label>Show<select value={chart} onChange={event => setChart(event.target.value as typeof chart)}>
              <option value="attempts">Each attempt</option><option value="best">Best so far</option>
            </select></label>
            <ExerciseChart key={chart} points={points} title={chart === 'best' ? 'Best so far' : seconds ? 'Hold duration per attempt' : 'Clean reps per attempt'} bars={false}
              format={format}
              details={point => <>
                <p role="status">{format(point.measurement)} · {point.label} · {point.source}</p>
                {point.notes && <p className="multiline">{point.notes}</p>}
                <Button variant="secondary" disabled={disabled} onClick={() => {
                  if (window.confirm(track === 'pullups' ? 'Delete this attempt from both pull-up and muscle-up progress?' : 'Delete this attempt?')) void run(() => track === 'pushups' || track === 'pullups' ? deleteRepAttempt(track, point.id) : deleteMuscleupAttempt(point.id))
                }}>Delete attempt</Button>
              </>} />
          </>}
      </section>
    </div>
  </>
}
