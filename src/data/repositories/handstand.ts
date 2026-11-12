import { validateHandstandAttempt, type HandstandMovement } from '../../domain/calisthenics/handstand'
import { db, type AthleticDatabase } from '../db/database'

export function listHandstandAttempts(movement: HandstandMovement, database = db) {
  return database.handstandAttempts.where('[movement+recordedAt]').between([movement, ''], [movement, '\uffff']).toArray()
}

export async function recordHandstandAttempt(movement: HandstandMovement, value: number, notes: string, database = db) {
  const attempt = { id: crypto.randomUUID(), recordedAt: new Date().toISOString(), movement, value, notes: notes.trim() }
  validateHandstandAttempt(attempt)
  await database.handstandAttempts.add(attempt)
}

export function deleteHandstandAttempt(id: string, database = db) {
  return database.handstandAttempts.delete(id)
}
