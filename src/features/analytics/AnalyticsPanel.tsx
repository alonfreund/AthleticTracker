import { RecordsBoard } from './RecordsBoard'
import { AnalyticsOverview } from './AnalyticsOverview'
import { ExerciseChart } from './ExerciseChart'
import { EXERCISE_RANGES, frequencyTimeline, timelineRange, type ExerciseRange } from '../../domain/strength/exerciseTimeline'
import { TrainingTrendsPanel } from './TrainingTrendsPanel'
import { MonthlyReportPanel } from './MonthlyReportPanel'
import { metricLabel, metricValueText } from './metricText'
import { MuscleDistributionPanel } from './MuscleDistributionPanel'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { readExerciseAnalytics } from '../../data/repositories/analytics'
import { analyticsExerciseKey, exerciseProgress, type AnalyticsExercise, type Metric } from '../../domain/strength/analytics'
import { trackingLabel } from '../../domain/strength/catalog'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { performanceText } from '../../domain/strength/logging'
import type { Exercise, WeightUnit } from '../../domain/strength/models'
import { SET_TYPES } from '../../domain/strength/setTypes'

const date = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
const monthDate = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' })
const PAGE_SIZE = 10
type ChartMetric = Metric | 'frequency'

function ExerciseProgress({ exercise, onOpenWorkout }: { exercise: AnalyticsExercise; onOpenWorkout: (id: string) => void }) {
  const series = useMemo(() => exerciseProgress(exercise), [exercise])
  const [chosenMetric, setMetric] = useState<ChartMetric>(series[0]?.metric ?? 'frequency')
  const metric = chosenMetric === 'frequency' || series.some(entry => entry.metric === chosenMetric) ? chosenMetric : series[0]?.metric ?? 'frequency'
  const [unit, setUnit] = useState<WeightUnit>('kg')
  const [range, setRange] = useState<ExerciseRange>('3')
  const [normalOnly, setNormalOnly] = useState(false)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const now = new Date()
  const { from, before } = timelineRange(range, now)
  const sessions = exercise.sessions.filter(session => {
    const at = new Date(session.startedAt)
    return at < before && (!from || at >= from)
  })
  const eligible = normalOnly ? sessions.flatMap(session => {
    const sets = session.sets.filter(set => set.setType === 'normal')
    return sets.length ? [{ ...session, sets }] : []
  }) : sessions
  const selected = metric === 'frequency' ? undefined : exerciseProgress({ ...exercise, sessions: eligible }).find(entry => entry.metric === metric)
  const points = selected?.points.map(point => ({
    ...point, at: Date.parse(point.session.startedAt), label: date.format(new Date(point.session.startedAt)), source: point.session.title,
  })) ?? []
  const frequency = metric === 'frequency' ? frequencyTimeline(eligible, range, now).map(bucket => ({
    ...bucket, value: bucket.sessions.length,
    label: range === '12' || range === 'all' ? monthDate.format(new Date(bucket.at)) : `Week of ${date.format(new Date(bucket.at))}`,
  })) : []
  const added = exercise.snapshot.tracking.load === 'added'
  const label = (key: Metric) => metricLabel(key, exercise.snapshot)
  const chartKey = `${range}:${metric}:${normalOnly}`
  return <>
    <section className="surface-card analytics-card" aria-labelledby="analytics-progress">
      <h2 id="analytics-progress">{exerciseDisplayName(exercise.snapshot)}</h2>
      <p className="note">{trackingLabel(exercise.snapshot.tracking)}{exercise.snapshot.metadata?.repetitionConvention === 'per-side' ? ' · Reps per side' : ''}</p>
      <div className="analytics-controls">
        <label>Metric<select value={metric} onChange={event => setMetric(event.target.value as ChartMetric)}>
          {series.map(({ metric }) => <option key={metric} value={metric}>{label(metric)}</option>)}
          <option value="frequency">Training frequency</option>
        </select></label>
        <label>Date range<select value={range} onChange={event => { setRange(event.target.value as ExerciseRange); setLimit(PAGE_SIZE) }}>
          {Object.entries(EXERCISE_RANGES).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select></label>
        {series.some(({ metric }) => metric !== 'hold' && metric !== 'reps') && <label>Weight unit<select value={unit} onChange={event => setUnit(event.target.value as WeightUnit)}><option value="kg">kg</option><option value="lb">lb</option></select></label>}
      </div>
      <label className="exercise-chart-filter"><input type="checkbox" checked={normalOnly} onChange={event => setNormalOnly(event.target.checked)} /> Normal sets only</label>
      {metric === 'frequency' ? <ExerciseChart key={chartKey} points={frequency} title="Training frequency" bars
        format={value => `${value} ${value === 1 ? 'workout' : 'workouts'}`}
        details={point => <><p role="status">{point.label} · {point.value} {point.value === 1 ? 'workout' : 'workouts'}</p>
          {!!point.sessions.length && <ul className="exercise-list">{point.sessions.map(session => <li key={session.id}>
            <button className="exercise-row" onClick={() => onOpenWorkout(session.id)}>{session.title} · {date.format(new Date(session.startedAt))}</button>
          </li>)}</ul>}</>} />
        : <ExerciseChart key={chartKey} points={points} title={label(metric)} bars={metric === 'volume'}
          format={value => metricValueText(value, metric, unit, exercise.snapshot)}
          details={point => <><p role="status"><strong>{metricValueText(point.value, metric, unit, exercise.snapshot)}</strong> · {point.session.title} · {point.label}</p>
            {point.set ? <p>{SET_TYPES[point.set.setType]} · {performanceText(point.set)}</p> : <ol>{point.session.sets.map(set => (
              <li key={set.id}>{SET_TYPES[set.setType]} · {performanceText(set)}</li>
            ))}</ol>}
            <Button variant="secondary" onClick={() => onOpenWorkout(point.session.id)}>Open workout</Button>
          </>} />}
      {metric === 'estimatedMax' && <p className="note">Epley estimate for sets of 2–10 reps. A single rep uses the load you lifted.</p>}
      {metric === 'load' && exercise.snapshot.tracking.weightConvention === 'machine-display' && <p className="note">Values are the machine’s recorded display setting.</p>}
      {metric === 'assistance' && <p className="note">Less assistance is better.</p>}
      {metric === 'volume' && <p className="note">{added ? 'Volume uses added load only. ' : ''}Volume adds load × reps across working sets, counting both implements when the saved convention supports it.</p>}
    </section>
    <section className="surface-card analytics-card" aria-labelledby="analytics-records">
      <h2 id="analytics-records">All-time records</h2>
      {!series.length && <p className="note">No records yet. Complete a working set and finish a workout.</p>}
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
      <p className="note">Completed working sets from finished workouts in this date range.</p>
      {!sessions.length && <p className="note">No exercise history in this range.</p>}
      <ul className="exercise-list analytics-history">
        {sessions.slice(-limit).reverse().map(session => <li key={session.id}>
          <details>
            <summary>{session.title} · {date.format(new Date(session.startedAt))} · {session.sets.length} {session.sets.length === 1 ? 'set' : 'sets'}</summary>
            <ol>{session.sets.map(set => <li key={set.id}>{SET_TYPES[set.setType]} · {performanceText(set)}</li>)}</ol>
            <Button variant="secondary" onClick={() => onOpenWorkout(session.id)}>Open workout</Button>
          </details>
        </li>)}
      </ul>
      {limit < sessions.length && <Button variant="secondary" onClick={() => setLimit(limit + PAGE_SIZE)}>Show older sessions</Button>}
    </section>
  </>
}

export function AnalyticsPanel({ onOpenWorkout, initialExercise }: { initialExercise?: Exercise; onOpenWorkout: (id: string) => void }) {
  const [view, setView] = useState<'overview' | 'exercises' | 'muscles' | 'monthly' | 'trends'>(initialExercise ? 'exercises' : 'overview')
  const [focusedExercise, setFocusedExercise] = useState(initialExercise)
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty: false, busy: false, restoring: false, loading: false })
  }, [])
  return <>
    <div className="analytics-view-controls" role="group" aria-label="Analytics views">
      <Button variant={view === 'overview' ? 'primary' : 'secondary'} aria-pressed={view === 'overview'} onClick={() => setView('overview')}>Overview</Button>
      <Button variant={view === 'exercises' ? 'primary' : 'secondary'} aria-pressed={view === 'exercises'} onClick={() => setView('exercises')}>Exercises</Button>
      <Button variant={view === 'muscles' ? 'primary' : 'secondary'} aria-pressed={view === 'muscles'} onClick={() => setView('muscles')}>Muscle distribution</Button>
      <Button variant={view === 'monthly' ? 'primary' : 'secondary'} aria-pressed={view === 'monthly'} onClick={() => setView('monthly')}>Monthly report</Button>
      <Button variant={view === 'trends' ? 'primary' : 'secondary'} aria-pressed={view === 'trends'} onClick={() => setView('trends')}>Training trends</Button>
    </div>
    {view === 'overview' && <AnalyticsOverview onMuscles={() => setView('muscles')} onExercise={exercise => { setFocusedExercise(exercise); setView('exercises') }} />}
    {view === 'exercises' && <ExerciseAnalytics initialExercise={focusedExercise} onOpenWorkout={onOpenWorkout} />}
    {view === 'muscles' && <MuscleDistributionPanel />}
    {view === 'monthly' && <MonthlyReportPanel onOpenWorkout={onOpenWorkout} />}
    {view === 'trends' && <TrainingTrendsPanel />}
  </>
}

function ExerciseAnalytics({ onOpenWorkout, initialExercise }: { initialExercise?: Exercise; onOpenWorkout: (id: string) => void }) {
  const [exercises, setExercises] = useState<AnalyticsExercise[]>()
  const [showRecords, setShowRecords] = useState(false)
  const browse = useRef<HTMLButtonElement>(null)
  const [error, setError] = useState(false)
  const [exerciseKey, setExerciseKey] = useState(() => initialExercise ? analyticsExerciseKey(initialExercise) : '')
  useEffect(() => {
    const subscription = liveQuery(() => readExerciseAnalytics()).subscribe({
      next: rows => setExercises(rows),
      error: () => setError(true),
    })
    return () => subscription.unsubscribe()
  }, [])
  if (error) return <p role="alert" className="error">Could not read exercise history. Reopen Analytics to try again.</p>
  if (!exercises) return <p role="status">Opening exercise history…</p>
  const initialKey = initialExercise && analyticsExerciseKey(initialExercise)
  const options = initialExercise && !exercises.some(row => row.key === initialKey)
    ? [{ key: initialKey!, snapshot: initialExercise, sessions: [] }, ...exercises] : exercises
  const exercise = options.find(row => row.key === exerciseKey) ?? options[0]
  const counts = new Map<string, number>()
  for (const row of options) counts.set(row.snapshot.id, (counts.get(row.snapshot.id) ?? 0) + 1)
  return <>
    {showRecords && <RecordsBoard exercises={exercises} onOpenWorkout={onOpenWorkout} onBack={() => {
      setShowRecords(false)
      requestAnimationFrame(() => browse.current?.focus())
    }} />}
    <div hidden={showRecords}>
      <section className="surface-card analytics-card" aria-label="Choose an exercise">
        {exercise && <label>Exercise<select value={exercise.key} onChange={event => setExerciseKey(event.target.value)}>
          {options.map(row => {
            const { snapshot } = row
            const convention = snapshot.metadata?.repetitionConvention === 'per-side' ? ', reps per side' : snapshot.tracking.weightConvention === 'per-hand' ? (snapshot.metadata?.repetitionConvention === 'total' ? ', total reps' : ', rep convention unspecified') : ''
            return <option key={row.key} value={row.key}>{exerciseDisplayName(snapshot)}{counts.get(snapshot.id)! > 1 ? ` · ${trackingLabel(snapshot.tracking)}${convention}` : ''}</option>
          })}
        </select></label>}
        {!exercise && <p className="note">Complete a working set and finish a workout to see your exercise progress here.</p>}
        <button ref={browse} type="button" className="secondary" onClick={() => setShowRecords(true)}>Browse all records</button>
      </section>
      {exercise && <ExerciseProgress key={exercise.key} exercise={exercise} onOpenWorkout={onOpenWorkout} />}
    </div>
  </>
}
