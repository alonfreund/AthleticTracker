import { expect, it } from 'vitest'
import { resolveTheme } from '../src/app/theme'

it('follows the system appearance and honors explicit light and dark choices', () => {
  expect(resolveTheme('system', true)).toBe('dark')
  expect(resolveTheme('system', false)).toBe('light')
  expect(resolveTheme('dark', false)).toBe('dark')
  expect(resolveTheme('light', true)).toBe('light')
})

it.each(['ocean', 'forest', 'dusk', 'star-wars', 'star-wars-plus'] as const)('keeps the %s preset independent of system appearance', theme => {
  expect(resolveTheme(theme, false)).toBe(theme)
  expect(resolveTheme(theme, true)).toBe(theme)
})
