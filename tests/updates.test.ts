import { describe, expect, it } from 'vitest'
import { UpdateSafety, updateBlockReason, type Safety } from '../src/app/updateSafety'
const ready: Safety = { dirty: false, busy: false, restoring: false, loading: false }

describe('safe update gate', () => {
  it('blocks startup until records finish loading', () => {
    const gate = new UpdateSafety()
    expect(gate.begin()).toBe(false)
    expect(gate.getSnapshot().reason).toContain('load')
  })
  it.each([
    [{ dirty: true }, 'draft'],
    [{ busy: true }, 'operation'],
    [{ restoring: true }, 'restore review'],
  ])('blocks unsafe state %j', (change, explanation) => {
    const gate = new UpdateSafety()
    gate.setSafety({ ...ready, ...change })
    expect(gate.getSnapshot().reason).toContain(explanation)
    expect(gate.begin()).toBe(false)
    expect(gate.canReload()).toBe(false)
  })
  it('permits explicit activation only when safe, and rejects duplicate requests', () => {
    const gate = new UpdateSafety()
    gate.setSafety(ready)
    expect(gate.canReload()).toBe(false) // External activation cannot trigger a reload.
    expect(gate.begin()).toBe(true)
    expect(gate.begin()).toBe(false)
    expect(gate.getSnapshot().applying).toBe(true)
    expect(gate.canReload()).toBe(true)
    gate.end()
    expect(gate.canReload()).toBe(false)
    expect(gate.getSnapshot().applying).toBe(false)
  })
  it('rechecks safety at activation rather than trusting the earlier click', () => {
    const gate = new UpdateSafety()
    gate.setSafety(ready)
    gate.begin()
    gate.setBusy(true)
    expect(gate.canReload()).toBe(false)
    gate.setSafety({ ...ready, dirty: true })
    expect(gate.canReload()).toBe(false)
  })
  it('failed operations leave an unsaved draft protected; saving releases the gate', () => {
    const gate = new UpdateSafety()
    gate.setSafety({ ...ready, dirty: true })
    gate.setBusy(true)
    gate.setBusy(false)
    expect(gate.begin()).toBe(false)
    gate.setSafety(ready)
    expect(gate.begin()).toBe(true)
  })
  it('reports the active operation before the draft it is saving', () => {
    expect(updateBlockReason({ ...ready, dirty: true, busy: true })).toContain('operation')
  })
})
