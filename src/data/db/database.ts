import { legacyPreference, normalizeDefinition } from '../../domain/strength/exerciseMetadata'
import Dexie, { type Table } from 'dexie'
import type { Exercise, Session, SessionActivity, SessionExercise, StrengthSet, SupersetGroup, RestTimer, EditorDraft, ExercisePreference, CatalogueState } from '../../domain/strength/models'
import { STRENGTH_TABLES } from '../../domain/strength/models'
import type { AppMetadata, FoundationRecord } from '../../domain/foundation'

export const BACKUP_TABLES = ['metadata', 'foundationRecords', ...STRENGTH_TABLES, 'exercisePreferences', 'catalogueState'] as const

export class AthleticDatabase extends Dexie {
  exercisePreferences!: Table<ExercisePreference, string>
  catalogueState!: Table<CatalogueState, string>
  metadata!: Table<AppMetadata, string>
  foundationRecords!: Table<FoundationRecord, string>
  exercises!: Table<Exercise, string>
  sessions!: Table<Session, string>
  sessionActivities!: Table<SessionActivity, string>
  sessionExercises!: Table<SessionExercise, string>
  strengthSets!: Table<StrengthSet, string>
  supersetGroups!: Table<SupersetGroup, string>
  restTimers!: Table<RestTimer, string>
  editorDrafts!: Table<EditorDraft, string>
  constructor(name = 'athletic-tracker') {
    super(name)
    this.version(1).stores({ metadata: '&key' })
    this.version(2).stores({ metadata: '&key', foundationRecords: '&id, updatedAt' })
    // Additive migration: retain both original tables and all their rows.
    this.version(3).stores({
      metadata: '&key', foundationRecords: '&id, updatedAt',
      exercises: '&id, name', sessions: '&id, status, startedAt',
      sessionActivities: '&id, sessionId, [sessionId+position]',
      sessionExercises: '&id, sessionActivityId, sourceExerciseId, supersetGroupId, [sessionActivityId+position]',
      strengthSets: '&id, sessionExerciseId, [sessionExerciseId+position]',
      supersetGroups: '&id, sessionActivityId',
      restTimers: '&sessionId', editorDrafts: '&id, sessionId, &setId',
    })
    this.version(4).stores({ exercisePreferences: '&exerciseId', catalogueState: '&exerciseId' }).upgrade(async transaction => {
      const definitions: Exercise[] = await transaction.table('exercises').toArray()
      for (const definition of definitions) {
        await transaction.table('exercisePreferences').add(legacyPreference(definition))
        await transaction.table('exercises').put(normalizeDefinition(definition))
      }
      // No session, snapshot, set, draft or timer rows are touched.
    })
    this.on('versionchange', () => this.close())
  }
}
export const db = new AthleticDatabase()

export async function verifyLocalStorage(database = db): Promise<void> {
  await database.transaction('rw', database.metadata, async () => {
    if (!await database.metadata.get('createdAt')) {
      await database.metadata.put({ key: 'createdAt', value: new Date().toISOString() })
    }
  })
}
