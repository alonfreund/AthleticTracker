import { db } from '../../data/db/database'
import type { MovementDiscipline } from '../../domain/strength/models'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { recentExerciseHistory, type ExerciseHistorySession } from '../../data/repositories/workouts'
import { performanceText } from '../../domain/strength/logging'
import { Icon } from '../../components/ui/Icon'
import { SET_TYPES } from '../../domain/strength/setTypes'

export function ExerciseHistory({ exerciseId, name, heading, menu, disabled, discipline = 'strength' }: {
  exerciseId: string
  name: string
  heading: ReactNode
  menu: ReactNode
  disabled: boolean
  discipline?: MovementDiscipline
}) {
  const panelId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  return <>
    <div className="exercise-card-heading">
      {heading}
      <div className="exercise-card-actions">
        <button ref={trigger} type="button" className="exercise-history-button" disabled={disabled}
          aria-label={`Exercise history for ${name}`} aria-expanded={open} aria-controls={panelId}
          onClick={() => setOpen(!open)}>
          <Icon name="history" />
        </button>
        {menu}
      </div>
    </div>
    <div id={panelId} hidden={!open}>
      {open && <ExerciseHistoryPanel key={exerciseId} discipline={discipline} exerciseId={exerciseId} name={name} onClose={() => {
        setOpen(false)
        trigger.current?.focus()
      }} />}
    </div>
  </>
}

function ExerciseHistoryPanel({ exerciseId, name, onClose, discipline }: {
  discipline: MovementDiscipline
  exerciseId: string
  name: string
  onClose: () => void
}) {
  const [sessions, setSessions] = useState<ExerciseHistorySession[]>()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let mounted = true
    void recentExerciseHistory(exerciseId, db, discipline).then(
      history => { if (mounted) setSessions(history) },
      () => { if (mounted) setFailed(true) },
    )
    return () => { mounted = false }
  }, [exerciseId, discipline])

  return <section className="exercise-history-panel" aria-label={`Recent sessions for ${name}`}>
    {failed && <p role="alert">Could not load exercise history. Close it and try again.</p>}
    {!failed && !sessions && <p role="status">Loading exercise history…</p>}
    {sessions?.length === 0 && <p role="status">No completed sets for this exercise in finished workouts.</p>}
    {sessions?.map(session => <article key={session.id}>
      <p className="exercise-history-session">
        <strong>{session.title}</strong>
        <time dateTime={session.startedAt}>{new Date(session.startedAt).toLocaleDateString()}</time>
      </p>
      <ol>{session.sets.map(set => <li key={set.id}>
        <span className={`set-type-badge set-type-colour set-type--${set.setType}`}>{SET_TYPES[set.setType]}</span>
        {' '}{performanceText(set)}
      </li>)}</ol>
    </article>)}
    <button type="button" className="secondary" onClick={onClose}>Close exercise history</button>
  </section>
}
