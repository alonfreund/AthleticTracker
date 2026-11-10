import { useLayoutEffect, useState } from 'react'
import type { Exercise, StrengthSet } from '../../domain/strength/models'
import { convertInputUnit, type SetInput } from '../../domain/strength/logging'
import { saveSetDraft } from '../../data/repositories/workouts'
import { useAutosave } from './useAutosave'
import { CONVENTION_LABELS } from '../../domain/strength/catalog'

export function SetEditor({ sessionId, exercise, set, initial, disabled, onStatus, onCommit, onDiscard, onType }: {
  sessionId: string; exercise: Exercise; set: StrengthSet; initial: SetInput; disabled: boolean
  onStatus: (status: { dirty: boolean; saving: boolean }) => void
  onCommit: (input: SetInput, complete: boolean) => Promise<void>; onDiscard: () => Promise<void>
  onType: (type: StrengthSet['setType']) => Promise<void>
}) {
  const draft = useAutosave(initial, input => saveSetDraft(sessionId, set.id, input))
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  useLayoutEffect(() => { onStatus({ dirty: draft.dirty, saving: draft.saving || working }) }, [draft.dirty, draft.saving, working, onStatus])
  async function act(action: () => Promise<void>) {
    setWorking(true); setError('')
    try { await draft.flush(); await action() }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not save this set.') }
    finally { setWorking(false) }
  }
  const config = exercise.tracking
  function field(key: keyof SetInput['values'], text: string, optional = false) {
    return <div><label htmlFor={`${set.id}-${key}`}>{text}{optional ? ' (optional)' : ''}</label>
      <input id={`${set.id}-${key}`} type="text" inputMode={key === 'reps' || key === 'rir' ? 'numeric' : 'decimal'} maxLength={128} value={draft.value.values[key]} onChange={event => draft.change({ ...draft.value, values: { ...draft.value.values, [key]: event.target.value } })} /></div>
  }
  return <div className="set-editor">
    <fieldset disabled={disabled || working} className="form-fields">
      <label htmlFor={`${set.id}-type`}>Set type</label>
      <select id={`${set.id}-type`} value={set.setType} disabled={draft.saving} onChange={event => { const type = event.target.value as StrengthSet['setType']; void act(() => onType(type)) }}>
        {['normal', 'warm-up', 'failure', 'drop-set', 'back-off', 'amrap'].map(type => <option value={type} key={type}>{type === 'amrap' ? 'AMRAP' : type}</option>)}
      </select>
      {config.load !== 'none' && <><label htmlFor={`${set.id}-unit`}>Weight unit</label><select id={`${set.id}-unit`} value={draft.value.weightUnit} onChange={event => {
        try { draft.change(convertInputUnit(draft.value, event.target.value as 'kg' | 'lb')); setError('') }
        catch (error) { setError(error instanceof Error ? error.message : 'Fix the weight before converting units.') }
      }}><option value="kg">kg</option><option value="lb">lb</option></select></>}
      {config.weightConvention && <p className="note">Enter {CONVENTION_LABELS[config.weightConvention].toLowerCase()}. Assistance and added weight are positive amounts separate from bodyweight.</p>}
      <div className="set-input-grid">
        {['external', 'added', 'assisted'].includes(config.load) && field('weight', config.load === 'added' ? 'Added weight' : config.load === 'assisted' ? 'Assistance' : 'Weight')}
        {['bodyweight', 'added', 'assisted'].includes(config.load) && field('bodyweight', 'Bodyweight', true)}
        {config.measurement === 'reps' && field('reps', 'Repetitions')}
        {field('durationSeconds', 'Duration (seconds)', config.measurement !== 'duration')}
        {field('rpe', 'RPE (1–10)', true)}{field('rir', 'RIR', true)}
      </div>
    </fieldset>
    <p role="status">{draft.saving ? 'Saving draft…' : draft.dirty ? 'Draft not saved yet.' : 'Draft saved on this device. Use Save values or Complete set to apply it.'}</p>
    {(draft.error || error) && <p role="alert" className="error">{error || draft.error}</p>}
    <div className="actions">
      <button disabled={disabled || working || draft.saving} onClick={() => void act(() => onCommit(draft.value, true))}>{set.completed ? 'Save completed set' : 'Complete set'}</button>
      <button className="secondary" disabled={disabled || working || draft.saving} onClick={() => void act(() => onCommit(draft.value, false))}>{set.completed ? 'Save as incomplete' : 'Save values'}</button>
      <button className="secondary" disabled={disabled || working || draft.saving} onClick={() => void act(onDiscard)}>Discard edits</button>
    </div>
  </div>
}
