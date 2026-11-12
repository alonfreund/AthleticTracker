import { useEffect, useMemo, useState } from 'react'
import { liveQuery } from 'dexie'
import { Button } from '../../components/ui/Button'
import { listCardioSessions, type CardioSession } from '../../data/repositories/cardio'
import { CARDIO_ACTIVITIES, type CardioActivity } from '../../domain/cardio/activities'
import { CARDIO_METRICS, cardioBenchmarks, cardioChartPoints, cardioTotals, filterCardio, timingSource, type CardioAnalyticsSession, type CardioMetric, type TimingSource } from '../../domain/cardio/analytics'
import { DISTANCE_FACTORS, distanceUnits, type DistanceUnit } from '../../domain/cardio/models'
import { EXERCISE_RANGES, frequencyTimeline, timelineRange, type ExerciseRange } from '../../domain/strength/exerciseTimeline'
import { durationText } from '../performance/cardioDisplay'
import { ExerciseChart } from './ExerciseChart'

const date = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const month = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' })
const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
const metricKeys = Object.keys(CARDIO_METRICS) as CardioMetric[]

function metricValue(value: number, metric: CardioMetric, sport: CardioActivity, unit: DistanceUnit) {
  if (metric === 'duration') return durationText(value)
  if (metric === 'distance') return `${number.format(value / DISTANCE_FACTORS[unit])} ${unit}`
  if (metric === 'speed') return `${number.format(value * 3600 / DISTANCE_FACTORS[unit])} ${unit}/h`
  if (metric === 'elevation') return `${number.format(value)} m`
  if (metric === 'heartRate' || metric === 'maxHeartRate') return `${number.format(value)} bpm`
  if (metric === 'frequency') return `${value} ${value === 1 ? 'session' : 'sessions'}`
  const base = sport === 'rowing' ? 500 : (sport === 'swimming' ? 100 : 1) * DISTANCE_FACTORS[unit]
  const label = sport === 'rowing' ? '500 m' : sport === 'swimming' ? `100 ${unit}` : unit
  const seconds = Math.round(value * base)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} / ${label}`
}

function context(row: CardioAnalyticsSession) {
  const { setting, poolLength, distanceUnit } = row.details
  return [setting || 'Setting unspecified', timingSource(row) === 'live' ? 'Live active time' : 'Manual duration',
    poolLength === null ? '' : `${poolLength} ${distanceUnit} pool`].filter(Boolean).join(' · ')
}

export function CardioAnalytics({ onOpenSession }: { onOpenSession: (id: string) => void }) {
  const [rows, setRows] = useState<CardioSession[]>()
  const [error, setError] = useState(false)
  const [sportChoice, setSport] = useState<CardioActivity>()
  const [setting, setSetting] = useState('all')
  const [source, setSource] = useState<TimingSource | 'all'>('all')
  const [range, setRange] = useState<ExerciseRange>('3')
  const [metricChoice, setMetric] = useState<CardioMetric>('duration')
  const [unitChoice, setUnit] = useState<DistanceUnit>()
  const [limit, setLimit] = useState(10)
  useEffect(() => {
    const subscription = liveQuery(() => listCardioSessions()).subscribe({ next: setRows, error: () => setError(true) })
    return () => subscription.unsubscribe()
  }, [])
  const sport = sportChoice ?? rows?.[0]?.details.sport ?? 'running'
  const units = distanceUnits(sport)
  const unit = unitChoice && units.includes(unitChoice) ? unitChoice : units[0]
  const sportSettings = [...new Set(rows?.filter(row => row.details.sport === sport).map(row => row.details.setting))].sort()
  const filtered = useMemo(() => filterCardio(rows ?? [], sport, setting === 'all' ? null : setting, source), [rows, sport, setting, source])
  const metrics = useMemo(() => metricKeys.filter(metric => metric === 'frequency' || metric === 'duration' || cardioChartPoints(filtered, metric).length),
    [filtered])
  const metric = metrics.includes(metricChoice) ? metricChoice : 'duration'
  const now = new Date()
  const { from, before } = timelineRange(range, now)
  const visible = filtered.filter(row => {
    const at = new Date(row.session.startedAt)
    return at < before && (!from || at >= from)
  })
  const totals = cardioTotals(visible)
  const benchmarks = useMemo(() => cardioBenchmarks(filtered), [filtered])
  const format = (value: number) => metricValue(value, metric, sport, unit)
  const chartKey = `${sport}:${setting}:${source}:${range}:${metric}`
  const buckets = metric === 'frequency' ? frequencyTimeline(visible.map(row => ({ ...row, startedAt: row.session.startedAt })), range, now)
    .map(bucket => ({ ...bucket, value: bucket.sessions.length, label: range === '12' || range === 'all'
      ? month.format(new Date(bucket.at)) : `Week of ${date.format(new Date(bucket.at))}` })) : []
  const values = metric === 'frequency' ? [] : cardioChartPoints(visible, metric)
  const points = values.map((point, index) => ({
    ...point, at: Date.parse(point.row.session.startedAt), label: date.format(new Date(point.row.session.startedAt)), source: point.row.session.title,
    breakBefore: point.breakBefore || ((metric === 'pace' || metric === 'speed') && index > 0 && context(values[index - 1].row) !== context(point.row)),
  }))

  return <>
    <section className="surface-card analytics-card" aria-labelledby="cardio-analytics-title">
      <h2 id="cardio-analytics-title">Cardio analytics</h2>
      <div className="analytics-controls cardio-analytics-controls">
        <label>Sport<select value={sport} onChange={event => { setSport(event.target.value as CardioActivity); setSetting('all'); setUnit(undefined); setLimit(10) }}>
          {Object.entries(CARDIO_ACTIVITIES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <label>Setting<select value={setting} onChange={event => { setSetting(event.target.value); setLimit(10) }}>
          <option value="all">All settings</option>{sportSettings.map(value => <option key={value} value={value}>{value || 'Unspecified'}</option>)}
        </select></label>
        <label>Timing source<select value={source} onChange={event => { setSource(event.target.value as TimingSource | 'all'); setLimit(10) }}>
          <option value="all">All timing sources</option><option value="live">Live active time</option><option value="manual">Manual duration</option>
        </select></label>
        <label>Date range<select value={range} onChange={event => setRange(event.target.value as ExerciseRange)}>
          {Object.entries(EXERCISE_RANGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <label>Distance unit<select value={unit} onChange={event => setUnit(event.target.value as DistanceUnit)}>
          {units.map(value => <option key={value}>{value}</option>)}
        </select></label>
      </div>
      {error ? <p className="error" role="alert">Could not read cardio history.</p> : !rows ? <p role="status">Opening cardio analytics…</p> : <>
        <dl className="cardio-week cardio-analytics-totals">
          <div><dt>Sessions</dt><dd>{totals.count}</dd></div>
          <div><dt>Duration</dt><dd>{durationText(totals.duration)}</dd></div>
          <div><dt>Recorded distance</dt><dd>{totals.distances ? metricValue(totals.distance, 'distance', sport, unit) : '—'}</dd></div>
        </dl>
        {totals.distances < totals.count && <p className="note">Distance recorded for {totals.distances} of {totals.count} sessions.</p>}
      </>}
    </section>
    {rows && !error && <>
      <section className="surface-card analytics-card" aria-labelledby="cardio-chart-title">
        <h2 id="cardio-chart-title">Progress</h2>
        <label>Metric<select value={metric} onChange={event => setMetric(event.target.value as CardioMetric)}>
          {metrics.map(key => <option key={key} value={key}>{CARDIO_METRICS[key]}</option>)}
        </select></label>
        {metric === 'frequency' ? <ExerciseChart key={chartKey} points={buckets} title={CARDIO_METRICS[metric]} bars format={format}
          details={point => <><p role="status">{point.label} · {format(point.value)}</p>
            {!!point.sessions.length && <ul className="exercise-list">{point.sessions.map(row => <li key={row.session.id}>
              <button type="button" className="exercise-row" onClick={() => onOpenSession(row.session.id)}>{row.session.title} · {date.format(new Date(row.startedAt))}</button>
            </li>)}</ul>}</>} />
          : <ExerciseChart key={chartKey} points={points} title={CARDIO_METRICS[metric]} bars={false} format={format}
            details={point => <><p role="status"><strong>{format(point.value)}</strong> · {point.source} · {point.label}</p>
              <p className="note">{context(point.row)}</p><Button variant="secondary" onClick={() => onOpenSession(point.row.session.id)}>Open session</Button></>} />}
        {(metric === 'pace' || metric === 'speed') && <p className="note">Use the setting and timing filters to compare like sessions. {metric === 'pace' ? 'Lower pace values are faster.' : ''}</p>}
      </section>
      <section className="surface-card analytics-card" aria-labelledby="cardio-benchmarks">
        <h2 id="cardio-benchmarks">All-time benchmarks</h2>
        <p className="note">Uses the selected sport, setting and timing source. Distance benchmarks require a matching logged distance.</p>
        {!benchmarks.length && <p className="note">No benchmarks for these filters yet.</p>}
        <ul className="exercise-list analytics-records">{benchmarks.slice(0, limit).map(({ key, label, row, value, metric }) => <li key={key}>
          <button type="button" className="exercise-row" onClick={() => onOpenSession(row.session.id)}>
            <span>{label}</span><strong>{metricValue(value, metric, sport, unit)}</strong>
            <span>{context(row)}</span><span>{row.session.title} · {date.format(new Date(row.session.startedAt))}</span>
          </button>
        </li>)}</ul>
        {benchmarks.length > limit && <Button variant="secondary" onClick={() => setLimit(limit + 10)}>Show more benchmarks</Button>}
      </section>
    </>}
  </>
}
