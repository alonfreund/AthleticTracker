import { db } from '../db/database'
import { deleteRepAttempt, listRepAttempts, recordRepAttempt } from './repAttempts'

export function listPushupAttempts(database = db) {
  return listRepAttempts('pushups', database)
}

export function recordPushupAttempt(reps: number, notes: string, database = db) {
  return recordRepAttempt('pushups', reps, notes, database)
}

export function deletePushupAttempt(id: string, database = db) {
  return deleteRepAttempt('pushups', id, database)
}
