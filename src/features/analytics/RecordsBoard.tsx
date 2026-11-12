import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { METRIC_LABELS, type AnalyticsExercise, type Metric } from '../../domain/strength/analytics'
import { trackingLabel } from '../../domain/strength/catalog'
import { performanceText } from '../../domain/strength/logging'
import type { WeightUnit } from '../../domain/strength/models'
import { buildRecordsBoard, filterRecordsBoard, type RecordSort } from '../../domain/strength/recordsBoard'
import { metricLabel, metricValueText } from './metricText'

const date = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
const PAGE = 20

export function RecordsBoard({ exercises, onBack, onOpenWorkout }: {
  exercises: AnalyticsExercise[]
  onBack: () => void
  onOpenWorkout: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [metric, setMetric] = useState<Metric | 'all'>('all')
  const [sort, setSort] = useState<RecordSort>('newest')
  const [unit, setUnit] = useState<WeightUnit>('kg')
  const [limit, setLimit] = useState(PAGE)
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [])
  const records = useMemo(() => buildRecordsBoard(exercises), [exercises])
  const matching = useMemo(() => filterRecordsBoard(records, query, metric, sort), [records, query, metric, sort])
  return <section className="surface-card analytics-card records-board" aria-labelledby="records-board-title">
    <Button variant="secondary" onClick={onBack}>Back to exercises</Button>
    <h2 id="records-board-title" ref={title} tabIndex={-1}>All-time personal records</h2>
    <label>Search exercises<input type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(PAGE) }} /></label>
    <div className="analytics-controls">
      <label>Record type<select value={metric} onChange={event => { setMetric(event.target.value as Metric | 'all'); setLimit(PAGE) }}>
        <option value="all">All record types</option>
        {(Object.keys(METRIC_LABELS) as Metric[]).map(key => <option key={key} value={key}>{METRIC_LABELS[key]}</option>)}
      </select></label>
      <label>Sort by<select value={sort} onChange={event => { setSort(event.target.value as RecordSort); setLimit(PAGE) }}>
        <option value="newest">Newest achievement</option><option value="exercise">Exercise name</option>
      </select></label>
      <label>Weight unit<select value={unit} onChange={event => setUnit(event.target.value as WeightUnit)}>
        <option value="kg">kg</option><option value="lb">lb</option>
      </select></label>
    </div>
    <p className="note records-board-count" role="status">{matching.length} {matching.length === 1 ? 'record' : 'records'}</p>
    {!records.length ? <p className="note">Complete a working set and finish a workout to see your first records.</p>
      : !matching.length ? <p className="note">No records match your search and filters.</p>
      : <ul className="exercise-list records-board-list">{matching.slice(0, limit).map(({ key, name, snapshot, metric, record }) => {
        const reps = snapshot.metadata?.repetitionConvention
        const convention = reps === 'per-side' ? ' · Reps per side' : snapshot.tracking.weightConvention === 'per-hand'
          ? reps === 'total' ? ' · Total reps' : ' · Rep convention unspecified' : ''
        return <li key={key}><button className="exercise-row" onClick={() => onOpenWorkout(record.session.id)}>
          <span className="records-board-heading"><strong>{name}</strong><Icon name="medal" /></span>
          <span>{metricLabel(metric, snapshot)} · <strong>{metricValueText(record.value, metric, unit, snapshot)}</strong></span>
          <span>{trackingLabel(snapshot.tracking)}{convention}</span>
          {record.set && <span>{performanceText(record.set)}</span>}
          <span>{record.session.title} · <time dateTime={record.session.startedAt}>{date.format(new Date(record.session.startedAt))}</time></span>
        </button></li>
      })}</ul>}
    {limit < matching.length && <Button variant="secondary" onClick={() => setLimit(limit + PAGE)}>Show more records</Button>}
  </section>
}
