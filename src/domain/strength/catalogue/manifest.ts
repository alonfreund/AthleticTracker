import { STARTER_EXERCISES } from './original'
import { BATCH_ONE_EXERCISES } from './batch1'
import { BATCH_TWO_EXERCISES } from './batch2'
import { BATCH_THREE_EXERCISES } from './batch3'
import { BATCH_FOUR_EXERCISES } from './batch4'
/** Add approved batches here; never remove or renumber existing reservations. */
export const CATALOGUE_BATCHES = [
  { id: 'original', exercises: STARTER_EXERCISES },
  { id: 'batch-1', exercises: BATCH_ONE_EXERCISES },
  { id: 'batch-2', exercises: BATCH_TWO_EXERCISES },
  { id: 'batch-3', exercises: BATCH_THREE_EXERCISES },
  { id: 'batch-4', exercises: BATCH_FOUR_EXERCISES },
] as const
export const BUILTIN_EXERCISES = CATALOGUE_BATCHES.flatMap(batch => [...batch.exercises])
