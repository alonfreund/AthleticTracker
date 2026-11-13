import { db, type AthleticDatabase } from '../db/database'
import { challengeRoot, challengeVersion, isBetter, validateChallenge, validateChallengeAttempt, type Challenge, type ChallengeSetup, type Result } from '../../domain/challenges/models'

export async function createChallenge(input: ChallengeSetup, database = db) {
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
    const versions = await listChallengeVersions(challengeRoot(challenge), database)
    if (versions[0]?.id !== challengeId) throw new Error('Log new attempts on the current version.')
    validateChallengeAttempt(attempt, challenge)
    await database.challengeAttempts.add(attempt)
  })
}

export async function listChallenges(database: AthleticDatabase = db) {
  return database.transaction('r', [database.challenges, database.challengeAttempts], async () => {
    const rows = await database.challenges.orderBy('name').toArray()
    const current = new Map<string, Challenge>()
    for (const row of rows) {
      const root = challengeRoot(row)
      const previous = current.get(root)
      if (!previous || challengeVersion(row) > challengeVersion(previous)) current.set(root, row)
    }
    const challenges = [...current.values()].sort((a, b) => a.name.localeCompare(b.name))
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

export async function listChallengeVersions(rootId: string, database = db) {
  const root = await database.challenges.get(rootId)
  if (!root || root.rootId) return []
  const versions = await database.challenges.where('rootId').equals(rootId).toArray()
  return [root, ...versions].sort((a, b) => challengeVersion(b) - challengeVersion(a))
}

export async function updateChallenge(id: string, input: ChallengeSetup, changesTest: boolean, database = db) {
  return database.transaction('rw', [database.challenges, database.challengeAttempts], async () => {
    const old = await database.challenges.get(id)
    if (!old) throw new Error('Challenge unavailable.')
    const rootId = challengeRoot(old)
    const versions = await listChallengeVersions(rootId, database)
    if (versions[0]?.id !== id) throw new Error('Open the current version to edit this challenge.')
    const changesMetrics = old.metrics.length !== input.metrics.length ||
      old.metrics.some((metric, index) => metric.type !== input.metrics[index]?.type || metric.unit !== input.metrics[index]?.unit)
    const hasAttempts = await database.challengeAttempts.where('[challengeId+recordedAt]').between([id, ''], [id, '\uffff']).count()
    const versionFields = old.rootId ? { rootId, version: old.version } : {}
    const next = (changesTest || changesMetrics) && hasAttempts
      ? { ...input, id: crypto.randomUUID(), rootId, version: challengeVersion(old) + 1 }
      : { ...input, id, ...versionFields }
    validateChallenge(next)
    await database.challenges.put(next)
    await database.challenges.bulkPut(versions.filter(row => row.id !== next.id)
      .map(row => ({ ...row, name: next.name, kind: next.kind })))
    return next
  })
}

export async function updateChallengeAttempt(id: string, results: (Result | null)[], notes: string, database = db) {
  await database.transaction('rw', [database.challenges, database.challengeAttempts], async () => {
    const old = await database.challengeAttempts.get(id)
    const challenge = old && await database.challenges.get(old.challengeId)
    if (!old || !challenge) throw new Error('Attempt unavailable.')
    const attempt = { ...old, results, notes: notes.trim() }
    validateChallengeAttempt(attempt, challenge)
    await database.challengeAttempts.put(attempt)
  })
}

export function deleteChallengeAttempt(id: string, database = db) {
  return database.challengeAttempts.delete(id)
}

export async function deleteChallenge(rootId: string, expectedAttempts: number, database = db) {
  await database.transaction('rw', [database.challenges, database.challengeAttempts], async () => {
    const versions = await listChallengeVersions(rootId, database)
    const attempts = await Promise.all(versions.map(version => listChallengeAttempts(version.id, database)))
    if (attempts.flat().length !== expectedAttempts) throw new Error('The attempt count changed. Review and confirm again.')
    await database.challengeAttempts.bulkDelete(attempts.flat().map(attempt => attempt.id))
    await database.challenges.bulkDelete(versions.map(version => version.id))
  })
}
