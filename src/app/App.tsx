import { liveQuery } from 'dexie'
import { LiveCardioEntry, LiveCardioScreen } from '../features/performance/LiveCardioScreen'
import { CardioForm } from '../features/performance/CardioForm'
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { verifyLocalStorage } from '../data/db/database'
import { CardioHome, CardioHistory, CardioSessionScreen } from '../features/performance/CardioScreens'
import { PerformanceHome } from '../features/performance/PerformanceScreens'
import { StorageProtection } from '../components/StorageProtection'
import { WorkoutsPanel } from '../features/workouts/WorkoutsPanel'
import { ExerciseLibrary } from '../features/exercises/ExerciseLibrary'
import { activeMovementWorkout } from '../data/repositories/workouts'
import type { Exercise } from '../domain/strength/models'
import { updateSafety } from './updateSafety'
import { UpdatePanel } from './UpdatePanel'
import { routeFromHash, routeHash, routeTab, navigationDecision, type AppRoute } from './navigation'
import { BottomNavigation } from '../components/ui/BottomNavigation'
import { PageHeader } from '../components/ui/PageHeader'
import { Icon } from '../components/ui/Icon'

const AnalyticsPanel = lazy(() => import('../features/analytics/AnalyticsPanel').then(module => ({ default: module.AnalyticsPanel })))
const FoundationPanel = lazy(() => import('../features/foundation/FoundationPanel').then(module => ({ default: module.FoundationPanel })))

export function App() {
  const [route, setRoute] = useState(() => routeFromHash(window.location.hash))
  const routeRef = useRef(route)
  const view = route.screen
  const [returnToAnalytics, setReturnToAnalytics] = useState(() => window.history.state?.returnToAnalytics === true)
  const returnRef = useRef(returnToAnalytics)
  const [analyticsCardio, setAnalyticsCardio] = useState(false)
  const [analyticsExercise, setAnalyticsExercise] = useState<Exercise>()
  const [active, setActive] = useState<Awaited<ReturnType<typeof activeMovementWorkout>>>()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const safety = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  const [databaseReady, setDatabaseReady] = useState(false)
  const [storageError, setStorageError] = useState('')
  function navigate(next: AppRoute, options: { browser?: boolean; fromAnalytics?: boolean } = {}): boolean {
    const hash = routeHash(next)
    if (hash === routeHash(routeRef.current)) return false
    const decision = navigationDecision(updateSafety.getSnapshot())
    if (decision === 'wait' || (decision === 'confirm' && !window.confirm('Discard your unsaved changes and switch screens?'))) {
      if (options.browser) window.history.pushState({ returnToAnalytics: returnRef.current }, '', routeHash(routeRef.current))
      return false
    }
    const fromAnalytics = !!options.fromAnalytics
    routeRef.current = next
    returnRef.current = fromAnalytics
    setRoute(next)
    setReturnToAnalytics(fromAnalytics)
    if (!options.browser) window.history.pushState({ returnToAnalytics: fromAnalytics }, '', hash)
    else if (window.location.hash !== hash) window.history.replaceState({ returnToAnalytics: fromAnalytics }, '', hash)
    window.scrollTo(0, 0)
    return true
  }
  function openExerciseAnalytics(exercise: Exercise) {
    if (navigate({ screen: 'analytics' })) { setAnalyticsCardio(false); setAnalyticsExercise(exercise) }
  }
  function openCardioAnalytics() {
    if (navigate({ screen: 'analytics' })) { setAnalyticsExercise(undefined); setAnalyticsCardio(true) }
  }
  function openHistory(workoutId?: string, fromAnalytics = false) {
    navigate({ screen: 'strength/history', workoutId }, { fromAnalytics })
  }
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  useEffect(() => {
    window.history.replaceState({ returnToAnalytics: returnRef.current }, '', routeHash(routeRef.current))
    const onHistory = () => navigateRef.current(routeFromHash(window.location.hash), {
      browser: true, fromAnalytics: window.history.state?.returnToAnalytics === true,
    })
    window.addEventListener('popstate', onHistory)
    window.addEventListener('hashchange', onHistory)
    return () => {
      window.removeEventListener('popstate', onHistory)
      window.removeEventListener('hashchange', onHistory)
    }
  }, [])
  useEffect(() => {
    let mounted = true
    verifyLocalStorage().then(() => { if (mounted) setDatabaseReady(true) }, () => { if (mounted) setStorageError('Local storage is unavailable. Check browser settings and free space, then reopen the app.') })
    return () => { mounted = false }
  }, [])
  useEffect(() => {
    if (!databaseReady) return
    const subscription = liveQuery(() => activeMovementWorkout()).subscribe({
      next: setActive,
      error: () => setActive(undefined),
    })
    return () => subscription.unsubscribe()
  }, [databaseReady])
  useLayoutEffect(() => {
    if (databaseReady && routeTab(view) === 'performance' && view !== 'performance/calisthenics' && view !== 'performance/calisthenics/history') updateSafety.setSafety({ dirty: false, busy: false, restoring: false, loading: false })
  }, [databaseReady, view])
  const blocked = safety.busy || safety.restoring || safety.applying || safety.loading
  const resumeScreen = active?.discipline === 'calisthenics' ? 'performance/calisthenics' : 'strength'
  const showResume = !!active && view !== resumeScreen
  return <>
    <main className={`app-content ${showResume ? 'has-resume' : ''}`}>
      <PageHeader destination={view} cardioActivity={route.cardioActivity} />
      {!databaseReady && <p role={storageError ? 'alert' : 'status'} className={storageError ? 'error' : 'bootstrap-status'}>{storageError || 'Opening your saved training…'}</p>}
      <div className="screen-content">
        {databaseReady && view === 'strength' && <WorkoutsPanel key="strength" mode="train" onExerciseAnalytics={openExerciseAnalytics}
          initialSessionId={route.workoutId} onLeaveResume={route.workoutId ? () => navigate({ screen: 'strength' }) : undefined} onNavigateHistory={openHistory} onNavigateLibrary={() => navigate({ screen: 'strength/library' })} />}
        {databaseReady && view === 'strength/history' && <WorkoutsPanel key={routeHash(route)} mode="history" onExerciseAnalytics={openExerciseAnalytics}
          initialSessionId={route.workoutId} onNavigateHistory={id => openHistory(id, returnToAnalytics)}
          onLeaveHistory={() => navigate({ screen: 'strength' })}
          onReturnToAnalytics={returnToAnalytics ? () => navigate({ screen: 'analytics' }) : undefined} />}
        {databaseReady && view === 'performance' && <PerformanceHome blocked={blocked}
          onOpenCardio={() => navigate({ screen: 'performance/cardio' })}
          onOpenCalisthenics={() => navigate({ screen: 'performance/calisthenics' })} />}
        {databaseReady && view === 'performance/calisthenics' && <WorkoutsPanel key={routeHash(route)} mode="train" discipline="calisthenics"
          initialSessionId={route.workoutId}
          onLeaveResume={route.workoutId ? () => navigate({ screen: 'performance/calisthenics' }) : undefined}
          onLeaveHome={() => navigate({ screen: 'performance' })}
          onNavigateHistory={workoutId => navigate({ screen: 'performance/calisthenics/history', workoutId })} />}
        {databaseReady && view === 'performance/calisthenics/history' && <WorkoutsPanel key={routeHash(route)} mode="history" discipline="calisthenics"
          initialSessionId={route.workoutId} onLeaveHistory={() => navigate({ screen: 'performance/calisthenics' })}
          onNavigateHistory={workoutId => navigate({ screen: 'performance/calisthenics/history', workoutId })} />}
        {databaseReady && view === 'performance/cardio' && <LiveCardioEntry onOpen={() => navigate({ screen: 'performance/cardio/live' })} />}
        {databaseReady && view === 'performance/cardio' && <CardioHome blocked={blocked}
          onBack={() => navigate({ screen: 'performance' })}
          onActivity={cardioActivity => navigate({ screen: 'performance/cardio/activity', cardioActivity })}
          onHistory={() => navigate({ screen: 'performance/cardio/history' })} onAnalytics={openCardioAnalytics}
          onSession={workoutId => navigate({ screen: 'performance/cardio/session', workoutId })} />}
        {databaseReady && view === 'performance/cardio/activity' && route.cardioActivity &&
          <>
          <LiveCardioEntry key={`timer:${route.cardioActivity}`} sport={route.cardioActivity} onOpen={() => navigate({ screen: 'performance/cardio/live' })} />
          <CardioForm key={route.cardioActivity} sport={route.cardioActivity} blocked={safety.applying}
            onBack={() => navigate({ screen: 'performance/cardio' })}
            onSaved={workoutId => navigate({ screen: 'performance/cardio/session', workoutId })} />
          </>}
        {databaseReady && view === 'performance/cardio/live' && <LiveCardioScreen blocked={blocked}
          onBack={() => navigate({ screen: 'performance/cardio' })}
          onSaved={workoutId => navigate({ screen: 'performance/cardio/session', workoutId })} />}
        {databaseReady && view === 'performance/cardio/history' && <CardioHistory blocked={blocked}
          onBack={() => navigate({ screen: 'performance/cardio' })}
          onSession={workoutId => navigate({ screen: 'performance/cardio/session', workoutId })} />}
        {databaseReady && view === 'performance/cardio/session' && route.workoutId &&
          <CardioSessionScreen key={route.workoutId} id={route.workoutId} blocked={blocked} applying={safety.applying}
            onReturnToAnalytics={returnToAnalytics ? openCardioAnalytics : undefined}
            onBack={() => navigate({ screen: 'performance/cardio/history' })} />}
        {databaseReady && view === 'analytics' && <Suspense fallback={<p role="status">Opening Analytics…</p>}>
          <AnalyticsPanel initialExercise={analyticsExercise} initialCardio={analyticsCardio}
            onOpenWorkout={id => openHistory(id, true)} onOpenCardioSession={workoutId => {
              if (navigate({ screen: 'performance/cardio/session', workoutId }, { fromAnalytics: true })) setAnalyticsCardio(true)
            }} />
        </Suspense>}
        {databaseReady && view === 'strength/library' && <ExerciseLibrary onExerciseAnalytics={openExerciseAnalytics} onBackToStrength={() => navigate({ screen: 'strength' })} />}
        <div className="settings-stack" hidden={view !== 'settings'}>
          {databaseReady && view === 'settings' && <Suspense fallback={<p role="status">Opening data settings…</p>}><FoundationPanel onDataRestored={async () => { setActive(await activeMovementWorkout()) }} /></Suspense>}
          <details><summary>Device storage</summary><StorageProtection /></details>
          <UpdatePanel onAvailabilityChange={setUpdateAvailable} />
        </div>
      </div>
    </main>
    {showResume && <aside className="resume-strip" aria-label="Workout in progress"><button disabled={blocked} onClick={() => { navigate({ screen: resumeScreen, workoutId: active.id }) }}><span className="resume-strip__text"><strong>{active.title}</strong><span>Workout in progress · Resume</span></span><Icon name="arrow" /></button></aside>}
    <BottomNavigation current={routeTab(view)} blocked={blocked} updateAvailable={updateAvailable} onNavigate={screen => {
      if (navigate({ screen }) && screen === 'analytics') { setAnalyticsExercise(undefined); setAnalyticsCardio(false) }
    }} />
  </>
}
