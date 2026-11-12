import { validatePushupAttempt } from '../../domain/calisthenics/pushups'
import { db } from '../db/database'

export function listPushupAttempts(database = db) {
  return database.pushupAttempts.orderBy('recordedAt').toArray()
}

export async function recordPushupAttempt(reps: number, notes: string, database = db) {
  const attempt = { id: crypto.randomUUID(), recordedAt: new Date().toISOString(), reps, notes: notes.trim() }
  validatePushupAttempt(attempt)
  await database.pushupAttempts.add(attempt)
}

export function deletePushupAttempt(id: string, database = db) {
  return database.pushupAttempts.delete(id)
}
