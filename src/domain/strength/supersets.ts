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

export function supersetRound(workout: StrengthData, set: StrengthSet) {
  const exercise = workout.sessionExercises.find(row => row.id === set.sessionExerciseId)
  const group = workout.supersetGroups.find(row => row.id === exercise?.supersetGroupId)
  if (!group || set.setType === 'warm-up') return undefined
  const index = workingSets(workout, set.sessionExerciseId).findIndex(row => row.id === set.id)
  if (index < 0) return undefined
  const members = workout.sessionExercises.filter(row => row.supersetGroupId === group.id)
    .sort((a, b) => a.position - b.position)
  const entries = members.flatMap(exercise => {
    const set = workingSets(workout, exercise.id)[index]
    return set ? [{ exercise, set }] : []
  })
  return { group, index, entries, complete: entries.every(entry => entry.set.completed) }
}

export function groupProgress(workout: StrengthData, exercises: SessionExercise[]) {
  const sets = exercises.map(exercise => ({ exercise, sets: workingSets(workout, exercise.id) }))
  const rounds = Math.max(0, ...sets.map(row => row.sets.length))
  for (let index = 0; index < rounds; index++) {
    const entries = sets.flatMap(row => row.sets[index] ? [{ exercise: row.exercise, set: row.sets[index] }] : [])
    const next = entries.find(row => !row.set.completed)
    if (next) return { round: index + 1, rounds, next: next.exercise, participants: entries.length }
  }
  return { rounds }
}
