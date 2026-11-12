import { validatePlancheAttempt, type PlancheMovement } from '../../domain/calisthenics/planche'
import { db, type AthleticDatabase } from '../db/database'

export function listPlancheAttempts(movement: PlancheMovement, database = db) {
  return database.plancheAttempts.where('[movement+recordedAt]').between([movement, ''], [movement, '\uffff']).toArray()
}

export async function recordPlancheAttempt(movement: PlancheMovement, value: number, notes: string, database = db) {
  const attempt = { id: crypto.randomUUID(), recordedAt: new Date().toISOString(), movement, value, notes: notes.trim() }
  validatePlancheAttempt(attempt)
  await database.plancheAttempts.add(attempt)
}

export function deletePlancheAttempt(id: string, database = db) {
  return database.plancheAttempts.delete(id)
}
