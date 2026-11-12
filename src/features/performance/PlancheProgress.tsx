import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { listPlancheAttempts, recordPlancheAttempt } from '../../data/repositories/planche'
import { formatPlancheValue, parsePlancheValue, PLANCHE_MOVEMENTS, PLANCHE_ORDER, type PlancheMovement } from '../../domain/calisthenics/planche'

async function plancheRows() {
  return Promise.all(PLANCHE_ORDER.map(async movement => {
    const attempts = await listPlancheAttempts(movement)
    return {
      movement,
      latest: attempts.at(-1)?.value,
      best: attempts.reduce((best, attempt) => Math.max(best, attempt.value), 0),
    }
  }))
}

export function PlancheProgress({ blocked, onBack, onMovement }: {
  blocked: boolean
  onBack: () => void
  onMovement: (movement: PlancheMovement) => void
}) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof plancheRows>> | null>()
  const [editing, setEditing] = useState<PlancheMovement>()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const saving = useRef(false)
  const dirty = !!editing && input !== ''
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty, busy: false, restoring: false, loading: false })
  }, [dirty])
  useEffect(() => {
    const subscription = liveQuery(plancheRows).subscribe({ next: setRows, error: () => setRows(null) })
    return () => subscription.unsubscribe()
  }, [])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || saving.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])

  function edit(movement?: PlancheMovement) {
    if (dirty && !window.confirm('Discard this attempt?')) return
    setEditing(movement)
    setInput('')
    setError('')
  }

  async function save(movement: PlancheMovement) {
    if (saving.current || updateSafety.getSnapshot().applying) return
    const value = parsePlancheValue(input, PLANCHE_MOVEMENTS[movement].unit)
    if (value === undefined) { setError('Enter a valid result for this movement.'); return }
    saving.current = true
    updateSafety.setBusy(true)
    setError('')
    try {
      await recordPlancheAttempt(movement, value, '')
      setEditing(undefined)
      setInput('')
    } catch {
      setError('Could not save this attempt.')
    } finally {
      saving.current = false
      updateSafety.setBusy(false)
    }
  }

  return <>
    <Button className="section-back" variant="secondary" disabled={blocked} onClick={onBack}>Back to Calisthenics</Button>
    <section className="surface-card" aria-labelledby="planche-movements">
      <h2 id="planche-movements">Movements</h2>
      <p>Tap a result to log an attempt. Tap a movement for its history and graph.</p>
      {rows === null ? <p role="alert">Could not load progress.</p> : !rows ? <p role="status">Loading progress…</p> :
        <ol className="planche-movements">{rows.map(({ movement, latest, best }) => {
          const { heading, unit, milestones } = PLANCHE_MOVEMENTS[movement]
          return <li key={movement}>
            <div className="planche-row">
              <button className="planche-movement" type="button" disabled={blocked} onClick={() => onMovement(movement)}>{heading}
                {movement === 'straight-arm-dumbbell-flies' && <small>5/5/5</small>}
              </button>
              <Button variant="secondary" disabled={blocked} aria-expanded={editing === movement}
                aria-label={`Log ${heading}. Latest: ${latest === undefined ? 'no attempts' : formatPlancheValue(latest, unit)}`}
                onClick={() => edit(movement)}>{latest === undefined ? 'Log result' : formatPlancheValue(latest, unit)}</Button>
            </div>
            {milestones.length ? <ul className="planche-milestones" aria-label={`${heading} milestones`}>
              {milestones.map(milestone => <li key={milestone} data-achieved={best >= milestone}>
                <span aria-hidden="true">{best >= milestone ? '✓ ' : ''}</span>{formatPlancheValue(milestone, unit)}
                <span className="sr-only">{best >= milestone ? ' achieved' : ' ahead'}</span>
              </li>)}
            </ul> : <small>Longest hold{latest !== undefined ? ` · ${formatPlancheValue(best, unit)}` : ''}</small>}
            {editing === movement && <form className="planche-form" onSubmit={event => { event.preventDefault(); void save(movement) }}>
              <label>{unit === 'kg' ? 'Weight (kg)' : unit === 'seconds' ? 'Hold duration (seconds)' : 'Reps'}
                <input required inputMode={unit === 'kg' ? 'decimal' : 'numeric'} maxLength={24} value={input} disabled={blocked} onChange={event => setInput(event.target.value)} />
              </label>
              <div className="actions">
                <Button type="submit" disabled={blocked}>Save attempt</Button>
                <Button variant="secondary" disabled={blocked} onClick={() => edit()}>Cancel</Button>
              </div>
              {error && <p role="alert" className="error">{error}</p>}
            </form>}
          </li>
        })}</ol>}
    </section>
  </>
}
