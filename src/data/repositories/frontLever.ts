import { validateFrontLeverAttempt, type FrontLeverMovement } from '../../domain/calisthenics/frontLever'
import { db, type AthleticDatabase } from '../db/database'

export function listFrontLeverAttempts(movement: FrontLeverMovement, database = db) {
  return database.frontLeverAttempts.where('[movement+recordedAt]').between([movement, ''], [movement, '\uffff']).toArray()
}

export async function recordFrontLeverAttempt(movement: FrontLeverMovement, value: number, notes: string, database = db) {
  const attempt = { id: crypto.randomUUID(), recordedAt: new Date().toISOString(), movement, value, notes: notes.trim() }
  validateFrontLeverAttempt(attempt)
  await database.frontLeverAttempts.add(attempt)
}

export function deleteFrontLeverAttempt(id: string, database = db) {
  return database.frontLeverAttempts.delete(id)
}
