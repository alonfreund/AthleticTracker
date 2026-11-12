import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { blankCardioInput, discardCardioDraft, inputFromCardio, loadCardioDraft, readCardioMeasurements, saveCardioDraft, saveCardioSession, type CardioSession } from '../../data/repositories/cardio'
import { CARDIO_ACTIVITIES, type CardioActivity } from '../../domain/cardio/activities'
import { CARDIO_SETTINGS, distanceUnits, type CardioInput } from '../../domain/cardio/models'
import { paceText } from './cardioDisplay'
import { useAutosave } from '../workouts/useAutosave'

export function CardioForm({ sport, previous, onBack, onSaved, blocked }: {
  sport: CardioActivity; previous?: CardioSession; onBack: () => void; onSaved: (id: string) => void; blocked: boolean
}) {
  const [initial, setInitial] = useState<CardioInput>()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (previous) { setInitial(inputFromCardio(previous)); return }
    let current = true
    void loadCardioDraft(sport).then(draft => { if (current) setInitial(draft?.input ?? blankCardioInput(sport)) })
      .catch(() => { if (current) setFailed(true) })
    return () => { current = false }
  }, [sport, previous])
  if (failed) return <><Button variant="secondary" onClick={onBack} disabled={blocked}>Back to Cardio</Button><p role="alert">Could not load the cardio draft.</p></>
  if (!initial) return <p role="status">Opening session form…</p>
  return <CardioFields {...{ sport, previous, initial, onBack, onSaved, blocked }} />
}

function CardioFields({ sport, previous, initial, onBack, onSaved, blocked }: {
  sport: CardioActivity; previous?: CardioSession; initial: CardioInput; onBack: () => void; onSaved: (id: string) => void; blocked: boolean
}) {
  const [edited, setEdited] = useState(initial)
  const draft = useAutosave(initial, value => saveCardioDraft(sport, value))
  const input = previous ? edited : draft.value
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const dirty = previous ? JSON.stringify(edited) !== JSON.stringify(initial) : draft.dirty
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty, busy: busy || draft.saving, restoring: false, loading: false })
  }, [busy, dirty, draft.saving])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || lock.current || draft.saving) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty, draft.saving])
  function change(field: keyof CardioInput, value: string) {
    const next = { ...input, [field]: value }
    if (field === 'setting' && value !== 'Pool') { next.poolLength = ''; next.poolLengths = '' }
    if (previous) setEdited(next)
    else draft.change(next)
    setError('')
  }
  async function run(action: () => Promise<unknown>, after?: (result: unknown) => void) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true
    setBusy(true)
    updateSafety.setBusy(true)
    try {
      if (!previous) await draft.flush()
      const result = await action()
      updateSafety.setSafety({ dirty: false, busy: false, restoring: false, loading: false })
      after?.(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save this session.')
    } finally {
      lock.current = false
      updateSafety.setBusy(false)
      setBusy(false)
    }
  }
  let pace: string | undefined
  try { pace = paceText({ sport, ...readCardioMeasurements(sport, input) }) } catch { /* Incomplete input has no preview yet. */ }
  const disabled = busy || blocked
  const numeric = (field: keyof CardioInput, label: string, integer = false) => <label>{label}
    <input inputMode={integer ? 'numeric' : 'decimal'} maxLength={30} value={input[field]} onChange={event => change(field, event.target.value)} />
  </label>
  return <>
    <Button className="section-back" variant="secondary" disabled={disabled} onClick={() => previous ? onBack() : void run(async () => {}, onBack)}>
      {previous ? 'Back to session' : 'Back to Cardio'}
    </Button>
    <form className="surface-card cardio-form" onSubmit={event => {
      event.preventDefault()
      void run(() => saveCardioSession(sport, input, previous), id => onSaved(String(id)))
    }}>
      <h2>{previous ? 'Edit session' : 'Log session'}</h2>
      <fieldset className="form-fields" disabled={disabled}>
        <label>Session name<input placeholder={CARDIO_ACTIVITIES[sport]} maxLength={200} value={input.title} onChange={event => change('title', event.target.value)} /></label>
        <div className="cardio-field-grid">
          <label>Date<input required type="date" value={input.date} onChange={event => change('date', event.target.value)} /></label>
          <label>Start time<input required type="time" value={input.time} onChange={event => change('time', event.target.value)} /></label>
        </div>
        <fieldset className="choices"><legend>Duration</legend><div className="cardio-duration-inputs">
          {numeric('hours', 'Hours', true)}{numeric('minutes', 'Minutes', true)}{numeric('seconds', 'Seconds', true)}
        </div></fieldset>
        <label>Setting<select value={input.setting} onChange={event => change('setting', event.target.value)}>
          <option value="">Unspecified</option>{CARDIO_SETTINGS[sport].map(setting => <option key={setting}>{setting}</option>)}
        </select></label>
        <div className="cardio-field-grid">
          {numeric('distance', 'Distance (optional)')}
          <label>Distance unit<select value={input.distanceUnit} onChange={event => change('distanceUnit', event.target.value)}>
            {distanceUnits(sport).map(unit => <option key={unit}>{unit}</option>)}
          </select></label>
        </div>
        {sport === 'swimming' && input.setting === 'Pool' && <>
          <p className="note">Enter distance above, or enter the pool length and number of lengths swum.</p>
          <div className="cardio-field-grid">{numeric('poolLength', `Pool length (${input.distanceUnit})`)}{numeric('poolLengths', 'Lengths swum', true)}</div>
        </>}
        {pace && <p className="note">{sport === 'cycling' ? 'Average speed' : 'Average pace'} based on entered duration: {pace}</p>}
        <details className="cardio-more">
          <summary>More details</summary>
          <div className="cardio-field-grid">
            {numeric('averageHeartRate', 'Average heart rate (bpm)', true)}
            {numeric('maxHeartRate', 'Max heart rate (bpm)', true)}
            {numeric('elevationGainMeters', 'Elevation gain (m)')}
            {numeric('elevationLossMeters', 'Elevation loss (m)')}
            {numeric('calories', 'Calories (kcal)')}
          </div>
          <label>Notes<textarea maxLength={10000} value={input.notes} onChange={event => change('notes', event.target.value)} /></label>
        </details>
        <p className="note" role="status">{busy || draft.saving ? 'Saving…' : !previous && dirty ? 'Saving draft…' : previous ? '' : 'Drafts stay on this device.'}</p>
        {(error || draft.error) && <p className="error" role="alert">{error || draft.error}</p>}
        <div className="actions">
          <Button type="submit">{previous ? 'Save changes' : 'Save session'}</Button>
          {!previous && <Button variant="secondary" onClick={() => {
            if (window.confirm('Discard this cardio draft?')) void run(() => discardCardioDraft(sport), onBack)
          }}>Discard draft</Button>}
        </div>
      </fieldset>
    </form>
  </>
}
