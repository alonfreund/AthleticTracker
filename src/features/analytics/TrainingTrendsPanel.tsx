import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { readTrainingTrends } from '../../data/repositories/analytics'
import { TREND_WINDOWS, type TrainingTrends, type TrendWeek, type TrendWindow } from '../../domain/strength/trainingTrends'

const metrics = { workouts: 'Finished workouts', days: 'Training days', sets: 'Working sets' } as const
const units = { workouts: 'workout', days: 'day', sets: 'set' } as const
const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const exactDate = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
const counted = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`

function WeeklyChart({ weeks, counts, caption, unit }: {
  weeks: TrendWeek[]
  counts: number[]
  caption: string
  unit: string
}) {
  const max = Math.max(1, ...counts)
  return <figure className="analytics-chart trends-chart">
    <figcaption>{caption}</figcaption>
    <ol aria-label="Weeks in chronological order">
      {weeks.map((week, index) => {
        const current = index === weeks.length - 1
        const date = new Date(week.from)
        return <li key={week.from}>
          <span><time dateTime={week.from} aria-label={`Week starting ${exactDate.format(date)}`}>{dateFormat.format(date)}</time>
            {current && <small className="note">Week to date</small>}
          </span>
          <span className="analytics-bar" aria-hidden="true"><span style={{ width: `${counts[index] / max * 100}%` }} /></span>
          <strong>{counted(counts[index], unit)}</strong>
        </li>
      })}
    </ol>
  </figure>
}

function TrendDetails({ data, metric, setMetric, patternId, setPatternId }: {
  data: TrainingTrends
  metric: keyof typeof metrics
  setMetric: (metric: keyof typeof metrics) => void
  patternId: string
  setPatternId: (id: string) => void
}) {
  const pattern = data.patterns.find(row => row.id === patternId) ?? data.patterns[0]
  return <>
    <section className="surface-card analytics-card" aria-labelledby="consistency-heading">
      <h2 id="consistency-heading">Training consistency</h2>
      <label>Weekly metric<select value={metric} onChange={event => setMetric(event.target.value as keyof typeof metrics)}>
        {Object.entries(metrics).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      <WeeklyChart weeks={data.weeks} counts={data.weeks.map(week => week[metric])} caption={`${metrics[metric]} by week`} unit={units[metric]} />
    </section>
    <section className="surface-card analytics-card" aria-labelledby="movements-heading">
      <h2 id="movements-heading">Movement patterns</h2>
      <p className="note">One working set can count toward several movement patterns.</p>
      {!!data.unclassifiedSets && <p className="note">{counted(data.unclassifiedSets, 'working set')} without a recognized movement pattern.</p>}
      {pattern ? <>
        <label>Movement pattern<select value={pattern.id} onChange={event => setPatternId(event.target.value)}>
          {data.patterns.map(row => <option key={row.id} value={row.id}>{row.label} · {counted(row.sets, 'set')}</option>)}
        </select></label>
        <WeeklyChart weeks={data.weeks} counts={pattern.weeklySets} caption={`${pattern.label} by week`} unit="set" />
        <h3>Contributing exercises</h3>
        <ol className="monthly-ranking">
          {pattern.exercises.map(row => <li key={row.exerciseId}><strong>{row.name}</strong><span>{counted(row.sets, 'set')}</span></li>)}
        </ol>
      </> : <p className="note">No classified working sets in this range.</p>}
    </section>
  </>
}

export function TrainingTrendsPanel() {
  const [metric, setMetric] = useState<keyof typeof metrics>('workouts')
  const [patternId, setPatternId] = useState('')
  const [size, setSize] = useState<TrendWindow>(12)
  const [result, setResult] = useState<{ size: TrendWindow; data?: TrainingTrends }>()
  useEffect(() => {
    const subscription = liveQuery(() => readTrainingTrends(size)).subscribe({
      next: data => setResult({ size, data }),
      error: () => setResult({ size }),
    })
    return () => subscription.unsubscribe()
  }, [size])
  const current = result?.size === size ? result : undefined
  return <>
    <section className="surface-card analytics-card" aria-labelledby="trends-heading">
      <h2 id="trends-heading">Training trends</h2>
      <label>Time range<select value={size} onChange={event => {
        setResult(undefined)
        setSize(Number(event.target.value) as TrendWindow)
      }}>
        {TREND_WINDOWS.map(value => <option key={value} value={value}>Last {value} weeks</option>)}
      </select></label>
      <p className="note trends-range-note">Weeks start on Monday. Working sets exclude warm-ups and incomplete sets.</p>
      {!current && <p role="status">Opening training trends…</p>}
      {current && !current.data && <p role="alert" className="error">Could not read training trends. Reopen Analytics to try again.</p>}
    </section>
    {current?.data && <TrendDetails data={current.data} metric={metric} setMetric={setMetric} patternId={patternId} setPatternId={setPatternId} />}
  </>
}
