import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { FoundationPanel } from '../features/foundation/FoundationPanel'
import { verifyLocalStorage } from '../data/db/database'
import { StorageProtection } from '../components/StorageProtection'
import { WorkoutsPanel } from '../features/workouts/WorkoutsPanel'
import { ExerciseLibrary } from '../features/exercises/ExerciseLibrary'
import { listWorkouts } from '../data/repositories/workouts'
import type { Session } from '../domain/strength/models'
import { updateSafety } from './updateSafety'
import { UpdatePanel } from './UpdatePanel'
import { destinationFromHash, destinationHash, navigationDecision, type Destination } from './navigation'
import { BottomNavigation } from '../components/ui/BottomNavigation'
import { PageHeader } from '../components/ui/PageHeader'
import { Icon } from '../components/ui/Icon'

export function App() {
  const [view, setView] = useState<Destination>(() => destinationFromHash(window.location.hash))
  const viewRef = useRef(view)
  const [resumeId, setResumeId] = useState<string>()
  const [active, setActive] = useState<Session>()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const safety = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  const [databaseReady, setDatabaseReady] = useState(false)
  const [storageError, setStorageError] = useState('')
  function changeView(next: Destination, fromHistory = false): boolean {
    if (next === viewRef.current) return false
    const decision = navigationDecision(updateSafety.getSnapshot())
    if (decision === 'wait' || (decision === 'confirm' && !window.confirm('Discard your unsaved changes and switch screens?'))) {
      if (fromHistory) window.history.pushState(null, '', destinationHash(viewRef.current))
      return false
    }
    viewRef.current = next; setView(next); setResumeId(undefined)
    if (!fromHistory) window.history.pushState(null, '', destinationHash(next))
    window.scrollTo(0, 0)
    return true
  }
  const changeRef = useRef(changeView); changeRef.current = changeView
  useEffect(() => {
    window.history.replaceState(null, '', destinationHash(viewRef.current))
    const onHistory = () => { changeRef.current(destinationFromHash(window.location.hash), true) }
    window.addEventListener('popstate', onHistory)
    window.addEventListener('hashchange', onHistory)
    return () => { window.removeEventListener('popstate', onHistory); window.removeEventListener('hashchange', onHistory) }
  }, [])
  useEffect(() => {
    let mounted = true
    verifyLocalStorage().then(() => { if (mounted) setDatabaseReady(true) }, () => { if (mounted) setStorageError('Local storage is unavailable. Check browser settings and free space, then reopen the app.') })
    return () => { mounted = false }
  }, [])
  useEffect(() => {
    if (!databaseReady) return
    let mounted = true
    void listWorkouts().then(rows => { if (mounted) setActive(rows.find(row => row.status === 'active')) }).catch(() => { if (mounted) setActive(undefined) })
    return () => { mounted = false }
  }, [view, databaseReady])
  const blocked = safety.busy || safety.restoring || safety.applying || safety.loading
  const showResume = !!active && view !== 'train'
  return <>
    <main className={`app-content ${showResume ? 'has-resume' : ''}`}>
      <PageHeader destination={view} />
      {!databaseReady && <p role={storageError ? 'alert' : 'status'} className={storageError ? 'error' : 'bootstrap-status'}>{storageError || 'Opening your saved training…'}</p>}
      <div className="screen-content">
        {databaseReady && view === 'train' && <WorkoutsPanel key="train" mode="train" initialSessionId={resumeId} onNavigateHistory={() => changeView('history')} />}
        {databaseReady && view === 'history' && <WorkoutsPanel key="history" mode="history" />}
        {databaseReady && view === 'library' && <ExerciseLibrary />}
        <div className="settings-stack" hidden={view !== 'settings'}>
          {databaseReady && view === 'settings' && <FoundationPanel onDataRestored={async () => { const rows = await listWorkouts(); setActive(rows.find(row => row.status === 'active')) }} />}
          <details><summary>Device storage</summary><StorageProtection /></details>
          <UpdatePanel onAvailabilityChange={setUpdateAvailable} />
        </div>
      </div>
    </main>
    {showResume && <aside className="resume-strip" aria-label="Workout in progress"><button disabled={blocked} onClick={() => { if (changeView('train')) setResumeId(active.id) }}><span className="resume-strip__text"><strong>{active.title}</strong><span>Workout in progress · Resume</span></span><Icon name="arrow" /></button></aside>}
    <BottomNavigation current={view} blocked={blocked} updateAvailable={updateAvailable} onNavigate={next => changeView(next)} />
  </>
}
