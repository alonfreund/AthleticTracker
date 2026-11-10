import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BottomNavigation } from '../src/components/ui/BottomNavigation'
import { Button } from '../src/components/ui/Button'
import { DESTINATIONS, destinationFromHash, destinationHash, navigationDecision } from '../src/app/navigation'
import { UpdateSafety } from '../src/app/updateSafety'

const ready = { dirty: false, busy: false, restoring: false, loading: false, applying: false }
describe('app-shell navigation', () => {
  it('resolves stable root destinations and defaults unknown URLs to Train', () => {
    for (const destination of DESTINATIONS) expect(destinationFromHash(destinationHash(destination))).toBe(destination)
    expect(destinationFromHash('')).toBe('train')
    expect(destinationFromHash('#/unknown')).toBe('train')
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
    const html = renderToStaticMarkup(<BottomNavigation current="history" blocked={false} updateAvailable onNavigate={() => {}} />)
    for (const label of ['Train', 'History', 'Library', 'Settings']) expect(html).toContain(`>${label}</span>`)
    expect(html).toContain('aria-current="page" aria-label="History"')
    expect(html).toContain('aria-label="Settings, update available"')
    expect(html.match(/<button/g)).toHaveLength(4)
  })
  it('disables navigation during protected operations without hiding destinations', () => {
    const html = renderToStaticMarkup(<BottomNavigation current="train" blocked updateAvailable={false} onNavigate={() => {}} />)
    expect(html.match(/disabled=""/g)).toHaveLength(4)
  })
  it('shared buttons default to non-submitting actions inside forms', () => {
    expect(renderToStaticMarkup(<Button>Action</Button>)).toContain('type="button"')
    expect(renderToStaticMarkup(<Button type="submit">Save</Button>)).toContain('type="submit"')
  })
})
