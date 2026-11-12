import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { cardioWeek, deleteCardioSession, listCardioSessions, type CardioSession } from '../../data/repositories/cardio'
import { CardioForm } from './CardioForm'
import { distanceText, durationText, paceText } from './cardioDisplay'
import { Button } from '../../components/ui/Button'
import { Icon, type IconName } from '../../components/ui/Icon'
import { CARDIO_ACTIVITIES, type CardioActivity } from '../../domain/cardio/activities'

const icons: Record<CardioActivity, IconName> = {
  running: 'running', cycling: 'cycling', swimming: 'swimming',
  walking: 'walking', hiking: 'hiking', rowing: 'rowing', other: 'performance',
}

export function CardioHome({ onBack, onActivity, onHistory, onSession, blocked }: {
  onBack: () => void
  onActivity: (activity: CardioActivity) => void
  onHistory: () => void
  onSession: (id: string) => void
  blocked: boolean
}) {
  const { sessions, failed } = useCardioSessions()
  const totals = sessions && cardioWeek(sessions)
  const distance = totals?.distance == null ? undefined : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(totals.distance / 1000)} km`
  return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={blocked}>Back to Performance</Button>
    <div className="cardio-home">
      <section className="surface-card" aria-labelledby="cardio-activities">
        <h2 id="cardio-activities">Choose an activity</h2>
        <div className="cardio-activities">
          {(Object.keys(CARDIO_ACTIVITIES) as CardioActivity[]).map(activity =>
            <Button key={activity} variant="secondary" disabled={blocked} onClick={() => onActivity(activity)}>
              <Icon name={icons[activity]} />{CARDIO_ACTIVITIES[activity]}
            </Button>,
          )}
        </div>
      </section>
      <section className="surface-card" aria-labelledby="cardio-week">
        <h2 id="cardio-week">This week</h2>
        <dl className="cardio-week">
          {[
            ['Total distance', distance],
            ['Cardio duration', totals?.sessions ? durationText(totals.duration) : undefined],
            ['Sessions', totals ? String(totals.sessions) : undefined],
          ].map(([label, value]) => <div key={label}>
            <dt>{label}</dt><dd>{value ?? <><span aria-hidden="true">—</span><span className="sr-only">No data</span></>}</dd>
          </div>)}
        </dl>
        {totals?.sessions ? <p className="note">Distance includes sessions with recorded distance.</p>
          : <p className="note">Weekly totals will appear once you’ve logged cardio sessions.</p>}
      </section>
      <section className="surface-card" aria-labelledby="cardio-recent">
        <h2 id="cardio-recent">Recent sessions</h2>
        <CardioSessionList sessions={sessions?.slice(0, 5)} failed={failed} onSession={onSession} blocked={blocked} />
        <Button variant="secondary" disabled={blocked} onClick={onHistory}>View cardio history <Icon name="arrow" /></Button>
      </section>
    </div>
  </>
}

function useCardioSessions() {
  const [sessions, setSessions] = useState<CardioSession[]>()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const subscription = liveQuery(() => listCardioSessions()).subscribe({
      next: setSessions, error: () => setFailed(true),
    })
    return () => subscription.unsubscribe()
  }, [])
  return { sessions, failed }
}

function CardioSessionList({ sessions, failed, onSession, blocked }: {
  sessions?: CardioSession[]; failed: boolean; onSession: (id: string) => void; blocked: boolean
}) {
  if (failed) return <p className="error" role="alert">Could not load cardio sessions.</p>
  if (!sessions) return <p role="status">Opening cardio history…</p>
  if (!sessions.length) return <p className="note">No cardio sessions yet.</p>
  return <ul className="exercise-list">{sessions.map(({ session, details }) => <li key={session.id}>
    <button type="button" className="exercise-row" disabled={blocked} onClick={() => onSession(session.id)}>
      <strong>{session.title}</strong>
      <span>{[CARDIO_ACTIVITIES[details.sport], durationText(details.durationSeconds), distanceText(details)].filter(Boolean).join(' · ')}</span>
      <time dateTime={session.startedAt}>{new Date(session.startedAt).toLocaleString()}</time>
    </button>
  </li>)}</ul>
}

export function CardioHistory({ onBack, onSession, blocked }: {
  onBack: () => void; onSession: (id: string) => void; blocked: boolean
}) {
  const { sessions, failed } = useCardioSessions()
  return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={blocked}>Back to Cardio</Button>
    <section className="surface-card" aria-labelledby="cardio-history-heading">
      <h2 id="cardio-history-heading">Saved sessions</h2>
      <CardioSessionList {...{ sessions, failed, onSession, blocked }} />
    </section>
  </>
}

export function CardioSessionScreen({ id, onBack, blocked, applying }: {
  id: string; onBack: () => void; blocked: boolean; applying: boolean
}) {
  const { sessions, failed } = useCardioSessions()
  const [editing, setEditing] = useState<CardioSession>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const record = sessions?.find(row => row.session.id === id)
  if (editing) return <CardioForm sport={editing.details.sport} previous={editing}
    onBack={() => {
      if (!updateSafety.getSnapshot().dirty || window.confirm('Discard your unsaved cardio edits?')) {
        updateSafety.setSafety({ dirty: false, busy: false, restoring: false, loading: false })
        setEditing(undefined)
      }
    }} onSaved={() => setEditing(undefined)} blocked={applying} />
  const disabled = blocked || busy
  async function remove(record: CardioSession) {
    if (disabled || updateSafety.getSnapshot().applying || !window.confirm(`Delete “${record.session.title}” from cardio history?`)) return
    setError('')
    setBusy(true)
    updateSafety.setBusy(true)
    try {
      await deleteCardioSession(record)
      updateSafety.setBusy(false)
      onBack()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not delete this session.')
    } finally { updateSafety.setBusy(false); setBusy(false) }
  }
  return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={disabled}>Back to cardio history</Button>
    {failed ? <p role="alert">Could not load the cardio session.</p> : !sessions ? <p role="status">Opening session…</p>
      : !record ? <p role="status">This cardio session could not be found.</p> : <section className="surface-card" aria-label="Session details">
        <h2>{record.session.title}</h2>
        <p>{new Date(record.session.startedAt).toLocaleString()}</p>
        <dl>{[
          ['Activity', CARDIO_ACTIVITIES[record.details.sport]], ['Setting', record.details.setting || undefined],
          ['Duration', durationText(record.details.durationSeconds)], ['Distance', distanceText(record.details)],
          [record.details.sport === 'cycling' ? 'Average speed' : 'Average pace', paceText(record.details)],
          ['Average heart rate', record.details.averageHeartRate === null ? undefined : `${record.details.averageHeartRate} bpm`],
          ['Max heart rate', record.details.maxHeartRate === null ? undefined : `${record.details.maxHeartRate} bpm`],
          ['Elevation gain', record.details.elevationGainMeters === null ? undefined : `${record.details.elevationGainMeters} m`],
          ['Elevation loss', record.details.elevationLossMeters === null ? undefined : `${record.details.elevationLossMeters} m`],
          ['Calories', record.details.calories === null ? undefined : `${record.details.calories} kcal`],
          ['Pool', record.details.poolLength === null ? undefined : `${record.details.poolLengths} lengths × ${record.details.poolLength} ${record.details.distanceUnit}`],
        ].flatMap(([label, value]) => value === undefined ? [] : [<div key={label}><dt>{label}</dt><dd>{value}</dd></div>])}</dl>
        {record.session.notes && <p className="multiline">{record.session.notes}</p>}
        {error && <p role="alert" className="error">{error}</p>}
        <div className="actions">
          <Button variant="secondary" disabled={disabled} onClick={() => setEditing(record)}>Edit session</Button>
          <Button variant="danger" disabled={disabled} onClick={() => void remove(record)}>Delete session</Button>
        </div>
      </section>}
  </>
}
