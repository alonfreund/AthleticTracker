export const PUSHUP_GOAL = 100
export const PUSHUP_MILESTONES = [10, 25, 50, 75, PUSHUP_GOAL] as const
export const MAX_PUSHUP_REPS = 10000

export type PushupAttempt = { id: string; recordedAt: string; reps: number; notes: string }

export function validatePushupAttempt(value: unknown): asserts value is PushupAttempt {
  validateRepAttempt(value, 'Invalid push-up attempt.')
}

export function validateRepAttempt(value: unknown, message = 'Invalid repetition attempt.'): asserts value is PushupAttempt {
  const row = value as PushupAttempt
  if (!row || typeof row !== 'object' || Array.isArray(row) ||
    Object.keys(row).length !== 4 || !['id', 'recordedAt', 'reps', 'notes'].every(key => Object.hasOwn(row, key)) ||
    typeof row.id !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(row.id) ||
    typeof row.recordedAt !== 'string' || !Number.isFinite(Date.parse(row.recordedAt)) ||
    new Date(row.recordedAt).toISOString() !== row.recordedAt ||
    !Number.isSafeInteger(row.reps) || row.reps < 0 || row.reps > MAX_PUSHUP_REPS ||
    typeof row.notes !== 'string' || row.notes.length > 10000) throw new Error(message)
}

export function pushupProgress(attempts: PushupAttempt[], milestones: readonly number[] = PUSHUP_MILESTONES) {
  return attemptProgress(attempts, attempt => attempt.reps, milestones)
}

export function milestoneReached(best: number | undefined, milestone: number, lowerIsBetter = false) {
  return best !== undefined && (lowerIsBetter ? best <= milestone : best >= milestone)
}

export function attemptProgress<T>(attempts: T[], value: (attempt: T) => number, milestones: readonly number[], lowerIsBetter = false) {
  let best: number | undefined
  const timeline = attempts.map(attempt => {
    const result = value(attempt)
    best = best === undefined ? result : lowerIsBetter ? Math.min(best, result) : Math.max(best, result)
    return { ...attempt, best }
  })
  return { timeline, latest: attempts.length ? value(attempts.at(-1)!) : undefined, best,
    next: milestones.find(milestone => !milestoneReached(best, milestone, lowerIsBetter)) }
}
