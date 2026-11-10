export interface BackupJob {
  id: string
  touchedAt: number
  validated: boolean
  header?: { format: 'athletic-tracker-backup'; formatVersion: number; exportedAt: string; appVersion: string }
  counts?: Record<string,number>
  rowBytes?: number
  bytes?: number
}
export interface BackupRow { jobId: string; table: string; key: string; json: string; bytes: number; parent: string; group: string }
export interface BackupKey { jobId: string; scope: string; key: string }
