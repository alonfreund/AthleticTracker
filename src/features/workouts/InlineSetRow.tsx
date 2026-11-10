import { useState } from 'react'
import type { SessionExercise, StrengthSet } from '../../domain/strength/models'
import { convertInputUnit, inputFromSet, type SetInput } from '../../domain/strength/logging'
import type { InlineRow } from './InlineSetStore'

const types = { normal: 'Normal', 'warm-up': 'Warm-up', failure: 'Failure', 'drop-set': 'Drop set', 'back-off': 'Back-off', amrap: 'AMRAP' }
const short = { normal: '', 'warm-up': 'W', failure: 'F', 'drop-set': 'D', 'back-off': 'B', amrap: 'A' }
export function InlineSetRow({ exercise, set, index, row, previous, disabled, onChange, onSave, onComplete, onType, onRemove, onMove, onRevert, last }: {
  exercise: SessionExercise; set: StrengthSet; index: number; row: InlineRow; previous?: StrengthSet; disabled: boolean; last: boolean
  onChange: (input: SetInput) => void; onSave: () => void; onComplete: () => void; onType: (type: StrengthSet['setType']) => void
  onRemove: () => void; onMove: (direction: -1 | 1) => void; onRevert: () => void
}) {
  const [details, setDetails] = useState(false)
  const [unitError, setUnitError] = useState('')
  const config = exercise.snapshot.tracking
  const hasWeight = ['external', 'added', 'assisted'].includes(config.load)
  const name = `${exercise.snapshot.name}, set ${index + 1}`
  const weightLabel = config.load === 'added' ? 'Added weight' : config.load === 'assisted' ? 'Assistance' : 'Weight'
  function field(key: keyof SetInput['values'], label: string) {
    return <input aria-label={`${name}, ${label}`} aria-invalid={!!row.error} type="text" inputMode={key === 'reps' || key === 'rir' ? 'numeric' : 'decimal'} enterKeyHint="next" maxLength={128} placeholder="—" value={row.input.values[key]} disabled={disabled} onChange={event => onChange({ ...row.input, values: { ...row.input.values, [key]: event.target.value } })} onBlur={onSave} />
  }
  const previousInput = previous ? convertInputUnit(inputFromSet(previous), row.input.weightUnit) : undefined
  const previousText = previousInput ? `${hasWeight ? `${previousInput.values.weight} × ` : ''}${config.measurement === 'reps' ? previousInput.values.reps : `${previousInput.values.durationSeconds}s`}` : '—'
  return <div className={`inline-set ${set.completed ? 'is-complete' : ''}`}>
    <div className="inline-set__cells" role="group" aria-label={name}>
      <select className="set-type" aria-label={`${name}, set type`} value={set.setType} disabled={disabled || row.saving > 0} onChange={event => onType(event.target.value as StrengthSet['setType'])}>
        {Object.entries(types).map(([value, label]) => <option key={value} value={value}>{value === 'normal' ? index + 1 : short[value as keyof typeof short]} · {label}</option>)}
      </select>
      <button className="previous-value" aria-label={`${name}, copy previous ${previousText}`} disabled={disabled || !previousInput} onClick={() => previousInput && onChange({ ...previousInput, values: { ...previousInput.values, rpe: row.input.values.rpe, rir: row.input.values.rir } })}>{previousText}</button>
      {hasWeight ? field('weight', `${weightLabel} (${row.input.weightUnit})`) : <span className="bodyweight-cell">{config.load === 'bodyweight' ? 'BW' : '—'}</span>}
      {config.measurement === 'reps' ? field('reps', 'Reps') : field('durationSeconds', 'Duration (seconds)')}
      <button className="set-check" role="checkbox" aria-checked={set.completed} aria-label={`${name}, complete`} disabled={disabled} onClick={onComplete}>{set.completed ? '✓' : <span aria-hidden="true">○</span>}</button>
    </div>
    <div className="inline-set__meta"><button className="row-details" aria-expanded={details} onClick={() => setDetails(!details)}>{details ? 'Less' : 'Details'}{!details && (row.input.values.rpe || row.input.values.rir) ? ` · ${row.input.values.rpe ? `RPE ${row.input.values.rpe}` : ''}${row.input.values.rir ? ` RIR ${row.input.values.rir}` : ''}` : ''}</button><span role="status">{hasWeight ? `${row.input.weightUnit} · ` : ''}{row.saving ? 'Saving…' : row.dirty ? 'Not saved yet' : row.pending ? 'Changes pending' : set.completed ? 'Completed' : 'Incomplete'}</span></div>
    {(row.error || unitError) && <p className="inline-error" role="alert">{unitError || row.error} <button className="row-details" onClick={onSave} disabled={disabled}>Retry</button></p>}
    {set.target && <p className="note set-target">Target: {set.target.reps ? `${set.target.reps.min}–${set.target.reps.max} reps` : set.target.durationSeconds ? `${set.target.durationSeconds.min}–${set.target.durationSeconds.max}s` : 'Prescription saved'}</p>}
    {details && <div className="set-details">
      <div className="set-input-grid"><label>RPE (optional){field('rpe', 'RPE')}</label><label>RIR (optional){field('rir', 'RIR')}</label>
        {['bodyweight', 'added', 'assisted'].includes(config.load) && <label>Bodyweight ({row.input.weightUnit}, optional){field('bodyweight', 'Bodyweight')}</label>}
        {config.measurement !== 'duration' && <label>Duration (seconds, optional){field('durationSeconds', 'Duration (seconds)')}</label>}
      </div>
      {config.load !== 'none' && <label>Weight unit<select aria-label={`${name}, weight unit`} value={row.input.weightUnit} disabled={disabled} onChange={event => { try { onChange(convertInputUnit(row.input, event.target.value as 'kg' | 'lb')); setUnitError('') } catch { setUnitError('Fix the weight before converting units.') } }}><option value="kg">kg</option><option value="lb">lb</option></select></label>}
      <div className="actions"><button className="secondary" disabled={disabled || index === 0} onClick={() => onMove(-1)}>Move up</button><button className="secondary" disabled={disabled || last} onClick={() => onMove(1)}>Move down</button><button className="secondary" disabled={disabled} onClick={onRemove}>Remove set</button>{row.pending && <button className="secondary" disabled={disabled || row.saving > 0} onClick={onRevert}>Revert pending edits</button>}</div>
    </div>}
  </div>
}
