import Dexie, { type Table } from 'dexie'

interface AppMetadata { key: string; value: string }

// Only setup metadata exists at this stage; no fitness data model yet.
class AthleticDatabase extends Dexie {
  metadata!: Table<AppMetadata, string>
  constructor() {
    super('athletic-tracker')
    this.version(1).stores({ metadata: '&key' })
  }
}
export const db = new AthleticDatabase()

export async function verifyLocalStorage(): Promise<void> {
  await db.transaction('rw', db.metadata, async () => {
    const existing = await db.metadata.get('createdAt')
    if (!existing) await db.metadata.put({ key: 'createdAt', value: new Date().toISOString() })
  })
}
