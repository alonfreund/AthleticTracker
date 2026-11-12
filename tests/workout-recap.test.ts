import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readWorkoutRecapRecords } from '../src/data/repositories/analytics'
import { addSet, addWorkoutExercise, changeSetType, finishWorkout, loadWorkout, saveInlineSet, startWorkout } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'

it('compares the saved workout with earlier sessions and restores the same recap from backup', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const target = new AthleticDatabase(crypto.randomUUID())
  const bench = STARTER_EXERCISES[0]
  try {
    await verifyLocalStorage(db)
    await db.exercises.add(bench)
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'))
    async function finish(weights: number[], warmup?: number) {
      const id = await startWorkout(db)
      const card = await addWorkoutExercise(id, bench.id, db)
      const first = (await loadWorkout(id, db)).strengthSets[0]
      async function save(setId: string, weight: number) {
        const set = (await loadWorkout(id, db)).strengthSets.find(row => row.id === setId)!
        const input = inputFromSet(set)
        input.values.weight = String(weight)
        input.values.reps = '8'
        expect((await saveInlineSet(id, setId, input, true, db)).applied).toBe(true)
      }
      await save(first.id, weights[0])
      for (const weight of weights.slice(1)) await save(await addSet(id, card, db), weight)
      if (warmup) {
        const setId = await addSet(id, card, db)
        await changeSetType(id, setId, 'warm-up', db)
        await save(setId, warmup)
      }
      await addSet(id, card, db)
      return finishWorkout(id, true, db)
    }
    const first = await finish([40])
    expect(await readWorkoutRecapRecords(first, db)).toEqual([])
    vi.setSystemTime(new Date('2026-01-02T10:00:00Z'))
    const saved = await finish([45, 50], 100)
    expect(saved).toEqual(await loadWorkout(saved.sessions[0].id, db))
    expect(saved.sessions[0].status).toBe('finished')
    const records = await readWorkoutRecapRecords(saved, db)
    expect(records.map(({ metric, previous, current }) => [metric, previous, current])).toEqual([
      ['load', 40, 50],
      ['estimatedMax', 40 * (1 + 8 / 30), 50 * (1 + 8 / 30)],
      ['volume', 320, 760],
    ])
    vi.setSystemTime(new Date('2026-01-03T10:00:00Z'))
    await finish([120])
    await restoreBackup(await createBackup(db), target)
    const restored = await loadWorkout(saved.sessions[0].id, target)
    expect(await readWorkoutRecapRecords(restored, target)).toEqual(records)
  } finally {
    vi.useRealTimers()
    await db.delete()
    await target.delete()
  }
})
