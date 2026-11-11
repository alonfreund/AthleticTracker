import type { Routine, RoutineExercise } from '../../domain/strength/routines'
import { validateRoutine, validateRoutineExercise } from '../../domain/strength/validation'
import { db } from '../db/database'

export function listRoutines(database = db) {
  return database.transaction('r', database.routines, database.routineExercises, async () => {
    const routines = await database.routines.toArray()
    const rows = await database.routineExercises.toArray()
    return routines.sort((a, b) => a.title.localeCompare(b.title)).map(routine => ({
      ...routine, exercises: rows.filter(row => row.routineId === routine.id).sort((a, b) => a.position - b.position),
    }))
  })
}

export function routineExercises(id: string, database = db) {
  return database.routineExercises.where('[routineId+position]').between([id, 0], [id, Number.MAX_SAFE_INTEGER], true, true).toArray()
}

export function saveRoutine(input: Pick<Routine, 'title' | 'notes'> & { id?: string }, exercises: RoutineExercise[], database = db) {
  return database.transaction('rw', database.routines, database.routineExercises, async () => {
    const current = input.id ? await database.routines.get(input.id) : undefined
    if (input.id && !current) throw new Error('Routine no longer exists.')
    if (!exercises.length) throw new Error('Add at least one exercise.')
    const now = new Date().toISOString()
    const routine = { id: current?.id ?? crypto.randomUUID(), title: input.title.trim(), notes: input.notes, createdAt: current?.createdAt ?? now, updatedAt: current && current.updatedAt > now ? current.updatedAt : now }
    validateRoutine(routine)
    const rows = exercises.map((row, position) => ({ ...row, routineId: routine.id, position }))
    rows.forEach(validateRoutineExercise)
    if (current) await database.routineExercises.bulkDelete((await routineExercises(routine.id, database)).map(row => row.id))
    await database.routines.put(routine)
    await database.routineExercises.bulkAdd(rows)
    return routine.id
  })
}

export function deleteRoutine(id: string, database = db) {
  return database.transaction('rw', database.routines, database.routineExercises, async () => {
    await database.routineExercises.bulkDelete((await routineExercises(id, database)).map(row => row.id))
    await database.routines.delete(id)
  })
}
