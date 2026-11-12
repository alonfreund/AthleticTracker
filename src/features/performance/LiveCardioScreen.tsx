import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { changeLiveCardio, loadLiveCardio, startLiveCardio } from '../../data/repositories/cardioLive'
import { CARDIO_ACTIVITIES, type CardioActivity } from '../../domain/cardio/activities'
import { activeMilliseconds, currentInterval, segments, type CardioTiming, type LiveCardio } from '../../domain/cardio/timing'
import { CardioForm } from './CardioForm'
import { durationText } from './cardioDisplay'

export function LiveCardioEntry({ sport, onOpen }: { sport?: CardioActivity; onOpen: () => void }) {
  const [record, setRecord] = useState<LiveCardio | null>()
  const [intervals, setIntervals] = useState(false)
  const [work, setWork] = useState('60')
  const [recovery, setRecovery] = useState('30')
  const [repeats, setRepeats] = useState('5')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const subscription = liveQuery(() => loadLiveCardio()).subscribe({
      next: row => setRecord(row ?? null), error: () => setError('Could not load cardio recording.'),
    })
    return () => subscription.unsubscribe()
  }, [])
  async function start() {
    const safety = updateSafety.getSnapshot()
    if (!sport || safety.busy || safety.applying) return
    if (safety.dirty) { setError('Wait for your manual draft to save before starting a timer.'); return }
    setError('')
    setBusy(true)
    updateSafety.setBusy(true)
    try {
      await startLiveCardio(sport, intervals ? { workSeconds: Number(work), recoverySeconds: Number(recovery), repeats: Number(repeats) } : null)
      updateSafety.setBusy(false)
      onOpen()
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not start recording.') }
    finally { updateSafety.setBusy(false); setBusy(false) }
  }
  if (!sport && !record && !error) return null
  return <section className="surface-card cardio-live-entry" aria-label="Live cardio">
    {record ? <Button onClick={onOpen}>{record.state === 'review' ? 'Review recording' : 'Resume recording'} · {CARDIO_ACTIVITIES[record.sport]}</Button>
      : sport && <>
        <h2>Live timer</h2>
        <label className="cardio-check"><input type="checkbox" checked={intervals} onChange={event => setIntervals(event.target.checked)} /> Timed intervals</label>
        {intervals && <div className="cardio-duration-inputs">
          {([[work, setWork, 'Work (s)'], [recovery, setRecovery, 'Recovery (s)'], [repeats, setRepeats, 'Repeats']] as const)
            .map(([value, set, label]) => <label key={label}>{label}<input inputMode="numeric" maxLength={4} value={value} onChange={event => set(event.target.value)} /></label>)}
        </div>}
        <Button disabled={busy || record === undefined} onClick={() => void start()}>Start timer</Button>
      </>}
    {error && <p className="error" role="alert">{error}</p>}
  </section>
}

export function TimingBreakdown({ timing }: { timing: Pick<CardioTiming, 'activeMs' | 'laps' | 'plan'> }) {
  const result = segments(timing.activeMs, timing.laps, timing.plan)
  const showTime = (ms: number) => ms > 0 && ms < 1000 ? '<1 s' : durationText(Math.floor(ms / 1000))
  return <>
    {!!result.laps.length && <details className="cardio-more"><summary>Laps ({result.laps.length})</summary>
      <ol>{result.laps.map(lap => <li key={lap.end}>{showTime(lap.end - lap.start)}</li>)}</ol>
    </details>}
    {!!result.intervals.length && <details className="cardio-more"><summary>Intervals ({result.intervals.length})</summary>
      <ol>{result.intervals.map(interval => <li key={interval.end}>{interval.kind} {interval.repeat} · {showTime(interval.end - interval.start)}</li>)}</ol>
    </details>}
  </>
}

export function LiveCardioScreen({ onBack, onSaved, blocked }: {
  onBack: () => void; onSaved: (id: string) => void; blocked: boolean
}) {
  const [record, setRecord] = useState<LiveCardio | null>()
  const [now, setNow] = useState(Date.now)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const subscription = liveQuery(() => loadLiveCardio()).subscribe({
      next: row => { setRecord(row ?? null); setNow(Date.now()) },
      error: () => setError('Could not load cardio recording.'),
    })
    return () => subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (record?.state !== 'running') return
    const tick = () => setNow(Date.now())
    tick()
    const timer = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick) }
  }, [record?.state])
  async function command(value: Parameters<typeof changeLiveCardio>[1]) {
    const safety = updateSafety.getSnapshot()
    if (!record || safety.busy || safety.applying) return
    if (value === 'discard' && !window.confirm('Discard this cardio recording?')) return
    setError('')
    setBusy(true)
    updateSafety.setBusy(true)
    try {
      const updated = await changeLiveCardio(record.token, value)
      setRecord(updated ?? null)
      setNow(Date.now())
      if (value === 'discard') {
        updateSafety.setSafety({ busy: false, dirty: false, loading: false, restoring: false })
        onBack()
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not update recording.') }
    finally { updateSafety.setBusy(false); setBusy(false) }
  }
  if (!record) return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={blocked}>Back to Cardio</Button>
    {error ? <p role="alert">{error}</p> : <p role="status">{record === null ? 'No live cardio recording.' : 'Opening recording…'}</p>}
  </>
  if (record.state === 'review') return <>
    <section className="surface-card cardio-live-entry" aria-label="Recorded timing">
      <h2>{CARDIO_ACTIVITIES[record.sport]} timing</h2>
      <p>Active {durationText(Math.floor(record.activeMs / 1000))} · Elapsed {durationText(Math.floor((record.checkpoint - record.started) / 1000))}</p>
      <TimingBreakdown timing={record} />
    </section>
    <CardioForm key={record.token} sport={record.sport} live={record} onBack={onBack} onSaved={onSaved} blocked={updateSafety.getSnapshot().applying} />
  </>
  const activeMs = activeMilliseconds(record, now)
  const interval = record.plan && currentInterval(record.plan, activeMs)
  const seconds = Math.floor(activeMs / 1000)
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':')
  const disabled = busy || blocked
  const lastLap = record.laps.at(-1)
  return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={disabled}>Back to Cardio</Button>
    <section className="surface-card cardio-live-timer" aria-label="Recording controls">
      <h2>{CARDIO_ACTIVITIES[record.sport]}</h2>
      <p className="note">{record.state === 'paused' ? 'Paused' : 'Recording'} · Active time</p>
      <p className="cardio-clock" aria-label={`Active time ${durationText(seconds)}`}>{clock}</p>
      {record.plan && <p className="cardio-interval">
        {interval ? <><span role="status">{interval.kind} {interval.repeat} of {record.plan.repeats}</span> · {durationText(Math.ceil(interval.remaining / 1000))}</>
          : <span role="status">Intervals complete</span>}
      </p>}
      <div className="actions">
        <Button disabled={disabled} onClick={() => void command(record.state === 'paused' ? 'resume' : 'pause')}>{record.state === 'paused' ? 'Resume' : 'Pause'}</Button>
        <Button variant="secondary" disabled={disabled || record.state !== 'running' || activeMs <= (lastLap ?? 0)} onClick={() => void command('lap')}>Lap</Button>
        <Button variant="secondary" disabled={disabled || activeMs < 1000} onClick={() => void command('finish')}>Finish</Button>
      </div>
      {lastLap !== undefined && <p className="note cardio-lap-status" role="status">Lap {record.laps.length} marked at {durationText(Math.floor(lastLap / 1000))} active time.</p>}
      <TimingBreakdown timing={{ activeMs: record.laps.at(-1) ?? 0, laps: record.laps, plan: null }} />
      <Button className="cardio-discard" variant="quiet" disabled={disabled} onClick={() => void command('discard')}>Discard recording</Button>
      {error && <p role="alert" className="error">{error}</p>}
    </section>
  </>
}
