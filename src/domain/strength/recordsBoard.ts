import { exerciseProgress, type AnalyticsExercise, type Metric } from './analytics'
import { exerciseDisplayName } from './exerciseDisplayName'

export type RecordSort = 'newest' | 'exercise'

export function buildRecordsBoard(exercises: AnalyticsExercise[]) {
  return exercises.flatMap(({ key, snapshot, sessions }) =>
    exerciseProgress({ key, snapshot, sessions }).map(({ metric, record }) => ({
      key: `${key}:${metric}`, snapshot, metric, record, name: exerciseDisplayName(snapshot),
    })),
  )
}

type BoardRecord = ReturnType<typeof buildRecordsBoard>[number]
const normalize = (value: string) => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '')
  .toLocaleLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, ' ').trim()

export function filterRecordsBoard(records: BoardRecord[], query: string, metric: Metric | 'all', sort: RecordSort) {
  const terms = normalize(query).split(' ').filter(Boolean)
  return records.filter(row => {
    if (metric !== 'all' && row.metric !== metric) return false
    if (!terms.length) return true
    const text = normalize([row.name, row.snapshot.name, ...(row.snapshot.metadata?.aliases ?? [])].join(' '))
    return terms.every(term => text.includes(term))
  }).sort((a, b) => {
    const byDate = b.record.session.startedAt.localeCompare(a.record.session.startedAt)
    const byName = a.name.localeCompare(b.name)
    return (sort === 'newest' ? byDate || byName : byName || byDate) || a.key.localeCompare(b.key)
  })
}
