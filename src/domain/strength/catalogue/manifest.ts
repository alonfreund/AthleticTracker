import { STARTER_EXERCISES } from './original'
import { BATCH_ONE_EXERCISES } from './batch1'
import { BATCH_TWO_EXERCISES } from './batch2'
/** Add approved batches here; never remove or renumber existing reservations. */
export const CATALOGUE_BATCHES = [
  { id: 'original', exercises: STARTER_EXERCISES },
  { id: 'batch-1', exercises: BATCH_ONE_EXERCISES },
  { id: 'batch-2', exercises: BATCH_TWO_EXERCISES },
] as const
export const BUILTIN_EXERCISES = CATALOGUE_BATCHES.flatMap(batch => [...batch.exercises])
