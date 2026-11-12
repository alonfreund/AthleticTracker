import { expect, it } from 'vitest'
import { frequencyTimeline, timelineRange } from '../src/domain/strength/exerciseTimeline'

it('clamps rolling calendar ranges and includes days through today', () => {
  const now = new Date(2026, 2, 31, 12)
  expect(timelineRange('1', now)).toEqual({ from: new Date(2026, 1, 28), before: new Date(2026, 3, 1) })
  expect(timelineRange('3', now).from).toEqual(new Date(2025, 11, 31))
  expect(timelineRange('all', now).from).toBeUndefined()
})

it('keeps empty weeks and months and ignores sessions outside the selected range', () => {
  const now = new Date(2026, 5, 20, 12)
  const session = (id: string, day: number, month = 5) => ({ id, title: id, startedAt: new Date(2026, month, day, 12).toISOString(), sets: [] })
  const sessions = [session('outside', 19, 4), session('first', 1), session('second', 1), session('third', 15), session('future', 22)]
  expect(frequencyTimeline(sessions, '1', now).map(row => row.sessions.length)).toEqual([0, 0, 2, 0, 1])
  expect(frequencyTimeline([session('first', 1, 3), session('last', 1)], 'all', now).map(row => row.sessions.length)).toEqual([1, 0, 1])
})
