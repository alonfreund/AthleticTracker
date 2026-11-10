import type { Workout } from '../../data/repositories/workouts'
import { performanceText } from '../../domain/strength/logging'
import { trackingLabel } from '../../domain/strength/catalog'
export function durationText(start: string, end: string) {
  const minutes = Math.max(0, Math.floor((Date.parse(end) - Date.parse(start)) / 60000))
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`
}
export function WorkoutHistory({ workout, onBack }: { workout: Workout; onBack: () => void }) {
  const session = workout.sessions[0]
  return <section aria-label="Workout details">
    <button className="secondary" onClick={onBack}>Back to workouts</button>
    <p className="eyebrow">{session.status === 'cancelled' ? 'CANCELLED WORKOUT' : 'FINISHED WORKOUT'}</p>
    <h2>{session.title}</h2>
    <p>{new Date(session.startedAt).toLocaleString()} · {durationText(session.startedAt, session.endedAt!)}</p>
    <p>{workout.strengthSets.filter(set => set.completed).length} completed sets</p>
    {session.notes && <p className="multiline">{session.notes}</p>}
    {workout.sessionExercises.map(exercise => <article className="workout-exercise" key={exercise.id}>
      <h3>{exercise.snapshot.name}</h3><p className="note">{trackingLabel(exercise.snapshot.tracking)}</p>
      {exercise.notes && <p className="multiline">{exercise.notes}</p>}
      <ol>{workout.strengthSets.filter(set => set.sessionExerciseId === exercise.id).sort((a, b) => a.position - b.position).map(set => <li key={set.id}>
        <strong>{set.completed ? 'Completed' : 'Incomplete — excluded from results'}</strong> · {set.setType}<br />{performanceText(set)}
      </li>)}</ol>
    </article>)}
  </section>
}
