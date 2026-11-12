import { db, type AthleticDatabase } from '../db/database'
import { MUSCLEUP_REQUIREMENTS, REQUIREMENT_IDS, validateMuscleupAttempt, type MuscleupMovement } from '../../domain/calisthenics/muscleups'

export function listMuscleupAttempts(movement: MuscleupMovement, database = db) {
  return database.muscleupAttempts.where('[movement+recordedAt]').between([movement, ''], [movement, '\uffff']).toArray()
}

export async function recordMuscleupAttempt(movement: MuscleupMovement, value: number, notes: string, database = db) {
  const attempt = { id: crypto.randomUUID(), recordedAt: new Date().toISOString(), movement, value, notes: notes.trim() }
  validateMuscleupAttempt(attempt)
  await database.muscleupAttempts.add(attempt)
}

export async function muscleupRequirements(database = db) {
  return database.transaction('r', [database.pullupAttempts, database.muscleupAttempts], () => Promise.all(REQUIREMENT_IDS.map(async movement => {
    const config = MUSCLEUP_REQUIREMENTS[movement]
    const values = movement === 'pullups'
      ? (await database.pullupAttempts.toArray()).map(row => row.reps)
      : (await listMuscleupAttempts(movement, database)).map(row => row.value)
    const best = values.reduce((best, value) => Math.max(best, value), 0)
    return { movement, config, best, met: best >= config.goal }
  })))
}

export function deleteMuscleupAttempt(id: string, database = db) {
  return database.muscleupAttempts.delete(id)
}
