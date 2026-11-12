import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { formatMeasurement, parseMeasurement, type MeasurementUnit } from '../../domain/calisthenics/measurement'
import { milestoneReached } from '../../domain/calisthenics/pushups'

type MovementConfig = { heading: string; unit: MeasurementUnit; milestones: readonly number[]; lowerIsBetter?: boolean; subtitle?: string }

export function MovementProgress<M extends string>({ blocked, onBack, onMovement, order, movements, list, record, reminder }: {
  blocked: boolean
  onBack: () => void
  onMovement: (movement: M) => void
  order: readonly M[]
  movements: Record<M, MovementConfig>
  list: (movement: M) => Promise<{ value: number }[]>
  record: (movement: M, value: number, notes: string) => Promise<void>
  reminder?: { after: M; title: string; text: string }
}) {
  const [rows, setRows] = useState<{ movement: M; latest?: number; best?: number }[] | null>()
  const [editing, setEditing] = useState<M>()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const saving = useRef(false)
  const dirty = !!editing && input !== ''
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty, busy: false, restoring: false, loading: false })
  }, [dirty])
  useEffect(() => {
    const subscription = liveQuery(() => Promise.all(order.map(async movement => {
      const attempts = await list(movement)
      const compare = movements[movement].lowerIsBetter ? Math.min : Math.max
      return {
        movement, latest: attempts.at(-1)?.value,
        best: attempts.reduce<number | undefined>((best, attempt) => best === undefined ? attempt.value : compare(best, attempt.value), undefined),
      }
    }))).subscribe({ next: setRows, error: () => setRows(null) })
    return () => subscription.unsubscribe()
  }, [order, movements, list])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || saving.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])

  function edit(movement?: M) {
    if (dirty && !window.confirm('Discard this attempt?')) return
    setEditing(movement)
    setInput('')
    setError('')
  }

  async function save(movement: M) {
    if (saving.current || updateSafety.getSnapshot().applying) return
    const value = parseMeasurement(input, movements[movement].unit)
    if (value === undefined) { setError('Enter a valid result for this movement.'); return }
    saving.current = true
    updateSafety.setBusy(true)
    setError('')
    try {
      await record(movement, value, '')
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
          const { heading, unit, milestones, lowerIsBetter, subtitle } = movements[movement]
          return <Fragment key={movement}><li>
            <div className="planche-row">
              <button className="planche-movement" type="button" disabled={blocked} onClick={() => onMovement(movement)}>{heading}
                {subtitle && <small>{subtitle}</small>}
              </button>
              <Button variant="secondary" disabled={blocked} aria-expanded={editing === movement}
                aria-label={`Log ${heading}. Latest: ${latest === undefined ? 'no attempts' : formatMeasurement(latest, unit)}`}
                onClick={() => edit(movement)}>{latest === undefined ? 'Log result' : formatMeasurement(latest, unit)}</Button>
            </div>
            {milestones.length ? <ul className="planche-milestones" aria-label={`${heading} milestones`}>
              {milestones.map(milestone => {
                const reached = milestoneReached(best, milestone, lowerIsBetter)
                return <li key={milestone} data-achieved={reached}>
                  <span aria-hidden="true">{reached ? '✓ ' : ''}</span>{formatMeasurement(milestone, unit)}{lowerIsBetter && ' or fewer'}
                  <span className="sr-only">{reached ? ' achieved' : ' ahead'}</span>
                </li>
              })}
            </ul> : <small>Longest hold{best !== undefined ? ` · ${formatMeasurement(best, unit)}` : ''}</small>}
            {editing === movement && <form className="planche-form" onSubmit={event => { event.preventDefault(); void save(movement) }}>
              <label>{unit === 'kg' ? 'Weight (kg)' : unit === 'seconds' ? 'Hold duration (seconds)' : unit === 'steps' ? 'Hand steps' : 'Reps'}
                <input required inputMode={unit === 'kg' ? 'decimal' : 'numeric'} maxLength={24} value={input} disabled={blocked} onChange={event => setInput(event.target.value)} />
              </label>
              <div className="actions">
                <Button type="submit" disabled={blocked}>Save attempt</Button>
                <Button variant="secondary" disabled={blocked} onClick={() => edit()}>Cancel</Button>
              </div>
              {error && <p role="alert" className="error">{error}</p>}
            </form>}
          </li>
          {reminder?.after === movement && <li><strong>{reminder.title}</strong><span className="note">{reminder.text}</span></li>}
          </Fragment>
        })}</ol>}
    </section>
  </>
}
