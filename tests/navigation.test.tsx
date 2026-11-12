import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BottomNavigation } from '../src/components/ui/BottomNavigation'
import { Button } from '../src/components/ui/Button'
import { DESTINATIONS, routeFromHash, routeHash, routeTab, navigationDecision } from '../src/app/navigation'
import { UpdateSafety } from '../src/app/updateSafety'

const ready = { dirty: false, busy: false, restoring: false, loading: false, applying: false }
describe('app-shell navigation', () => {
  it('resolves four root tabs, nested workout links and legacy URLs', () => {
    for (const screen of DESTINATIONS) expect(routeFromHash(routeHash({ screen }))).toEqual({ screen })
    expect(routeFromHash('')).toEqual({ screen: 'strength' })
    expect(routeFromHash('#/unknown')).toEqual({ screen: 'strength' })
    expect(routeFromHash('#/train')).toEqual({ screen: 'strength' })
    expect(routeFromHash('#/history')).toEqual({ screen: 'strength/history' })
    expect(routeFromHash('#/library')).toEqual({ screen: 'strength/library' })
    expect(routeFromHash(routeHash({ screen: 'strength/history', workoutId: 'workout-id' }))).toEqual({ screen: 'strength/history', workoutId: 'workout-id' })
    expect(routeFromHash('#/strength/workout/workout-id')).toEqual({ screen: 'strength', workoutId: 'workout-id' })
    expect(routeFromHash(routeHash({ screen: 'performance/cardio' }))).toEqual({ screen: 'performance/cardio' })
    expect(routeTab('performance/cardio')).toBe('performance')
    expect(routeFromHash(routeHash({ screen: 'performance/calisthenics' }))).toEqual({ screen: 'performance/calisthenics' })
    expect(routeTab('performance/calisthenics')).toBe('performance')
    expect(routeFromHash('#/performance/calisthenics/pushups')).toEqual({ screen: 'performance/calisthenics/pushups' })
    expect(routeTab('performance/calisthenics/pushups')).toBe('performance')
    expect(routeFromHash('#/performance/calisthenics/pullups')).toEqual({ screen: 'performance/calisthenics/pullups' })
    expect(routeTab('performance/calisthenics/pullups')).toBe('performance')
    const planche = { screen: 'performance/calisthenics/planche/movement', plancheMovement: 'tuck-planche-hold' } as const
    expect(routeFromHash(routeHash(planche))).toEqual(planche)
    expect(routeTab(planche.screen)).toBe('performance')
    expect(routeFromHash('#/performance/calisthenics/planche/unknown')).toEqual({ screen: 'performance/calisthenics/planche' })
    const requirement = { screen: 'performance/calisthenics/muscleups/requirement', requirement: 'hanging-l-sit' } as const
    expect(routeFromHash(routeHash(requirement))).toEqual(requirement)
    expect(routeTab(requirement.screen)).toBe('performance')
    expect(routeFromHash('#/performance/calisthenics/muscleups/requirement/unknown')).toEqual({ screen: 'performance/calisthenics/muscleups' })
    expect(routeFromHash('#/performance/calisthenics/muscleups/practice')).toEqual({ screen: 'performance/calisthenics/muscleups/practice' })
    expect(routeFromHash('#/performance/calisthenics/workout/workout-id')).toEqual({ screen: 'performance/calisthenics', workoutId: 'workout-id' })
    expect(routeFromHash(routeHash({ screen: 'performance/calisthenics/history', workoutId: 'workout-id' })))
      .toEqual({ screen: 'performance/calisthenics/history', workoutId: 'workout-id' })
    expect(routeTab('performance/cardio/history')).toBe('performance')
    expect(routeFromHash('#/performance/cardio/history')).toEqual({ screen: 'performance/cardio/history' })
    expect(routeFromHash('#/performance/cardio/unknown')).toEqual({ screen: 'performance/cardio' })
    for (const cardioActivity of ['running', 'cycling', 'swimming', 'walking', 'hiking', 'rowing', 'other'] as const) {
      const route = { screen: 'performance/cardio/activity' as const, cardioActivity }
      expect(routeFromHash(routeHash(route))).toEqual(route)
      expect(routeTab(route.screen)).toBe('performance')
    }
    expect(routeTab('strength/history')).toBe('strength')
    expect(routeTab('strength/library')).toBe('strength')
  })
  it('allows navigation when safe and requests confirmation for unsaved input', () => {
    expect(navigationDecision(ready)).toBe('allow')
    expect(navigationDecision({ ...ready, dirty: true })).toBe('confirm')
  })
  it.each(['busy', 'restoring', 'loading', 'applying'] as const)('waits during %s even when there is also unsaved input', flag => {
    expect(navigationDecision({ ...ready, dirty: true, [flag]: true })).toBe('wait')
  })
  it('uses the existing update-safety flags for navigation and reload protection', () => {
    const gate = new UpdateSafety()
    gate.setSafety({ ...ready, dirty: true })
    expect(navigationDecision(gate.getSnapshot())).toBe('confirm')
    expect(gate.begin()).toBe(false)
    gate.setSafety(ready)
    expect(gate.begin()).toBe(true)
    expect(navigationDecision(gate.getSnapshot())).toBe('wait')
  })
  it('keeps all four named destinations present, marks the current page and announces updates', () => {
    const html = renderToStaticMarkup(<BottomNavigation current={routeTab('strength/history')} blocked={false} updateAvailable onNavigate={() => {}} />)
    for (const label of ['Strength', 'Performance', 'Analytics', 'Settings']) expect(html).toContain(`>${label}</span>`)
    expect(html).toContain('aria-current="page" aria-label="Strength"')
    expect(html).toContain('aria-label="Settings, update available"')
    expect(html.match(/<button/g)).toHaveLength(4)
  })
  it('disables navigation during protected operations without hiding destinations', () => {
    const html = renderToStaticMarkup(<BottomNavigation current="strength" blocked updateAvailable={false} onNavigate={() => {}} />)
    expect(html.match(/disabled=""/g)).toHaveLength(4)
  })
  it('shared buttons default to non-submitting actions inside forms', () => {
    expect(renderToStaticMarkup(<Button>Action</Button>)).toContain('type="button"')
    expect(renderToStaticMarkup(<Button type="submit">Save</Button>)).toContain('type="submit"')
  })
})
