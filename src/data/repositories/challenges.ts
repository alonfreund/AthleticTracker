import { db, type AthleticDatabase } from '../db/database'
import { isBetter, validateChallenge, validateChallengeAttempt, type Challenge, type Result } from '../../domain/challenges/models'

export async function createChallenge(input: Omit<Challenge, 'id'>, database = db) {
  const challenge = { ...input, id: crypto.randomUUID() }
  validateChallenge(challenge)
  await database.challenges.add(challenge)
  return challenge
}

export function listChallengeAttempts(id: string, database = db) {
  return database.challengeAttempts.where('[challengeId+recordedAt]').between([id, ''], [id, '\uffff']).toArray()
}

export async function recordChallengeAttempt(challengeId: string, results: (Result | null)[], notes: string, database = db) {
  const attempt = { id: crypto.randomUUID(), challengeId, recordedAt: new Date().toISOString(), results, notes: notes.trim() }
  await database.transaction('rw', [database.challenges, database.challengeAttempts], async () => {
    const challenge = await database.challenges.get(challengeId)
    if (!challenge) throw new Error('Challenge unavailable.')
    validateChallengeAttempt(attempt, challenge)
    await database.challengeAttempts.add(attempt)
  })
}

export async function listChallenges(database: AthleticDatabase = db) {
  return database.transaction('r', [database.challenges, database.challengeAttempts], async () => {
    const challenges = await database.challenges.orderBy('name').toArray()
    return Promise.all(challenges.map(async challenge => {
      const attempts = await listChallengeAttempts(challenge.id, database)
      const direction = challenge.metrics[0].direction
      let best: Result | undefined
      if (direction !== 'trend') for (const attempt of attempts) {
        const result = attempt.results[0]!
        if (best === undefined || isBetter(result, best, direction)) best = result
      }
      return { challenge, latest: attempts.at(-1)?.results[0], best }
    }))
  })
}
