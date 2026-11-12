import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readExerciseAnalytics } from '../src/data/repositories/analytics'
import { addWorkoutExercise, cancelWorkout, deleteFinishedWorkout, editFinishedWorkout, finishWorkout, loadWorkout, saveInlineSet, startWorkout } from '../src/data/repositories/workouts'
import { analyticsExerciseKey, exerciseProgress } from '../src/domain/strength/analytics'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import type { Exercise, StrengthSet } from '../src/domain/strength/models'

const bench = STARTER_EXERCISES[0]
const stamp = '2026-01-01T10:00:00.000Z'
function set(id: string, overrides: Partial<StrengthSet> = {}): StrengthSet {
  return { id, sessionExerciseId: 'exercise', position: 0, setType: 'normal', completed: true, completedAt: stamp, reps: 10,
    durationSeconds: null, load: { mode: 'external', weight: { value: 20, unit: 'kg' } }, rpe: null, rir: null, target: null,
    createdAt: stamp, updatedAt: stamp, ...overrides }
}

it('combines mixed units, counts both dumbbells once, and applies the 1RM rep cap', () => {
  const snapshot: Exercise = { ...bench, metadata: { ...bench.metadata!, repetitionConvention: 'total' }, tracking: { ...bench.tracking, weightConvention: 'per-hand' } }
  const sessions = [
    { id: 'first', title: 'First', startedAt: stamp, sets: [
      set('warmup', { setType: 'warm-up', load: { mode: 'external', weight: { value: 90, unit: 'kg' } } }),
      set('incomplete', { completed: false, reps: 100 }),
      set('dumbbell'),
      set('pounds', { reps: 1, load: { mode: 'external', weight: { value: 50, unit: 'lb' } } }),
    ] },
    { id: 'second', title: 'Second', startedAt: stamp, sets: [set('high-reps', { reps: 15 })] },
  ]
  const results = exerciseProgress({ key: analyticsExerciseKey(snapshot), snapshot, sessions })
  const metrics = Object.fromEntries(results.map(entry => [entry.metric, entry]))
  expect(metrics.load.record.value).toBeCloseTo(22.6796)
  expect(metrics.estimatedMax.record.value).toBeCloseTo(26.6667)
  expect(metrics.estimatedMax.points).toHaveLength(1)
  expect(metrics.reps.record.set?.id).toBe('high-reps')
  expect(metrics.volume.points[0].value).toBeCloseTo(445.3592)
  expect(metrics.volume.record.session.id).toBe('second')
})

it('chooses the least assistance, handles timed holds, and keeps distinct tracking conventions separate', () => {
  const assisted: Exercise = { ...bench, tracking: { load: 'assisted', measurement: 'reps', weightConvention: 'machine-display' } }
  const hold: Exercise = { ...bench, tracking: { load: 'bodyweight', measurement: 'duration', weightConvention: null } }
  const profile = (snapshot: Exercise, sets: StrengthSet[]) => exerciseProgress({
    key: analyticsExerciseKey(snapshot), snapshot, sessions: [{ id: 'test', title: 'Test', startedAt: stamp, sets }],
  })
  const assistance = (value: number, unit: 'kg' | 'lb') => ({ mode: 'assisted' as const, assistance: { value, unit }, bodyweight: null })
  const assistedProgress = profile(assisted, [set('heavy-help', { load: assistance(20, 'kg') }), set('light-help', { load: assistance(30, 'lb') })])
  expect(assistedProgress.map(entry => entry.metric)).toEqual(['reps', 'assistance'])
  expect(assistedProgress[1].record.set?.id).toBe('light-help')
  const timed = profile(hold, [set('hold', { load: { mode: 'bodyweight', bodyweight: null }, reps: null, durationSeconds: 42 })])
  expect(timed.map(entry => [entry.metric, entry.record.value])).toEqual([['hold', 42]])
  expect(analyticsExerciseKey(assisted)).not.toBe(analyticsExerciseKey(hold))
})

it('uses saved exercise identity, combines repeated cards, and recalculates after edit, delete and restore', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(db)
    await db.exercises.add(bench)
    async function log(id: string, reps: number, weight: number) {
      const card = await addWorkoutExercise(id, bench.id, db)
      const row = (await loadWorkout(id, db)).strengthSets.find(item => item.sessionExerciseId === card)!
      const input = inputFromSet(row)
      input.values.reps = String(reps)
      input.values.weight = String(weight)
      expect((await saveInlineSet(id, row.id, input, true, db)).applied).toBe(true)
      return { row, card, input }
    }
    vi.setSystemTime(new Date(stamp))
    const id = await startWorkout(db)
    const first = await log(id, 8, 40)
    await log(id, 6, 45)
    await db.sessionExercises.update(first.card, { sourceExerciseId: null })
    await finishWorkout(id, false, db)
    const cancelled = await startWorkout(db)
    await log(cancelled, 10, 200)
    await cancelWorkout(cancelled, db)
    const active = await startWorkout(db)
    await log(active, 12, 150)
    const [exercise] = await readExerciseAnalytics(db)
    expect(exercise.sessions.map(session => session.id)).toEqual([id])
    expect(exercise.sessions[0].sets).toHaveLength(2)
    expect(exerciseProgress(exercise).find(entry => entry.metric === 'volume')?.record.value).toBe(590)
    const baseline = await loadWorkout(id, db)
    first.input.values.weight = '50'
    const edited = await editFinishedWorkout(baseline, {
      title: 'Corrected', notes: '', startedAt: stamp, removedSetIds: [],
      sets: [{ id: first.row.id, exerciseId: first.card, input: first.input, completed: true, setType: 'normal' }],
    }, db)
    const [corrected] = await readExerciseAnalytics(db)
    expect(exerciseProgress(corrected).find(entry => entry.metric === 'load')?.record).toMatchObject({ value: 50, session: { id, title: 'Corrected' } })
    const backup = await createBackup(db)
    await deleteFinishedWorkout(edited, db)
    expect(await readExerciseAnalytics(db)).toEqual([])
    await restoreBackup(backup, db)
    expect(await readExerciseAnalytics(db)).toEqual([corrected])
  } finally {
    vi.useRealTimers()
    await db.delete()
  }
})

it('keeps ambiguous per-hand logging separate and omits incompatible volume and machine 1RM', () => {
  const ambiguous: Exercise = { ...bench, tracking: { ...bench.tracking, weightConvention: 'per-hand' } }
  const explicit: Exercise = { ...ambiguous, metadata: { ...bench.metadata!, repetitionConvention: 'total' } }
  const perSide: Exercise = { ...ambiguous, metadata: { ...bench.metadata!, repetitionConvention: 'per-side' } }
  const machine: Exercise = { ...bench, tracking: { ...bench.tracking, weightConvention: 'machine-display' } }
  const metrics = (snapshot: Exercise) => exerciseProgress({
    key: analyticsExerciseKey(snapshot), snapshot, sessions: [{ id: 'test', title: 'Test', startedAt: stamp, sets: [set('set')] }],
  }).map(series => series.metric)
  expect(analyticsExerciseKey(ambiguous)).not.toBe(analyticsExerciseKey(explicit))
  expect(metrics(ambiguous)).toEqual(['load', 'reps', 'estimatedMax'])
  expect(metrics(explicit)).toContain('volume')
  expect(metrics(perSide)).not.toContain('volume')
  expect(metrics(machine)).toEqual(['load', 'reps'])
})
