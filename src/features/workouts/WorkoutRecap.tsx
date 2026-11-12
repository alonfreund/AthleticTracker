import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { readWorkoutRecapRecords } from '../../data/repositories/analytics'
import type { Workout } from '../../data/repositories/workouts'
import { isWorkingSet } from '../../domain/strength/analytics'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import type { WorkoutRecapRecord } from '../../domain/strength/workoutRecap'
import type { WeightUnit } from '../../domain/strength/models'
import { metricLabel, metricValueText } from '../analytics/metricText'
import { durationText } from './WorkoutHistory'

export function WorkoutRecap({ workout, onDone, onView }: {
  workout: Workout
  onDone: () => void
  onView: () => void
}) {
  const session = workout.sessions[0]
  const [records, setRecords] = useState<WorkoutRecapRecord[]>()
  const [error, setError] = useState(false)
  const [unit, setUnit] = useState<WeightUnit>('kg')
  const heading = useRef<HTMLHeadingElement>(null)
  const elapsed = Date.parse(session.endedAt!) - Date.parse(session.startedAt)
  const workingSets = workout.strengthSets.filter(isWorkingSet).length
  useEffect(() => {
    heading.current?.focus()
    let mounted = true
    void readWorkoutRecapRecords(workout).then(
      rows => { if (mounted) setRecords(rows) },
      () => { if (mounted) setError(true) },
    )
    return () => { mounted = false }
  }, [workout])

  return <section className="surface-card workout-recap" aria-labelledby="workout-recap-heading">
    <h2 id="workout-recap-heading" tabIndex={-1} ref={heading}>Workout recap</h2>
    <p><strong>{session.title}</strong></p>
    <dl className="monthly-totals">
      <div><dt>Session time</dt><dd>{elapsed > 0 && elapsed < 60000 ? '<1 min' : durationText(session.startedAt, session.endedAt!)}</dd></div>
      <div><dt>Working sets</dt><dd>{workingSets}</dd></div>
    </dl>
    <div className="actions">
      <Button onClick={onDone}>Done</Button>
      <Button variant="secondary" onClick={onView}>View workout</Button>
    </div>
    <h3 className="recap-record-heading">Personal records</h3>
    {!records && !error && <p role="status" className="note">Checking for personal records…</p>}
    {error && <p role="status" className="note">Personal records couldn’t be loaded. Your workout is saved.</p>}
    {records?.length === 0 && <p className="note">No new personal records this workout.</p>}
    {records?.some(({ metric }) => metric !== 'reps' && metric !== 'hold') && <label>Weight unit<select value={unit}
      onChange={event => setUnit(event.target.value as WeightUnit)}><option value="kg">kg</option><option value="lb">lb</option></select></label>}
    {!!records?.length && <ul className="recap-records">
      {records.map(({ exerciseKey, snapshot, metric, previous, current }) => <li key={`${exerciseKey}:${metric}`}>
        <Icon name="medal" />
        <div><strong>{exerciseDisplayName(snapshot)}</strong><span>{metricLabel(metric, snapshot)}</span>
          <span>{metricValueText(previous, metric, unit, snapshot)} <span aria-hidden="true">→</span><span className="sr-only"> to </span> {metricValueText(current, metric, unit, snapshot)}</span>
        </div>
      </li>)}
    </ul>}
  </section>
}
