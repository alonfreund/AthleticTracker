import { METRIC_LABELS, type Metric } from '../../domain/strength/analytics'
import type { Exercise, WeightUnit } from '../../domain/strength/models'

const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })

export function metricLabel(metric: Metric, snapshot: Exercise): string {
  if (snapshot.tracking.load === 'added') {
    if (metric === 'load') return 'Heaviest added load'
    if (metric === 'volume') return 'Added-load session volume'
  }
  return METRIC_LABELS[metric]
}

export function metricValueText(value: number, metric: Metric, unit: WeightUnit, snapshot: Exercise) {
  const perHand = snapshot.tracking.weightConvention === 'per-hand'
  const perSide = snapshot.metadata?.repetitionConvention === 'per-side'
  if (metric === 'reps') return `${number.format(value)} reps${perSide ? ' per side' : ''}`
  if (metric === 'hold') return `${number.format(value)} s`
  return `${number.format(unit === 'lb' ? value / 0.45359237 : value)} ${unit}${metric === 'volume' ? ' × reps' : perHand ? ' per hand' : ''}`
}
