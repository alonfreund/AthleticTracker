import Dexie, { type Table } from 'dexie'
import type { AppMetadata, FoundationRecord } from '../../domain/foundation'

export class AthleticDatabase extends Dexie {
  metadata!: Table<AppMetadata, string>
  foundationRecords!: Table<FoundationRecord, string>
  constructor(name = 'athletic-tracker') {
    super(name)
    this.version(1).stores({ metadata: '&key' })
    this.version(2).stores({ metadata: '&key', foundationRecords: '&id, updatedAt' })
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
