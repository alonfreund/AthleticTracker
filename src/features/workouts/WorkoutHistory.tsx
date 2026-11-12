import { useEffect, useRef } from 'react'
import { Button } from '../../components/ui/Button'
import { groupLetter, supersetSlots, workoutBlocks } from '../../domain/strength/supersets'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { SET_TYPES } from '../../domain/strength/setTypes'
import type { Exercise, SessionExercise } from '../../domain/strength/models'
import type { Workout } from '../../data/repositories/workouts'
import { performanceText } from '../../domain/strength/logging'
import { trackingLabel } from '../../domain/strength/catalog'
export function durationText(start: string, end: string) {
  const minutes = Math.max(0, Math.floor((Date.parse(end) - Date.parse(start)) / 60000))
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`
}
export function WorkoutHistory({ workout, onBack, backLabel = 'Back to Train', disabled, message, error, onEdit, onDelete, onExerciseAnalytics }: {
  workout: Workout; onBack: () => void; backLabel?: string; disabled?: boolean; message?: string; error?: string
  onExerciseAnalytics?: (exercise: Exercise) => void
  onEdit?: () => void; onDelete?: () => void
}) {
  const session = workout.sessions[0]
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [session.id])
  const blocks = workoutBlocks(workout)
  const groups = blocks.filter(block => block.group)
  function exerciseCard(exercise: SessionExercise, code?: string) {
    const Heading = code ? 'h4' : 'h3'
    return <article className={code ? 'superset-exercise' : 'workout-exercise'} key={exercise.id}>
      <Heading>{code && <span className="superset-member-label">{code} </span>}{exerciseDisplayName(exercise.snapshot)}</Heading>
      <p className="note">{trackingLabel(exercise.snapshot.tracking)}</p>
      {session.status === 'finished' && onExerciseAnalytics && <Button variant="secondary" disabled={disabled}
        aria-label={`View analytics for ${exerciseDisplayName(exercise.snapshot)}`} onClick={() => onExerciseAnalytics(exercise.snapshot)}>View analytics</Button>}
      {exercise.notes && <p className="multiline">{exercise.notes}</p>}
      <ol>{workout.strengthSets.filter(set => set.sessionExerciseId === exercise.id).sort((a, b) => a.position - b.position).map(set => <li key={set.id}>
        {set.supersetRoundIndex !== undefined && <>Round {set.supersetRoundIndex + 1} · </>}<strong>{set.completed ? 'Completed' : 'Incomplete — excluded from results'}</strong> · <span className={`set-type-badge set-type-colour set-type--${set.setType}`}>{SET_TYPES[set.setType]}</span><br />{performanceText(set)}
      </li>)}</ol>
    </article>
  }
  return <section aria-label="Workout details" className="workout-history">
    <button className="secondary" disabled={disabled} onClick={onBack}>{backLabel}</button>
    <p className="eyebrow">{session.status === 'cancelled' ? 'CANCELLED WORKOUT' : 'FINISHED WORKOUT'}</p>
    <h2 ref={heading} tabIndex={-1}>{session.title}</h2>
    <p>{new Date(session.startedAt).toLocaleString()} · {durationText(session.startedAt, session.endedAt!)}</p>
    <p>{workout.strengthSets.filter(set => set.completed).length} completed sets</p>
    {session.notes && <p className="multiline">{session.notes}</p>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {session.status === 'finished' && (onEdit || onDelete) && <div className="actions">
      {onEdit && <Button variant="secondary" disabled={disabled} onClick={onEdit}>Edit workout</Button>}
      {onDelete && <Button variant="danger" disabled={disabled} onClick={onDelete}>Delete workout</Button>}
    </div>}
    {blocks.map(block => {
      if (!block.group) return exerciseCard(block.exercises[0])
      const code = groupLetter(groups.findIndex(row => row.id === block.id))
      return <section className="workout-exercise superset-group" key={block.id} aria-label={`Superset ${code}`}>
        <h3>Superset {code}</h3>
        {supersetSlots(block.exercises).map((slot, index) => slot.map(exercise => exerciseCard(exercise, code + (index + 1))))}
      </section>
    })}

  </section>
}
