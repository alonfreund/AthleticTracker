import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { Button } from '../../components/ui/Button'
import { readMonthlyReport } from '../../data/repositories/analytics'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { shiftTrainingMonth, trainingMonth, type MonthlyReport, type TrainingMonth } from '../../domain/strength/monthlyReport'
import { MUSCLE_REGIONS } from '../../domain/strength/muscleDistribution'
import type { WeightUnit } from '../../domain/strength/models'
import { metricLabel, metricValueText } from './metricText'

const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const RECORD_PAGE = 8

function durationText(ms: number) {
  const minutes = Math.floor(ms / 60000)
  if (ms > 0 && minutes === 0) return '<1 min'
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`
}

function ReportDetails({ month, report, onOpenWorkout }: {
  month: TrainingMonth
  report: MonthlyReport
  onOpenWorkout: (id: string) => void
}) {
  const [unit, setUnit] = useState<WeightUnit>('kg')
  const [recordLimit, setRecordLimit] = useState(RECORD_PAGE)
  const chartMax = Math.max(1, ...report.weeks.map(week => week.sets))
  const displayDay = (day: number) => dateFormat.format(new Date(month.year, month.month, day))
  const setLabel = (count: number) => `${count} ${count === 1 ? 'set' : 'sets'}`
  const hasMassRecords = report.records.some(({ metric }) => metric !== 'reps' && metric !== 'hold')
  return <>
    <section className="surface-card analytics-card" aria-labelledby="monthly-totals">
      <h2 id="monthly-totals">Training totals</h2>
      <dl className="monthly-totals">
        <div><dt>Finished workouts</dt><dd>{report.workoutCount}</dd></div>
        <div><dt>Training days</dt><dd>{report.trainingDays}</dd></div>
        <div><dt>Session time</dt><dd>{durationText(report.durationMs)}</dd></div>
        <div><dt>Working sets</dt><dd>{report.workingSets}</dd></div>
      </dl>
      <p className="note">Session time includes rest. Working sets exclude warm-ups and incomplete sets.</p>
    </section>
    <section className="surface-card analytics-card" aria-labelledby="monthly-activity">
      <h2 id="monthly-activity">Weekly activity</h2>
      <figure className="analytics-chart">
        <figcaption>Working sets by week</figcaption>
        <ol className="monthly-week-chart" aria-label="Monday to Sunday weeks within the selected month">
          {report.weeks.map(week => (
            <li key={week.first}>
              <span>{displayDay(week.first)}{week.first !== week.last && ` – ${displayDay(week.last)}`}</span>
              <span className="analytics-bar" aria-hidden="true"><span style={{ width: `${week.sets / chartMax * 100}%` }} /></span>
              <strong>{setLabel(week.sets)}</strong>
            </li>
          ))}
        </ol>
      </figure>
    </section>
    <section className="surface-card analytics-card" aria-labelledby="monthly-exercises">
      <h2 id="monthly-exercises">Main exercises</h2>
      {report.mainExercises.length ? <ol className="monthly-ranking">
        {report.mainExercises.map(({ key, snapshot, workoutCount, workingSets }) => (
          <li key={key}><strong>{exerciseDisplayName(snapshot)}</strong><span>{setLabel(workingSets)} · {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}</span></li>
        ))}
      </ol> : <p className="note">No working sets this month.</p>}
    </section>
    <section className="surface-card analytics-card" aria-labelledby="monthly-muscles">
      <h2 id="monthly-muscles">Most-trained muscles</h2>
      {report.primaryMuscles.length ? <>
        <p className="note">Primary muscle credits. A set can credit several regions.</p>
        <ol className="monthly-ranking">
          {report.primaryMuscles.slice(0, 5).map(({ region, count }) => (
            <li key={region}><strong>{MUSCLE_REGIONS[region]}</strong><span>{setLabel(count)}</span></li>
          ))}
        </ol>
      </> : <p className="note">No primary muscle credits this month.</p>}
    </section>
    <section className="surface-card analytics-card" aria-labelledby="monthly-records">
      <h2 id="monthly-records">Personal records</h2>
      <p className="note">A new record beats an earlier result for the same exercise and metric.</p>
      {hasMassRecords && <label>Weight unit<select value={unit} onChange={event => setUnit(event.target.value as WeightUnit)}>
        <option value="kg">kg</option><option value="lb">lb</option>
      </select></label>}
      {report.records.length ? <>
        <ul className="exercise-list analytics-records">
          {report.records.slice(0, recordLimit).map(({ exercise, metric, point }) => (
            <li key={`${exercise.key}:${metric}:${point.session.id}`}>
              <button className="exercise-row" onClick={() => onOpenWorkout(point.session.id)}>
                <strong>{exerciseDisplayName(exercise.snapshot)}</strong>
                <span>{metricLabel(metric, exercise.snapshot)} · {metricValueText(point.value, metric, unit, exercise.snapshot)}</span>
                <span>{point.session.title} · {dateFormat.format(new Date(point.session.startedAt))}</span>
              </button>
            </li>
          ))}
        </ul>
        {recordLimit < report.records.length && <Button variant="secondary" onClick={() => setRecordLimit(recordLimit + RECORD_PAGE)}>Show more records</Button>}
      </> : <p className="note">No new personal records this month.</p>}
    </section>
  </>
}

export function MonthlyReportPanel({ onOpenWorkout }: { onOpenWorkout: (id: string) => void }) {
  const [month, setMonth] = useState(() => trainingMonth())
  const [result, setResult] = useState<{ month: TrainingMonth; report?: MonthlyReport }>()
  const current = trainingMonth()
  const isCurrent = month.year === current.year && month.month === current.month
  useEffect(() => {
    const subscription = liveQuery(() => readMonthlyReport(month)).subscribe({
      next: report => setResult({ month, report }),
      error: () => setResult({ month }),
    })
    return () => subscription.unsubscribe()
  }, [month])
  const visible = result?.month === month ? result : undefined
  return <>
    <section className="surface-card analytics-card" aria-labelledby="monthly-heading">
      <h2 id="monthly-heading">Monthly report</h2>
      <div className="monthly-picker">
        <Button variant="secondary" aria-label="Previous month" onClick={() => setMonth(shiftTrainingMonth(month, -1))}>‹</Button>
        <div aria-live="polite"><strong>{monthFormat.format(new Date(month.year, month.month, 1))}</strong>
          {isCurrent && <span className="note">Month to date</span>}
        </div>
        <Button variant="secondary" aria-label="Next month" disabled={isCurrent} onClick={() => setMonth(shiftTrainingMonth(month, 1))}>›</Button>
      </div>
      {!visible && <p role="status">Opening training report…</p>}
      {visible && !visible.report && <p className="error" role="alert">Could not read the monthly report. Reopen Analytics to try again.</p>}
    </section>
    {visible?.report && <ReportDetails key={`${month.year}-${month.month}`} month={month} report={visible.report} onOpenWorkout={onOpenWorkout} />}
  </>
}
