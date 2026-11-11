import type { SessionExercise, StrengthData, StrengthSet, SupersetGroup } from './models'

export interface WorkoutBlock {
  id: string
  group?: SupersetGroup
  exercises: SessionExercise[]
}

export function workoutBlocks(workout: StrengthData): WorkoutBlock[] {
  const blocks: WorkoutBlock[] = []
  const groups = new Map(workout.supersetGroups.map(group => [group.id, group]))
  const grouped = new Map<string, WorkoutBlock>()
  for (const exercise of [...workout.sessionExercises].sort((a, b) => a.position - b.position)) {
    const group = exercise.supersetGroupId ? groups.get(exercise.supersetGroupId) : undefined
    if (!group) {
      blocks.push({ id: exercise.id, exercises: [exercise] })
    } else {
      let block = grouped.get(group.id)
      if (!block) {
        block = { id: 'superset-' + group.id, group, exercises: [] }
        grouped.set(group.id, block)
        blocks.push(block)
      }
      block.exercises.push(exercise)
    }
  }
  for (const block of blocks) if (block.group) block.exercises = supersetSlots(block.exercises).flat()
  return blocks
}

export function groupLetter(index: number): string {
  let result = ''
  for (let number = index + 1; number > 0; number = Math.floor((number - 1) / 26)) {
    result = String.fromCharCode(65 + (number - 1) % 26) + result
  }
  return result
}

export function workingSets(workout: StrengthData, exerciseId: string) {
  return workout.strengthSets.filter(set => set.sessionExerciseId === exerciseId && set.setType !== 'warm-up')
    .sort((a, b) => a.position - b.position)
}

export function exerciseSlot(exercise: SessionExercise) {
  return exercise.supersetSlotId ? `slot-${exercise.supersetGroupId}-${exercise.supersetSlotId}` : exercise.id
}

export function supersetSlots(exercises: SessionExercise[]) {
  const slots = new Map<string, SessionExercise[]>()
  for (const exercise of exercises) {
    const key = exerciseSlot(exercise)
    const slot = slots.get(key)
    if (slot) slot.push(exercise)
    else slots.set(key, [exercise])
  }
  return [...slots.values()]
}

function groupRounds(workout: StrengthData, exercises: SessionExercise[]) {
  const rounds = new Map<number, { exercise: SessionExercise; set: StrengthSet }[]>()
  for (const slot of supersetSlots(exercises)) {
    for (const exercise of slot) {
      workingSets(workout, exercise.id).forEach((set, ordinal) => {
        const index = set.supersetRoundIndex ?? ordinal
        const entries = rounds.get(index) ?? []
        entries.push({ exercise, set })
        rounds.set(index, entries)
      })
    }
  }
  return rounds
}

export function supersetRound(workout: StrengthData, set: StrengthSet) {
  const exercise = workout.sessionExercises.find(row => row.id === set.sessionExerciseId)
  const group = workout.supersetGroups.find(row => row.id === exercise?.supersetGroupId)
  if (!group || set.setType === 'warm-up') return undefined
  const index = set.supersetRoundIndex ?? workingSets(workout, set.sessionExerciseId).findIndex(row => row.id === set.id)
  const members = workout.sessionExercises.filter(row => row.supersetGroupId === group.id).sort((a, b) => a.position - b.position)
  const entries = groupRounds(workout, members).get(index)
  if (entries) return { group, index, entries, complete: entries.every(entry => entry.set.completed) }
}

export function groupProgress(workout: StrengthData, exercises: SessionExercise[]) {
  const rounds = [...groupRounds(workout, exercises)].sort(([a], [b]) => a - b)
  const total = rounds.length ? rounds[rounds.length - 1][0] + 1 : 0
  for (const [index, entries] of rounds) {
    const next = entries.find(row => !row.set.completed)
    if (next) return { round: index + 1, rounds: total, next: next.exercise, participants: entries.length }
  }
  return { rounds: total }
}
