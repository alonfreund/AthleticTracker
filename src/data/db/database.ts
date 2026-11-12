import type { HandstandAttempt } from '../../domain/calisthenics/handstand'
import type { PlancheAttempt } from '../../domain/calisthenics/planche'
import type { MuscleupAttempt } from '../../domain/calisthenics/muscleups'
import type { PushupAttempt } from '../../domain/calisthenics/pushups'
import type { CardioTiming, LiveCardio } from '../../domain/cardio/timing'
import { CARDIO_TABLES, CARDIO_TIMING_TABLES, type CardioDetails, type CardioDraft } from '../../domain/cardio/models'
import type { Routine, RoutineExercise } from '../../domain/strength/routines'
import { legacyPreference, normalizeDefinition } from '../../domain/strength/exerciseMetadata'
import type { BackupJob, BackupRow, BackupKey } from '../backup/stagingTypes'
import Dexie, { type Table } from 'dexie'
import type { Exercise, Session, SessionActivity, SessionExercise, StrengthSet, SupersetGroup, RestTimer, EditorDraft, ExercisePreference, CatalogueState } from '../../domain/strength/models'
import { STRENGTH_TABLES } from '../../domain/strength/models'
import type { AppMetadata, FoundationRecord } from '../../domain/foundation'

export const BACKUP_TABLES = ['metadata', 'foundationRecords', ...STRENGTH_TABLES, 'exercisePreferences', 'catalogueState', 'routines', 'routineExercises', ...CARDIO_TABLES, ...CARDIO_TIMING_TABLES, 'pushupAttempts', 'pullupAttempts', 'muscleupAttempts', 'plancheAttempts', 'handstandAttempts'] as const

export const INTERNAL_BACKUP_TABLES = ['backupJobs','backupRows','backupKeys'] as const

export class AthleticDatabase extends Dexie {
  handstandAttempts!: Table<HandstandAttempt, string>
  plancheAttempts!: Table<PlancheAttempt, string>
  muscleupAttempts!: Table<MuscleupAttempt, string>
  pullupAttempts!: Table<PushupAttempt, string>
  pushupAttempts!: Table<PushupAttempt, string>
  cardioTiming!: Table<CardioTiming, string>
  cardioLive!: Table<LiveCardio, string>
  cardioDetails!: Table<CardioDetails, string>
  cardioDrafts!: Table<CardioDraft, string>
  routines!: Table<Routine, string>
  routineExercises!: Table<RoutineExercise, string>
  backupJobs!: Table<BackupJob,string>
  backupRows!: Table<BackupRow,[string,string,string]>
  backupKeys!: Table<BackupKey,[string,string,string]>
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
    this.version(5).stores({ backupJobs:'&id, touchedAt', backupRows:'[jobId+table+key], jobId, [jobId+table], [jobId+table+group]', backupKeys:'[jobId+scope+key], jobId' })
    this.version(6).stores({ routines: '&id', routineExercises: '&id, &[routineId+position]' })
    this.version(7).stores({ cardioDetails: '&id', cardioDrafts: '&id', sessionActivities: '&id, sessionId, [sessionId+position], activityType' })
    this.version(8).stores({ cardioTiming: '&id', cardioLive: '&id' })
    this.version(9).stores({ pushupAttempts: '&id, recordedAt' })
    this.version(10).stores({ pullupAttempts: '&id, recordedAt' })
    this.version(11).stores({ muscleupAttempts: '&id, [movement+recordedAt]' })
    this.version(12).stores({ plancheAttempts: '&id, [movement+recordedAt]' })
    this.version(13).stores({ handstandAttempts: '&id, [movement+recordedAt]' })
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
