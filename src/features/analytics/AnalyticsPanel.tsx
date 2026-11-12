import { TrainingTrendsPanel } from './TrainingTrendsPanel'
import { MonthlyReportPanel } from './MonthlyReportPanel'
import { metricLabel, metricValueText } from './metricText'
import { MuscleDistributionPanel } from './MuscleDistributionPanel'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { readExerciseAnalytics } from '../../data/repositories/analytics'
import { exerciseProgress, type AnalyticsExercise, type Metric } from '../../domain/strength/analytics'
import { trackingLabel } from '../../domain/strength/catalog'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { performanceText } from '../../domain/strength/logging'
import type { WeightUnit } from '../../domain/strength/models'
import { SET_TYPES } from '../../domain/strength/setTypes'

const date = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const PAGE_SIZE = 10

function ExerciseProgress({ exercise, onOpenWorkout }: { exercise: AnalyticsExercise; onOpenWorkout: (id: string) => void }) {
  const series = useMemo(() => exerciseProgress(exercise), [exercise])
  const [metric, setMetric] = useState<Metric>(series[0]?.metric ?? 'reps')
  const [unit, setUnit] = useState<WeightUnit>('kg')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [pointCount, setPointCount] = useState(12)
  const selected = series.find(entry => entry.metric === metric) ?? series[0]
  const points = selected?.points.slice(-pointCount) ?? []
  const chartMax = points.reduce((max, point) => Math.max(max, point.value), 0)
  const added = exercise.snapshot.tracking.load === 'added'
  const label = (key: Metric) => metricLabel(key, exercise.snapshot)
  return <>
    <section className="surface-card analytics-card" aria-labelledby="analytics-progress">
      <h2 id="analytics-progress">Progress</h2>
      <div className="analytics-controls">
        <label>Metric<select value={selected?.metric ?? ''} onChange={event => setMetric(event.target.value as Metric)}>
          {series.map(({ metric }) => <option key={metric} value={metric}>{label(metric)}</option>)}
        </select></label>
        {series.some(({ metric }) => metric !== 'hold' && metric !== 'reps') && <label>Weight unit<select value={unit} onChange={event => setUnit(event.target.value as WeightUnit)}><option value="kg">kg</option><option value="lb">lb</option></select></label>}
        <label>Sessions<select value={pointCount} onChange={event => setPointCount(Number(event.target.value))}><option value={12}>Last 12</option><option value={30}>Last 30</option><option value={90}>Last 90</option></select></label>
      </div>
      {selected && <figure className="analytics-chart">
        <figcaption>{label(selected.metric)} · {points.length} {points.length === 1 ? 'session' : 'sessions'}</figcaption>
        <ol aria-label={`${label(selected.metric)} by session, oldest first`}>
          {points.map(point => <li key={point.session.id}>
            <time dateTime={point.session.startedAt} aria-label={date.format(new Date(point.session.startedAt))}>{shortDate.format(new Date(point.session.startedAt))}</time>
            <span className="analytics-bar" aria-hidden="true"><span style={{ width: `${chartMax ? point.value / chartMax * 100 : 0}%` }} /></span>
            <strong>{metricValueText(point.value, selected.metric, unit, exercise.snapshot)}</strong>
          </li>)}
        </ol>
      </figure>}
      {selected?.metric === 'estimatedMax' && <p className="note">Epley estimate for sets of 2–10 reps. A single rep uses the load you lifted.</p>}
      {selected?.metric === 'assistance' && <p className="note">Less assistance is better.</p>}
      {selected?.metric === 'volume' && <p className="note">{added ? 'Volume uses added load only. ' : ''}Volume adds up load × reps across working sets, including both sides for per-hand or per-side logging.</p>}
    </section>
    <section className="surface-card analytics-card" aria-labelledby="analytics-records">
      <h2 id="analytics-records">Personal records</h2>
      <ul className="exercise-list analytics-records">
        {series.map(({ metric, record }) => <li key={metric}>
          <button className="exercise-row" onClick={() => onOpenWorkout(record.session.id)}>
            <span>{label(metric)}</span>
            <strong>{metricValueText(record.value, metric, unit, exercise.snapshot)}</strong>
            <span>{record.session.title} · {date.format(new Date(record.session.startedAt))}</span>
            {record.set && <span>{performanceText(record.set)}</span>}
          </button>
        </li>)}
      </ul>
    </section>
    <section className="surface-card analytics-card" aria-labelledby="analytics-history">
      <h2 id="analytics-history">Exercise history</h2>
      <p className="note">Completed working sets from finished workouts.</p>
      <ul className="exercise-list analytics-history">
        {exercise.sessions.slice(-limit).reverse().map(session => <li key={session.id}>
          <details>
            <summary>{session.title} · {date.format(new Date(session.startedAt))} · {session.sets.length} {session.sets.length === 1 ? 'set' : 'sets'}</summary>
            <ol>{session.sets.map(set => <li key={set.id}>{SET_TYPES[set.setType]} · {performanceText(set)}</li>)}</ol>
            <Button variant="secondary" onClick={() => onOpenWorkout(session.id)}>Open workout</Button>
          </details>
        </li>)}
      </ul>
      {limit < exercise.sessions.length && <Button variant="secondary" onClick={() => setLimit(limit + PAGE_SIZE)}>Show older sessions</Button>}
    </section>
  </>
}

export function AnalyticsPanel({ onOpenWorkout }: { onOpenWorkout: (id: string) => void }) {
  const [view, setView] = useState<'exercises' | 'muscles' | 'monthly' | 'trends'>('exercises')
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty: false, busy: false, restoring: false, loading: false })
  }, [])
  return <>
    <div className="analytics-view-controls" role="group" aria-label="Analytics views">
      <Button variant={view === 'exercises' ? 'primary' : 'secondary'} aria-pressed={view === 'exercises'} onClick={() => setView('exercises')}>Exercises</Button>
      <Button variant={view === 'muscles' ? 'primary' : 'secondary'} aria-pressed={view === 'muscles'} onClick={() => setView('muscles')}>Muscle distribution</Button>
      <Button variant={view === 'monthly' ? 'primary' : 'secondary'} aria-pressed={view === 'monthly'} onClick={() => setView('monthly')}>Monthly report</Button>
      <Button variant={view === 'trends' ? 'primary' : 'secondary'} aria-pressed={view === 'trends'} onClick={() => setView('trends')}>Training trends</Button>
    </div>
    {view === 'exercises' && <ExerciseAnalytics onOpenWorkout={onOpenWorkout} />}
    {view === 'muscles' && <MuscleDistributionPanel />}
    {view === 'monthly' && <MonthlyReportPanel onOpenWorkout={onOpenWorkout} />}
    {view === 'trends' && <TrainingTrendsPanel />}
  </>
}

function ExerciseAnalytics({ onOpenWorkout }: { onOpenWorkout: (id: string) => void }) {
  const [exercises, setExercises] = useState<AnalyticsExercise[]>()
  const [error, setError] = useState(false)
  const [exerciseKey, setExerciseKey] = useState('')
  useEffect(() => {
    const subscription = liveQuery(() => readExerciseAnalytics()).subscribe({
      next: rows => setExercises(rows),
      error: () => setError(true),
    })
    return () => subscription.unsubscribe()
  }, [])
  if (error) return <p role="alert" className="error">Could not read exercise history. Reopen Analytics to try again.</p>
  if (!exercises) return <p role="status">Opening exercise history…</p>
  const exercise = exercises.find(row => row.key === exerciseKey) ?? exercises[0]
  if (!exercise) return <p className="surface-card">Complete a working set and finish a workout to see your exercise progress here.</p>
  const counts = new Map<string, number>()
  for (const row of exercises) counts.set(row.snapshot.id, (counts.get(row.snapshot.id) ?? 0) + 1)
  return <>
    <section className="surface-card analytics-card" aria-label="Choose an exercise">
      <label>Exercise<select value={exercise.key} onChange={event => setExerciseKey(event.target.value)}>
        {exercises.map(row => {
          const { snapshot } = row
          const convention = snapshot.metadata?.repetitionConvention === 'per-side' ? ', reps per side' : ''
          return <option key={row.key} value={row.key}>{exerciseDisplayName(snapshot)}{counts.get(snapshot.id)! > 1 ? ` · ${trackingLabel(snapshot.tracking)}${convention}` : ''}</option>
        })}
      </select></label>
    </section>
    <ExerciseProgress key={exercise.key} exercise={exercise} onOpenWorkout={onOpenWorkout} />
  </>
}
