import type { Workout } from '../../data/repositories/workouts'
import { inputFromSet, type SetInput } from '../../domain/strength/logging'

type Result = { applied: boolean; error: string }
export type InlineRow = { input: SetInput; dirty: boolean; pending: boolean; error: string; saving: number }
/** One queue per workout prevents stale draft writes from overtaking completion. */
export class InlineSetStore {
  private rows: Record<string, InlineRow> = {}
  private revisions: Record<string, number> = {}
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
  private queue = Promise.resolve()
  private listeners = new Set<() => void>()
  private snapshot = { rows: this.rows, dirty: false, saving: false }
  constructor(workout: Workout, private persist: (id: string, input: SetInput, complete?: boolean) => Promise<Result>) { this.sync(workout) }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  getSnapshot = () => this.snapshot
  private emit() {
    this.snapshot = { rows: { ...this.rows }, dirty: Object.values(this.rows).some(row => row.dirty), saving: Object.values(this.rows).some(row => row.saving > 0) }
    this.listeners.forEach(listener => listener())
  }
  sync(workout: Workout) {
    const ids = new Set(workout.strengthSets.map(set => set.id))
    for (const id of Object.keys(this.rows)) if (!ids.has(id)) { clearTimeout(this.timers.get(id)); this.timers.delete(id); delete this.rows[id] }
    for (const set of workout.strengthSets) if (!this.rows[set.id]) {
      const draft = workout.editorDrafts.find(row => row.setId === set.id)
      this.rows[set.id] = { input: draft ?? inputFromSet(set), dirty: false, pending: !!draft, error: '', saving: 0 }; this.revisions[set.id] = 0
    }
    this.emit()
  }
  change(id: string, input: SetInput) {
    this.revisions[id]++; this.rows[id] = { ...this.rows[id], input, dirty: true, pending: true, error: '' }
    clearTimeout(this.timers.get(id))
    this.timers.set(id, setTimeout(() => { this.timers.delete(id); void this.save(id).catch(() => {}) }, 300))
    this.emit()
  }
  save(id: string, complete?: boolean): Promise<void> {
    clearTimeout(this.timers.get(id)); this.timers.delete(id)
    const row = this.rows[id]
    if (!row || (!row.dirty && !row.pending && complete === undefined)) return this.queue
    const revision = this.revisions[id], input = structuredClone(row.input)
    this.rows[id] = { ...row, saving: row.saving + 1 }; this.emit()
    const operation = this.queue.catch(() => {}).then(async () => {
      try {
        const result = await this.persist(id, input, complete)
        if (this.rows[id] && this.revisions[id] === revision) this.rows[id] = { ...this.rows[id], dirty: false, pending: !result.applied, error: result.error }
      } catch (error) {
        if (this.rows[id]) this.rows[id] = { ...this.rows[id], dirty: true, error: error instanceof Error ? error.message : 'Could not save. Retry.' }
        throw error
      } finally {
        if (this.rows[id]) this.rows[id] = { ...this.rows[id], saving: this.rows[id].saving - 1 }
        this.emit()
      }
    })
    this.queue = operation
    return operation
  }
  async flush() {
    const writes = Object.keys(this.rows).filter(id => this.rows[id].dirty).map(id => this.save(id))
    await Promise.all(writes); await this.queue
    if (Object.values(this.rows).some(row => row.dirty)) throw new Error('Some changes could not be saved. Retry before continuing.')
  }
  reset(id: string, input: SetInput) {
    clearTimeout(this.timers.get(id)); this.timers.delete(id)
    this.revisions[id]++; this.rows[id] = { input, dirty: false, pending: false, error: '', saving: 0 }; this.emit()
  }
  dispose() { for (const timer of this.timers.values()) clearTimeout(timer); this.timers.clear() }
}
