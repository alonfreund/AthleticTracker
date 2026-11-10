export interface Safety { dirty: boolean; busy: boolean; restoring: boolean; loading: boolean }
export function updateBlockReason(safety: Safety): string {
  if (safety.loading) return 'Wait for local records to load.'
  if (safety.busy) return 'Wait for the current save, export or restore operation to finish.'
  if (safety.restoring) return 'Finish or cancel the restore review before updating.'
  if (safety.dirty) return 'Save or discard your unsaved draft before updating.'
  return ''
}

// A synchronous gate: recheck at click AND activation, not just in button rendering.
export class UpdateSafety {
  private safety: Safety = { dirty: false, busy: false, restoring: false, loading: true }
  private applying = false
  private listeners = new Set<() => void>()
  private snapshot = { reason: updateBlockReason(this.safety), applying: false }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  getSnapshot = () => this.snapshot
  private emit() {
    this.snapshot = { reason: updateBlockReason(this.safety), applying: this.applying }
    this.listeners.forEach(listener => listener())
  }
  setSafety(safety: Safety) { this.safety = safety; this.emit() }
  setBusy(busy: boolean) { this.safety = { ...this.safety, busy }; this.emit() }
  begin(): boolean {
    if (this.applying || updateBlockReason(this.safety)) return false
    this.applying = true; this.emit(); return true
  }
  canReload(): boolean { return this.applying && !updateBlockReason(this.safety) }
  end() { this.applying = false; this.emit() }
}
export const updateSafety = new UpdateSafety()
