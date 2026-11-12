import 'fake-indexeddb/auto'
import { expect, it, vi } from 'vitest'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readSetRecordBaselines } from '../src/data/repositories/analytics'
import { addSet, addWorkoutExercise, changeSetType, finishWorkout, loadWorkout, saveInlineSet, startWorkout } from '../src/data/repositories/workouts'
import { analyticsExerciseKey } from '../src/domain/strength/analytics'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'
import { completedSetRecords } from '../src/domain/strength/setRecords'

it('only medals saved working sets that beat finished history, and recalculates on reopen and uncheck', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const exercise = STARTER_EXERCISES[0]
  const keys = new Set([analyticsExerciseKey(exercise)])
  let minute = 0
  const advance = () => vi.setSystemTime(new Date(2026, 0, 1, 8, minute++))
  try {
    await verifyLocalStorage(db)
    await db.exercises.add(exercise)
    async function setup() {
      advance()
      const id = await startWorkout(db)
      const card = await addWorkoutExercise(id, exercise.id, db)
      const row = (await loadWorkout(id, db)).strengthSets[0]
      return { id, card, row }
    }
    async function save(id: string, setId: string, weight: number, unit: 'kg' | 'lb' = 'kg', complete = true) {
      advance()
      const row = (await loadWorkout(id, db)).strengthSets.find(row => row.id === setId)!
      const input = inputFromSet(row)
      input.weightUnit = unit
      input.values.weight = String(weight)
      input.values.reps = '8'
      expect((await saveInlineSet(id, setId, input, complete, db)).applied).toBe(true)
    }

    const first = await setup()
    await save(first.id, first.row.id, 40)
    const initial = await loadWorkout(first.id, db)
    expect(completedSetRecords(initial, await readSetRecordBaselines(keys, initial.sessions[0].startedAt, db)).size).toBe(0)
    await finishWorkout(first.id, false, db)

    const next = await setup()
    const tie = next.row.id
    const medal = await addSet(next.id, next.card, db)
    const warmup = await addSet(next.id, next.card, db)
    const lower = await addSet(next.id, next.card, db)
    await changeSetType(next.id, warmup, 'warm-up', db)
    await save(next.id, tie, 40)
    await save(next.id, warmup, 100)
    await save(next.id, medal, 110, 'lb')
    await save(next.id, lower, 45)
    const startedAt = (await loadWorkout(next.id, db)).sessions[0].startedAt
    const readRecords = async () => completedSetRecords(await loadWorkout(next.id, db), await readSetRecordBaselines(keys, startedAt, db))
    expect([...await readRecords()]).toEqual([[medal, ['load', 'estimatedMax']]])
    db.close()
    await db.open()
    expect([...await readRecords()]).toEqual([[medal, ['load', 'estimatedMax']]])
    await save(next.id, medal, 110, 'lb', false)
    expect([...await readRecords()]).toEqual([[lower, ['load', 'estimatedMax']]])
  } finally {
    vi.useRealTimers()
    await db.delete()
  }
})
