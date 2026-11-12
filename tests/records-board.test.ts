import { expect, it } from 'vitest'
import { analyticsExerciseKey, type AnalyticsSession } from '../src/domain/strength/analytics'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import type { Exercise } from '../src/domain/strength/models'
import { buildRecordsBoard, filterRecordsBoard } from '../src/domain/strength/recordsBoard'

const [bench, squat] = STARTER_EXERCISES

function session(id: string, day: number, weight: number): AnalyticsSession {
  const startedAt = new Date(Date.UTC(2026, 0, day)).toISOString()
  return { id, startedAt, title: id, sets: [{
    id: 'set-' + id, sessionExerciseId: id, position: 0, completed: true, completedAt: startedAt,
    createdAt: startedAt, updatedAt: startedAt, setType: 'normal', reps: 5, durationSeconds: null,
    rpe: null, rir: null, target: null, load: { mode: 'external', weight: { value: weight, unit: 'kg' } },
  }] }
}

const history = (snapshot: Exercise, sessions: AnalyticsSession[]) => ({ key: analyticsExerciseKey(snapshot), snapshot, sessions })

it('keeps the first achievement on a tie and falls back to the next best when a workout is removed', () => {
  const previous = session('previous', 1, 40)
  const winner = session('winner', 2, 50)
  const tie = session('tie', 3, 50)
  const best = (sessions: AnalyticsSession[]) => buildRecordsBoard([history(bench, sessions)]).find(row => row.metric === 'load')?.record
  expect(best([previous, winner, tie])?.session.id).toBe('winner')
  expect(best([previous, tie])?.session.id).toBe('tie')
  expect(best([previous])?.value).toBe(40)
})

it('searches aliases, filters and sorts records, and preserves distinct profiles', () => {
  const perHand: Exercise = { ...bench, tracking: { ...bench.tracking, weightConvention: 'per-hand' } }
  const records = buildRecordsBoard([
    history(bench, [session('bench', 1, 50)]),
    history(perHand, [session('per-hand', 2, 25)]),
    history(squat, [session('squat', 3, 80)]),
  ])
  expect(filterRecordsBoard(records, 'BB bench', 'load', 'newest').map(row => row.record.session.id)).toEqual(['per-hand', 'bench'])
  expect(filterRecordsBoard(records, '', 'load', 'exercise').map(row => row.record.session.id)).toEqual(['squat', 'per-hand', 'bench'])
  expect(filterRecordsBoard(records, 'bench', 'hold', 'newest')).toEqual([])
})
