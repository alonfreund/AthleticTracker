import { emptyLoad } from './logging'
import type { StrengthData } from './models'

export function replacementPlan(workout: StrengthData, exerciseId: string) {
  const exercise = workout.sessionExercises.find(row => row.id === exerciseId)
  if (!exercise) return undefined
  const sets = workout.strengthSets.filter(set => set.sessionExerciseId === exerciseId).sort((a, b) => a.position - b.position)
  const remaining = sets.filter(set => !set.completed)
  const completed = sets.length - remaining.length
  const remainingIds = new Set(remaining.map(set => set.id))
  const drafts = workout.editorDrafts.filter(draft => remainingIds.has(draft.setId))
  const drafted = new Set(drafts.map(draft => draft.setId))
  const entered = remaining.filter(set => drafted.has(set.id) || set.reps !== null || set.durationSeconds !== null ||
    set.rpe !== null || set.rir !== null || set.target !== null ||
    JSON.stringify(set.load) !== JSON.stringify(emptyLoad(set.load.mode))).length
  return {
    exercise, remaining, completed, entered,
    discardsNotes: completed === 0 && !!exercise.notes,
    revision: JSON.stringify([exercise, sets, drafts]),
  }
}
