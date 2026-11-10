import { useEffect, useState, useSyncExternalStore } from 'react'
import { FoundationPanel } from '../features/foundation/FoundationPanel'
import { verifyLocalStorage } from '../data/db/database'
import { StorageProtection } from '../components/StorageProtection'
import { WorkoutsPanel } from '../features/workouts/WorkoutsPanel'
import { ExerciseLibrary } from '../features/exercises/ExerciseLibrary'
import { updateSafety } from './updateSafety'
import { APP_VERSION } from './version'
import { UpdatePanel } from './UpdatePanel'

export function App() {
  const [view, setView] = useState<'workouts' | 'library' | 'settings'>('workouts')
  const safety = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  function changeView(next: typeof view) {
    const current = updateSafety.getSnapshot()
    if (next === view || current.busy || current.restoring || current.applying || current.loading) return
    if (current.dirty && !window.confirm('Discard your unsaved changes and switch pages?')) return
    setView(next)
  }
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
    <p className="eyebrow">YOUR TRAINING COMPANION</p>
    <h1>AthleticTracker</h1>
    <p className="note">Version {APP_VERSION}</p>
    <p role="status">{storage}</p>
    <nav className="app-nav" aria-label="App sections">
      <button className={view === 'workouts' ? '' : 'secondary'} aria-pressed={view === 'workouts'} disabled={safety.busy || safety.restoring || safety.applying || safety.loading} onClick={() => changeView('workouts')}>Workouts</button>
      <button className={view === 'library' ? '' : 'secondary'} aria-pressed={view === 'library'} disabled={safety.busy || safety.restoring || safety.applying || safety.loading} onClick={() => changeView('library')}>Exercises</button>
      <button className={view === 'settings' ? '' : 'secondary'} aria-pressed={view === 'settings'} disabled={safety.busy || safety.restoring || safety.applying || safety.loading} onClick={() => changeView('settings')}>Data &amp; settings</button>
    </nav>
    {databaseReady && (view === 'workouts' ? <WorkoutsPanel /> : view === 'library' ? <ExerciseLibrary /> : <><StorageProtection /><FoundationPanel /></>)}
    <details className="update-details"><summary>App status &amp; updates · {APP_VERSION}</summary><UpdatePanel /></details>
    <p className="note">Workouts save on this device. Browser storage can be cleared; keep backups outside this app.</p>
  </main>
}
