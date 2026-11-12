import { useState } from 'react'
import { Button } from '../../components/ui/Button'

export type ChartPoint = { at: number; value: number; label: string; source?: string }

export function ExerciseChart<T extends ChartPoint>({ points, title, bars, format, details }: {
  points: T[]
  title: string
  bars: boolean
  format: (value: number) => string
  details: (point: T) => React.ReactNode
}) {
  const [index, setIndex] = useState<number>()
  const selected = Math.min(index ?? points.length - 1, points.length - 1)
  if (!points.length) return <p className="note">No data for this metric and range.</p>
  const start = points[0].at
  const end = points[points.length - 1].at
  const min = bars ? 0 : points.reduce((value, point) => Math.min(value, point.value), Infinity)
  const max = points.reduce((value, point) => Math.max(value, point.value), 0)
  const x = (at: number) => end === start ? 200 : 18 + 364 * (at - start) / (end - start)
  const y = (value: number) => max === min ? (bars ? 151 : 83) : 151 - 136 * (value - min) / (max - min)
  const barWidth = Math.min(24, 230 / points.length)
  const path = points.map((point, i) => `${i ? 'L' : 'M'}${x(point.at)},${y(point.value)}`).join(' ')
  const selectedPoint = points[selected]
  return <figure className="exercise-chart">
    <figcaption>{title}</figcaption>
    <div className="exercise-chart-plot">
    <div className="exercise-chart-scale" aria-hidden="true"><span>{format(max)}</span>{max !== min && <span>{format(min)}</span>}</div>
    <svg viewBox="0 0 400 166" aria-hidden="true" focusable="false" onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect()
      const px = (event.clientX - rect.left) * 400 / rect.width
      const py = (event.clientY - rect.top) * 166 / rect.height
      let nearest = 0
      let distance = Infinity
      for (const [i, point] of points.entries()) {
        const candidate = Math.abs(x(point.at) - px) + (bars ? 0 : Math.abs(y(point.value) - py) * .35)
        if (candidate <= distance) { nearest = i; distance = candidate }
      }
      setIndex(nearest)
    }}>
      <path className="exercise-chart-grid" d="M18 15H382 M18 83H382 M18 151H382" />
      {bars ? points.map((point, i) => <rect key={i} className={i === selected ? 'is-selected' : ''}
        x={x(point.at) - barWidth / 2} y={Math.min(149, y(point.value))} width={barWidth} height={Math.max(2, 151 - y(point.value))} rx={2} />)
        : <><path className="exercise-chart-line" d={path} />
          {points.map((point, i) => <circle key={i} className={i === selected ? 'is-selected' : ''} cx={x(point.at)} cy={y(point.value)} r={i === selected ? 5 : 2.7} />)}</>}
    </svg>
    </div>
    <div className="exercise-chart-dates" aria-hidden="true"><span>{points[0].label}</span>{points.length > 1 && <span>{points.at(-1)!.label}</span>}</div>
    <div className="exercise-chart-picker">
      <Button variant="secondary" aria-label="Previous data point" disabled={selected === 0} onClick={() => setIndex(selected - 1)}>‹</Button>
      <label>Data point<select value={selected} onChange={event => setIndex(Number(event.target.value))}>
        {points.map((point, i) => <option key={i} value={i}>{point.label} · {format(point.value)}{point.source ? ` · ${point.source}` : ''}</option>)}
      </select></label>
      <Button variant="secondary" aria-label="Next data point" disabled={selected === points.length - 1} onClick={() => setIndex(selected + 1)}>›</Button>
    </div>
    <div className="exercise-chart-point">{details(selectedPoint)}</div>
  </figure>
}
