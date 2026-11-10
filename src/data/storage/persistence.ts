export type PersistenceStatus = 'granted' | 'not-granted' | 'unsupported' | 'unavailable'
type PersistenceAPI = { persisted?: () => Promise<boolean>; persist?: () => Promise<boolean> }

export async function requestPersistence(storage: PersistenceAPI | undefined = globalThis.navigator?.storage): Promise<PersistenceStatus> {
  if (!storage || typeof storage.persist !== 'function') return 'unsupported'
  try {
    if (await storage.persisted?.()) return 'granted'
    return await storage.persist() ? 'granted' : 'not-granted'
  } catch { return 'unavailable' }
}
