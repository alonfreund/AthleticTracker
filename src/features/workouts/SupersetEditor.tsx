import { supersetSlots } from '../../domain/strength/supersets'
import { useEffect, useRef, useState } from 'react'
import type { SessionExercise } from '../../domain/strength/models'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'

export function SupersetEditor({ exercises, initialIds, groupId, disabled, onDirty, onSave, onCancel }: {
  exercises: SessionExercise[]
  initialIds: string[]
  groupId?: string
  disabled: boolean
  onDirty: () => void
  onSave: (ids: string[]) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState(initialIds)
  const slots = supersetSlots(exercises)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  return <section className="superset-editor" aria-labelledby="superset-editor-title">
    <h2 id="superset-editor-title" ref={heading} tabIndex={-1}>{groupId ? 'Edit superset exercises' : 'Create superset'}</h2>
    <p>Choose at least two exercises. They will move together in this workout.</p>
    <fieldset disabled={disabled}>
      <legend>Exercises in this workout</legend>
      {slots.map(slot => {
        const exercise = slot[0]
        const ids = slot.map(row => row.id)
        const unavailable = exercise.supersetGroupId !== null && exercise.supersetGroupId !== groupId
        return <label className="superset-choice" key={exercise.id}>
          <input type="checkbox" checked={selected.includes(exercise.id)} disabled={unavailable}
            onChange={event => {
              onDirty()
              setSelected(event.target.checked ? [...selected, ...ids] : selected.filter(id => !ids.includes(id)))
            }} />
          <span>{slot.map(row => exerciseDisplayName(row.snapshot)).join(' → ')}{unavailable && <small>Already in another superset</small>}</span>
        </label>
      })}
    </fieldset>
    <div className="actions">
      <button disabled={disabled || slots.filter(slot => selected.includes(slot[0].id)).length < 2} onClick={() => onSave(selected)}>Save superset</button>
      <button className="secondary" disabled={disabled} onClick={onCancel}>Cancel</button>
    </div>
  </section>
}
