import { expect, it } from 'vitest'
import { resolveTheme } from '../src/app/theme'

it('follows the system appearance and honors explicit light and dark choices', () => {
  expect(resolveTheme('system', true)).toBe('dark')
  expect(resolveTheme('system', false)).toBe('light')
  expect(resolveTheme('dark', false)).toBe('dark')
  expect(resolveTheme('light', true)).toBe('light')
})
