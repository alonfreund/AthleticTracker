import { db, type AthleticDatabase } from '../db/database'
import { DEFAULT_REST_SECONDS, GLOBAL_REST_KEY, validateRestSeconds } from '../../domain/rest'
export async function globalRest(database: AthleticDatabase = db): Promise<number> {
  const value = await database.metadata.get(GLOBAL_REST_KEY)
  return value ? validateRestSeconds(Number(value.value)) : DEFAULT_REST_SECONDS
}
export async function saveGlobalRest(seconds: number, database: AthleticDatabase = db) {
  validateRestSeconds(seconds)
  await database.metadata.put({ key: GLOBAL_REST_KEY, value: String(seconds) })
}

export async function exerciseRest(exerciseId: string, database: AthleticDatabase = db): Promise<number> {
  const preference = await database.exercisePreferences.get(exerciseId)
  return preference?.restSeconds ?? await globalRest(database)
}
export async function setFavourite(exerciseId: string, favourite: boolean, database: AthleticDatabase = db): Promise<void> {
  await database.transaction('rw',database.exercises,database.exercisePreferences,async()=>{
    if(!await database.exercises.get(exerciseId)) throw new Error('Exercise no longer exists.')
    const previous=await database.exercisePreferences.get(exerciseId)
    const now=new Date(Math.max(Date.now(), Date.parse(previous?.updatedAt ?? '1970-01-01T00:00:00.000Z'))).toISOString()
    await database.exercisePreferences.put({ exerciseId, restSeconds:previous?.restSeconds ?? null, favourite, createdAt:previous?.createdAt ?? now, updatedAt:now })
  })
}
