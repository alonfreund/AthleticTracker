import { useEffect, useLayoutEffect, useState } from 'react'
import type { ExerciseInput } from '../../data/repositories/exercises'
import type { Tracking } from '../../domain/strength/models'
import { CATEGORIES, CONVENTION_LABELS, EQUIPMENT, LOAD_LABELS, MUSCLES } from '../../domain/strength/catalog'

const initial = { name: '', primary: [] as string[], secondary: [] as string[], equipment: [] as string[], otherEquipment: '', category: 'compound', instructions: '', notes: '', measurement: 'reps' as Tracking['measurement'], load: 'external' as Tracking['load'], convention: 'total' as NonNullable<Tracking['weightConvention']>, rest: '' }
export function CustomExerciseForm({ disabled, onDirty, onSave, onCancel }: {
  disabled: boolean; onDirty: (dirty: boolean) => void; onSave: (input: ExerciseInput) => Promise<void>; onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  useLayoutEffect(() => { onDirty(dirty) }, [dirty, onDirty])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])
  function toggle(field: 'primary' | 'secondary' | 'equipment', id: string) {
    setForm({ ...form, [field]: form[field].includes(id) ? form[field].filter(value => value !== id) : [...form[field], id] })
  }
  const hasLoad = ['external', 'added', 'assisted'].includes(form.load)
  return <form className="custom-form" onSubmit={event => {
    event.preventDefault(); setError('')
    const rest = form.rest.trim() === '' ? null : Number(form.rest)
    if (rest !== null && (!Number.isFinite(rest) || rest < 0)) { setError('Default rest must be zero or more seconds, or left blank.'); return }
    const extra = form.otherEquipment.split(',').map(value => value.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean)
    void onSave({
      name: form.name, primaryMuscleGroupIds: form.primary, secondaryMuscleGroupIds: form.secondary,
      equipmentIds: [...new Set([...form.equipment, ...extra])], category: form.category,
      instructions: form.instructions, notes: form.notes,
      tracking: { measurement: form.measurement, load: form.load, weightConvention: hasLoad ? form.convention : null },
      defaultRestSeconds: rest,
    })
  }}>
    <h2>Create custom exercise</h2>
    <p>Choose how this exercise is tracked in your workouts.</p>
    <fieldset disabled={disabled} className="form-fields">
      <label htmlFor="exercise-name">Exercise name</label>
      <input id="exercise-name" value={form.name} maxLength={200} required onChange={event => setForm({ ...form, name: event.target.value })} />
      <fieldset className="choices"><legend>Primary muscle groups — choose at least one</legend>
        <div className="choice-grid">{Object.entries(MUSCLES).map(([id, name]) => <label key={id}><input type="checkbox" checked={form.primary.includes(id)} disabled={form.secondary.includes(id)} onChange={() => toggle('primary', id)} aria-label={`${name} (primary)`} />{name}</label>)}</div>
      </fieldset>
      <details><summary>Secondary muscle groups (optional)</summary><fieldset className="choices"><legend>Secondary muscle groups</legend>
        <div className="choice-grid">{Object.entries(MUSCLES).map(([id, name]) => <label key={id}><input type="checkbox" checked={form.secondary.includes(id)} disabled={form.primary.includes(id)} onChange={() => toggle('secondary', id)} aria-label={`${name} (secondary)`} />{name}</label>)}</div>
      </fieldset></details>
      <p className="note">A muscle can be primary or secondary, not both.</p>
      <fieldset className="choices"><legend>Equipment (optional)</legend>
        <div className="choice-grid">{Object.entries(EQUIPMENT).map(([id, name]) => <label key={id}><input type="checkbox" checked={form.equipment.includes(id)} onChange={() => toggle('equipment', id)} aria-label={`${name} (equipment)`} />{name}</label>)}</div>
      </fieldset>
      <label htmlFor="other-equipment">Other equipment (comma-separated, optional)</label>
      <input id="other-equipment" value={form.otherEquipment} maxLength={500} onChange={event => setForm({ ...form, otherEquipment: event.target.value })} />
      <label htmlFor="exercise-category">Category</label>
      <input id="exercise-category" list="exercise-categories" value={form.category} maxLength={100} required onChange={event => setForm({ ...form, category: event.target.value })} />
      <datalist id="exercise-categories">{Object.entries(CATEGORIES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</datalist>
      <fieldset className="choices"><legend>Tracking configuration</legend>
        <label htmlFor="exercise-measurement">Measure</label>
        <select id="exercise-measurement" value={form.measurement} onChange={event => setForm({ ...form, measurement: event.target.value as Tracking['measurement'] })}>
          <option value="reps">Repetitions</option><option value="duration">Duration / timed hold</option>
        </select>
        <label htmlFor="exercise-load">Load tracking</label>
        <select id="exercise-load" value={form.load} onChange={event => {
          const load = event.target.value as Tracking['load']
          setForm({ ...form, load, convention: load === 'assisted' ? 'machine-display' : 'total' })
        }}>{Object.entries(LOAD_LABELS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
        {hasLoad && <><label htmlFor="weight-convention">Weight convention</label>
          <select id="weight-convention" value={form.convention} onChange={event => setForm({ ...form, convention: event.target.value as typeof form.convention })}>
            {Object.entries(CONVENTION_LABELS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select></>}
        <p className="note">Added load and assistance use positive amounts separate from bodyweight. Set weights will retain their entered kg or lb unit.</p>
      </fieldset>
      <label htmlFor="exercise-rest">Default rest (seconds; blank to use global default)</label>
      <input id="exercise-rest" type="number" min="0" step="1" inputMode="numeric" value={form.rest} onChange={event => setForm({ ...form, rest: event.target.value })} />
      <label htmlFor="exercise-instructions">Instructions (optional)</label>
      <textarea id="exercise-instructions" value={form.instructions} maxLength={10000} onChange={event => setForm({ ...form, instructions: event.target.value })} />
      <label htmlFor="exercise-notes">Personal notes (optional)</label>
      <textarea id="exercise-notes" value={form.notes} maxLength={10000} onChange={event => setForm({ ...form, notes: event.target.value })} />
    </fieldset>
    <p className="note">{dirty ? 'Unsaved exercise — save or cancel before leaving.' : 'No unsaved changes.'}</p>
    {error && <p role="alert" className="error">{error}</p>}
    <div className="actions"><button type="submit" disabled={disabled}>Save exercise</button><button type="button" className="secondary" disabled={disabled} onClick={onCancel}>Cancel</button></div>
  </form>
}
