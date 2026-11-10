import { useEffect, useState } from 'react'
import { FoundationPanel } from '../features/foundation/FoundationPanel'
import { verifyLocalStorage } from '../data/db/database'
import { StorageProtection } from '../components/StorageProtection'
import { UpdatePanel } from './UpdatePanel'

export function App() {
  const [storage, setStorage] = useState('Checking local storage…')
  const [databaseReady, setDatabaseReady] = useState(false)
  useEffect(() => {
    let active = true
    verifyLocalStorage().then(
      () => { if (active) { setStorage('Local database ready'); setDatabaseReady(true) } },
      () => { if (active) setStorage('Local storage unavailable. Check browser settings and free space.') },
    )
    return () => { active = false }
  }, [])
  return <main>
    <p className="eyebrow">PROJECT FOUNDATION</p>
    <h1>AthleticTracker</h1>
    <p>Your training companion starts here.</p>
    <p role="status">{storage}</p>
    <UpdatePanel />
    <StorageProtection />
    {databaseReady && <FoundationPanel />}
    <p className="note">Foundation testing only. Fitness features are not built. Browser storage can be cleared; keep backups outside this app.</p>
  </main>
}
