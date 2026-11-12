import { validatePushupAttempt, validateRepAttempt } from '../../domain/calisthenics/pushups'
import type { RepTrack } from '../../domain/calisthenics/repTracks'
import { db, type AthleticDatabase } from '../db/database'

function attemptTable(track: RepTrack, database: AthleticDatabase) {
  return track === 'pushups' ? database.pushupAttempts : database.pullupAttempts
}

export function listRepAttempts(track: RepTrack, database = db) {
  return attemptTable(track, database).orderBy('recordedAt').toArray()
}

export async function recordRepAttempt(track: RepTrack, reps: number, notes: string, database = db) {
  const attempt = { id: crypto.randomUUID(), recordedAt: new Date().toISOString(), reps, notes: notes.trim() }
  if (track === 'pushups') validatePushupAttempt(attempt)
  else validateRepAttempt(attempt)
  await attemptTable(track, database).add(attempt)
}

export function deleteRepAttempt(track: RepTrack, id: string, database = db) {
  return attemptTable(track, database).delete(id)
}
