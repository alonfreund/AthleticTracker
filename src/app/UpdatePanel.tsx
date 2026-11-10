import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { updateSafety } from './updateSafety'
import { APP_VERSION } from './version'

export function UpdatePanel({ onAvailabilityChange }: { onAvailabilityChange?: (available: boolean) => void }) {
  const safety = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  const [available, setAvailable] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { onAvailabilityChange?.(available) }, [available, onAvailabilityChange])
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const activated = useRef(false)
  const mounted = useRef(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    mounted.current = true
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) return () => { mounted.current = false }
    let disposed = false
    registerSW({
      immediate: true,
      onNeedRefresh() { if (!disposed) { setAvailable(true); setMessage('An update is ready. You choose when to reload.') } },
      onOfflineReady() { if (!disposed) setOfflineReady(true) },
      onRegisteredSW(_url, value) { if (!disposed) registration.current = value },
      onRegisterError() { if (!disposed) setError('Offline setup or update registration failed. Reconnect and check again.') },
      // Use the native controller event below so externally activated workers
      // cannot bypass the same safety gate used by this tab.
      onNeedReload() {},
    })
    let previouslyControlled = !!navigator.serviceWorker.controller
    const onControllerChange = () => {
      if (disposed) return
      const isUpdate = previouslyControlled || updateSafety.getSnapshot().applying
      previouslyControlled = true
      if (!isUpdate) return
      activated.current = true
      setAvailable(true)
      clearTimeout(timeout.current)
      if (updateSafety.canReload()) window.location.reload()
      else {
        updateSafety.end()
        setMessage('A new version was activated, possibly in another open copy. Your draft is still here. Reload only when ready.')
      }
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    void navigator.serviceWorker.ready.then(() => { if (!disposed) setOfflineReady(true) })
    const checkOnReturn = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void registration.current?.update().catch(() => {})
    }
    document.addEventListener('visibilitychange', checkOnReturn)
    window.addEventListener('online', checkOnReturn)
    return () => {
      disposed = true; mounted.current = false; clearTimeout(timeout.current)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', checkOnReturn)
      window.removeEventListener('online', checkOnReturn)
    }
  }, [])
  async function check() {
    setError(''); setMessage(''); setChecking(true)
    try {
      if (!navigator.onLine) throw new Error('You are offline. Reconnect to check for updates.')
      if (!registration.current) throw new Error('Update checks are not ready. Wait a moment and try again.')
      await registration.current.update()
      setMessage('Update check completed. Any available update appears here after its files finish downloading.')
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not check for updates.') }
    finally { setChecking(false) }
  }
  async function apply() {
    setError('')
    if (!updateSafety.begin()) return
    setMessage('Applying update. Please keep the app open.')
    if (activated.current) {
      if (updateSafety.canReload()) window.location.reload()
      return
    }
    timeout.current = setTimeout(() => {
      if (!mounted.current) return
      updateSafety.end()
      setMessage('')
      setError('The update has not completed. Your current app and saved records remain available. Try checking for updates again.')
    }, 15000)
    try {
      const waiting = registration.current?.waiting
      if (!waiting) throw new Error('No waiting update is available.')
      waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    catch { clearTimeout(timeout.current); updateSafety.end(); setError('Could not apply the update. Reconnect and try again.') }
  }
  return <section aria-labelledby="updates-heading" className="surface-card">
    <h2 id="updates-heading">About &amp; updates</h2>
    <p>App version <strong>{APP_VERSION}</strong></p>
    <p role="status">{import.meta.env.DEV ? 'Development preview — offline updates are tested in the production preview.' : offlineReady ? 'Available offline on this device' : 'Preparing offline files — stay online until ready.'}</p>
    <div className="actions">
      <button className="secondary" disabled={import.meta.env.DEV || checking || safety.applying} onClick={() => void check()}>{checking ? 'Checking…' : 'Check for updates'}</button>
      {available && <button disabled={!!safety.reason || safety.applying} onClick={() => void apply()}>{safety.applying ? 'Applying update…' : 'Reload to update'}</button>}
    </div>
    {available && safety.reason && <p role="status">Update paused: {safety.reason}</p>}
    <p role="status">{message}</p>
    {error && <p role="alert" className="error">{error}</p>}
    <p className="note">Updates never intentionally reload over a draft. Save first; force-closing the app or a manual reload can still lose unsaved text.</p>
  </section>
}
