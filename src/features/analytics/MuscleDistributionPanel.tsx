import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { Button } from '../../components/ui/Button'
import { readMuscleDistribution } from '../../data/repositories/analytics'
import { MUSCLE_REGIONS, muscleDateRange, type MuscleDistribution, type MusclePeriod, type MuscleRegion, type MuscleRole } from '../../domain/strength/muscleDistribution'
import { MuscleBodyMap, heatLevel, sideForRegion, type BodySide } from './MuscleBodyMap'

const percentage = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 })
const setLabel = (count: number) => `${count} ${count === 1 ? 'set' : 'sets'}`

export function MuscleDistributionPanel() {
  const [period, setPeriod] = useState<MusclePeriod>(30)
  const [role, setRole] = useState<MuscleRole>('primary')
  const [side, setSide] = useState<BodySide>('front')
  const [selected, setSelected] = useState<MuscleRegion>()
  const [result, setResult] = useState<{ period: MusclePeriod; data?: MuscleDistribution }>()
  useEffect(() => {
    const subscription = liveQuery(() => readMuscleDistribution(muscleDateRange(period))).subscribe({
      next: data => setResult({ period, data }),
      error: () => setResult({ period }),
    })
    return () => subscription.unsubscribe()
  }, [period])
  const current = result?.period === period ? result : undefined
  const data = current?.data
  const rows = data?.[role] ?? []
  const counts = new Map(rows.map(({ region, count }) => [region, count]))
  const max = rows[0]?.count ?? 0
  const credits = rows.reduce((total, row) => total + row.count, 0)
  const roleLabel = role === 'primary' ? 'Primary' : 'Secondary'
  function selectRegion(region: MuscleRegion) {
    setSelected(region)
    setSide(current => sideForRegion(current, region))
  }
  function changeSide(next: BodySide) {
    setSide(next)
    if (selected && sideForRegion(next, selected) !== next) setSelected(undefined)
  }
  return <>
    <section className="surface-card analytics-card" aria-labelledby="muscle-distribution-heading">
      <h2 id="muscle-distribution-heading">Muscle distribution</h2>
      <div className="analytics-controls">
        <label>Period<select value={period} onChange={event => {
          setResult(undefined)
          setPeriod(event.target.value === 'all' ? 'all' : Number(event.target.value) as MusclePeriod)
        }}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option><option value="all">All time</option>
        </select></label>
        <label>Muscle role<select value={role} onChange={event => setRole(event.target.value as MuscleRole)}>
          <option value="primary">Primary</option><option value="secondary">Secondary</option>
        </select></label>
      </div>
      {!current && <p className="muscle-summary" role="status">Counting working sets…</p>}
      {current && !data && <p className="error" role="alert">Could not read workout history. Reopen Analytics to try again.</p>}
      {data && <p className="muscle-summary" role="status"><strong>{data.workingSets} working {data.workingSets === 1 ? 'set' : 'sets'}</strong> · {credits} {role} muscle {credits === 1 ? 'credit' : 'credits'}</p>}
      {!!data?.unmappedSets && <p className="note">{setLabel(data.unmappedSets)} with missing or unrecognized muscle tags. Only recognized tags contribute credits.</p>}
      {data && <p className="note">A set can credit several regions. Each region gets at most one credit per set, with primary taking precedence.</p>}
    </section>
    {data && <div className="muscle-views">
      <section className="surface-card analytics-card" aria-labelledby="muscle-map-heading">
        <h2 id="muscle-map-heading">Body heatmap</h2>
        <div className="muscle-side-controls" role="group" aria-label="Body view">
          <Button variant={side === 'front' ? 'primary' : 'secondary'} aria-pressed={side === 'front'} onClick={() => changeSide('front')}>Front</Button>
          <Button variant={side === 'back' ? 'primary' : 'secondary'} aria-pressed={side === 'back'} onClick={() => changeSide('back')}>Back</Button>
        </div>
        <MuscleBodyMap side={side} counts={counts} max={max} selected={selected} onSelect={selectRegion} />
        <div className="muscle-legend" aria-label={max ? `Scale from zero to ${setLabel(max)}` : 'No credited sets'}>
          {!!max && <span>0</span>}
          {(max ? [0, 1, 2, 3, 4] : [0]).map(level => <span key={level} className={`heat-${level}`} aria-hidden="true" />)}
          <span>{setLabel(max)}</span>
        </div>
        <p className="note muscle-selection" role="status">
          {selected ? `${MUSCLE_REGIONS[selected]} · ${setLabel(counts.get(selected) ?? 0)}` : 'Select a region to see its count.'}
        </p>
      </section>
      <section className="surface-card analytics-card" aria-labelledby="muscle-counts-heading">
        <h2 id="muscle-counts-heading">{roleLabel} sets by muscle</h2>
        {rows.length ? <>
          <p className="note">Shares are based on {role} muscle credits.</p>
          <ol className="muscle-chart">{rows.map(({ region, count }) => (
            <li key={region}>
              <button className="muscle-chart-row" aria-pressed={selected === region} onClick={() => selectRegion(region)}>
                <span>{MUSCLE_REGIONS[region]}</span><span>{setLabel(count)} · {percentage.format(count / credits)}</span>
                <span className="muscle-chart-track" aria-hidden="true">
                  <span className={`heat-${heatLevel(count, max)}`} style={{ width: `${count / max * 100}%` }} />
                </span>
              </button>
            </li>
          ))}</ol>
        </> : <p className="note">{data.workingSets ? `No ${role} muscle credits in this period.` : 'No working sets in this period.'}</p>}
      </section>
    </div>}
  </>
}
