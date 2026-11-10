import Dexie, { type Table } from 'dexie'
import type { Exercise, Session, SessionActivity, SessionExercise, StrengthSet, SupersetGroup, RestTimer, EditorDraft } from '../../domain/strength/models'
import { STRENGTH_TABLES } from '../../domain/strength/models'
import type { AppMetadata, FoundationRecord } from '../../domain/foundation'

export const BACKUP_TABLES = ['metadata', 'foundationRecords', ...STRENGTH_TABLES] as const

export class AthleticDatabase extends Dexie {
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
