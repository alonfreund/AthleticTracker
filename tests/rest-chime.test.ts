import { expect, it } from 'vitest'
import { restChimeDue } from '../src/features/workouts/useRestChime'

it('chimes once when the same running countdown crosses zero', () => {
  const before = { key: 'current', remaining: 1 }
  const ended = { key: 'current', remaining: 0 }
  expect(restChimeDue(before, ended, undefined)).toBe(true)
  expect(restChimeDue(ended, ended, undefined)).toBe(false)
  expect(restChimeDue(undefined, ended, undefined)).toBe(false)
  expect(restChimeDue(before, { key: 'replacement', remaining: 0 }, undefined)).toBe(false)
  expect(restChimeDue(before, ended, 'current')).toBe(false)
  expect(restChimeDue(before, ended, 'older countdown')).toBe(true)
})
