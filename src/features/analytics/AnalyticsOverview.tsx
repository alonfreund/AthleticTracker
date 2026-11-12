import { useEffect, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { readAnalyticsOverview } from '../../data/repositories/analytics'
import type { AnalyticsOverview as OverviewData } from '../../domain/strength/analyticsOverview'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import type { Exercise } from '../../domain/strength/models'
import { MUSCLE_REGIONS } from '../../domain/strength/muscleDistribution'
import { TREND_WINDOWS, type TrendWeek, type TrendWindow } from '../../domain/strength/trainingTrends'

const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const fullDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const number = new Intl.NumberFormat()
const percentage = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 })
const metrics = { sets: 'Working sets', workouts: 'Workouts', days: 'Training days' } as const
type WeeklyMetric = keyof typeof metrics

function WeeklyActivity({ weeks }: { weeks: TrendWeek[] }) {
  const [metric, setMetric] = useState<WeeklyMetric>('sets')
  const [weekStart, setWeekStart] = useState<string>()
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scroll.current) scroll.current.scrollLeft = scroll.current.scrollWidth
  }, [])
  const selected = weeks.find(week => week.from === weekStart) ?? weeks[weeks.length - 1]
  const max = Math.max(1, ...weeks.map(week => week[metric]))
  return <section className="surface-card analytics-card overview-card" aria-labelledby="overview-activity">
    <div className="overview-card-head">
      <h2 id="overview-activity">Weekly activity</h2>
      <label className="overview-inline-select"><span className="sr-only">Weekly activity metric</span>
        <select value={metric} onChange={event => setMetric(event.target.value as WeeklyMetric)}>
          {Object.entries(metrics).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
    </div>
    <div className="overview-week-detail" role="status">
      <strong>{number.format(selected[metric])}</strong><span>{metrics[metric]}<small>Week of {fullDate.format(new Date(selected.from))}{selected === weeks.at(-1) ? ' · Week to date' : ''}</small></span>
    </div>
    <div className="overview-week-scroll" ref={scroll} tabIndex={0} aria-label="Weekly activity chart, scroll for earlier weeks">
      <div className="overview-week-plot" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(44px, 1fr))` }}>
        {weeks.map(week => <button type="button" key={week.from}
          aria-pressed={week === selected} aria-label={`Week of ${fullDate.format(new Date(week.from))}: ${week[metric]} ${metrics[metric].toLowerCase()}`}
          onClick={() => setWeekStart(week.from)}>
          <span className="overview-week-track" aria-hidden="true"><span style={{ height: `${week[metric] / max * 100}%` }} /></span>
          <span aria-hidden="true">{shortDate.format(new Date(week.from))}</span>
        </button>)}
      </div>
    </div>
  </section>
}

function MuscleMix({ muscles, onOpen }: { muscles: OverviewData['muscles']; onOpen: () => void }) {
  const total = muscles.reduce((sum, row) => sum + row.count, 0)
  const leading = muscles.slice(0, 4)
  const other = total - leading.reduce((sum, row) => sum + row.count, 0)
  const segments: { label: string; count: number }[] = leading.map(row => ({ label: MUSCLE_REGIONS[row.region], count: row.count }))
  if (other) segments.push({ label: 'Other', count: other })
  let offset = 0
  const stops = segments.map(({ count }, index) => {
    const start = offset
    offset += count / total * 100
    return `var(--overview-segment-${index + 1}) ${start}% ${offset}%`
  })
  return <section className="surface-card analytics-card overview-card" aria-labelledby="overview-muscles">
    <h2 id="overview-muscles">Muscle mix</h2>
    {total ? <div className="overview-mix">
      <div className="overview-donut" aria-hidden="true" style={{ backgroundImage: `conic-gradient(${stops.join(', ')})` }}>
        <div><strong>{number.format(total)}</strong><span>Credits</span></div>
      </div>
      <ul aria-label="Primary muscle credits">
        {segments.map(({ label, count }, index) => <li key={label}>
          <span className="overview-swatch" aria-hidden="true" style={{ background: `var(--overview-segment-${index + 1})` }} />
          <span>{label}</span><strong>{number.format(count)} · {percentage.format(count / total)}</strong>
        </li>)}
      </ul>
    </div> : <p className="note">No primary muscle credits in this range.</p>}
    <Button variant="secondary" onClick={onOpen}>View muscle distribution <Icon name="arrow" /></Button>
  </section>
}

export function AnalyticsOverview({ onMuscles, onExercise }: { onMuscles: () => void; onExercise: (exercise: Exercise) => void }) {
  const [size, setSize] = useState<TrendWindow>(8)
  const [result, setResult] = useState<{ size: TrendWindow; data?: OverviewData }>()
  useEffect(() => {
    const subscription = liveQuery(() => readAnalyticsOverview(size)).subscribe({
      next: data => setResult({ size, data }),
      error: () => setResult({ size }),
    })
    return () => subscription.unsubscribe()
  }, [size])
  const current = result?.size === size ? result : undefined
  const data = current?.data
  return <div className="analytics-overview">
    <section className="overview-hero" aria-labelledby="overview-heading">
      <div className="overview-card-head">
        <h2 id="overview-heading">Training overview</h2>
        <label className="overview-inline-select"><span className="sr-only">Overview time range</span><select value={size}
          onChange={event => setSize(Number(event.target.value) as TrendWindow)}>
          {TREND_WINDOWS.map(weeks => <option key={weeks} value={weeks}>Last {weeks} weeks</option>)}
        </select></label>
      </div>
      {data ? <dl className="overview-kpis">
        {(Object.keys(metrics) as WeeklyMetric[]).map(metric => <div key={metric}>
          <dt>{metrics[metric]}</dt><dd>{number.format(data.weeks.reduce((total, week) => total + week[metric], 0))}</dd>
        </div>)}
      </dl> : current ? <p role="alert">Could not load training history.</p> : <p role="status">Opening your training overview…</p>}
    </section>
    {data && <>
      <WeeklyActivity key={size} weeks={data.weeks} />
      <div className="overview-card-grid">
        <MuscleMix muscles={data.muscles} onOpen={onMuscles} />
        <section className="surface-card analytics-card overview-card" aria-labelledby="overview-exercises">
          <h2 id="overview-exercises">Most logged exercises</h2>
          {data.exercises.length ? <ol className="overview-ranking">{data.exercises.map(row => <li key={row.key}>
            <button type="button" onClick={() => onExercise(row.snapshot)}>
              <span>{exerciseDisplayName(row.snapshot)}</span><strong>{number.format(row.sets)} {row.sets === 1 ? 'set' : 'sets'}</strong>
              <span className="analytics-bar" aria-hidden="true"><span style={{ width: `${row.sets / data.exercises[0].sets * 100}%` }} /></span>
            </button>
          </li>)}</ol> : <p className="note">Finish a workout with working sets to see your exercises here.</p>}
        </section>
      </div>
    </>}
  </div>
}
