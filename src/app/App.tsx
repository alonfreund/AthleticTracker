import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { verifyLocalStorage } from '../data/db/database'

export function App() {
  const [storage, setStorage] = useState('Checking local storage…')
  const [swError, setSwError] = useState(false)
  const [cachedReady, setCachedReady] = useState(false)
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError: () => setSwError(true),
  })
  useEffect(() => {
    let active = true
    if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.ready.then(() => { if (active) setCachedReady(true) })
    }
    verifyLocalStorage().then(
      () => { if (active) setStorage('Local database ready') },
      () => { if (active) setStorage('Local storage unavailable. Check browser settings and free space.') },
    )
    return () => { active = false }
  }, [])
  return <main>
    <p className="eyebrow">PROJECT FOUNDATION</p>
    <h1>AthleticTracker</h1>
    <p>Your training companion starts here.</p>
    <section aria-labelledby="setup-heading">
      <h2 id="setup-heading">Setup status</h2>
      <p role="status">{storage}</p>
      <p role="status">{import.meta.env.DEV ? 'Development preview — offline caching is tested in the production preview.' : swError ? 'Offline setup failed. Reconnect and reload to retry.' : (offlineReady || cachedReady) ? 'Available offline on this device' : 'Preparing offline files — stay online until ready.'}</p>
      {needRefresh && <button onClick={() => void updateServiceWorker(true)}>Reload to update</button>}
    </section>
    <p className="note">Fitness features and backup/restore are not built yet. Browser data can be cleared; do not store important training information in this starter.</p>
  </main>
}
