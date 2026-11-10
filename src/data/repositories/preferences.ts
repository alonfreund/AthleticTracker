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
