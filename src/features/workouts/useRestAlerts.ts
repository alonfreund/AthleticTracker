import { useEffect, useState } from 'react'
import type { RestTimer } from '../../domain/strength/models'

const api = import.meta.env.VITE_REST_ALERTS_URL?.replace(/\/$/, '')
const preference = 'athletic-tracker:rest-alerts'
const pendingKey = 'athletic-tracker:rest-alert-pending'
const revisionKey = 'athletic-tracker:rest-alert-revision'
const tokenKey = 'athletic-tracker:rest-alert-device'

type Command = { token: string; revision: number; deadline: number | null; endpoint?: string }
type Setup = { registration: ServiceWorkerRegistration; key: Uint8Array<ArrayBuffer> }
let inFlight = 0

function read(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}

async function sendPending() {
  if (!api || !navigator.onLine) return
  const pending = read(pendingKey)
  if (!pending) return
  const command: Command = JSON.parse(pending)
  if (command.revision === inFlight) return
  inFlight = command.revision
  try {
    const response = await fetch(api + '/timer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: pending,
      keepalive: true, signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error('Could not update the Lock Screen alert.')
    if (read(pendingKey) === pending) localStorage.removeItem(pendingKey)
  } finally {
    if (inFlight === command.revision) inFlight = 0
  }
}

if (api && typeof window !== 'undefined') {
  window.addEventListener('online', () => { void sendPending().catch(() => {}) })
  void sendPending().catch(() => {})
}

export async function syncRestAlert(deadline: number | null) {
  if (!api) return
  const endpoint = read(preference)
  if (deadline !== null && !endpoint) return
  const token = read(tokenKey)
  if (!token) return
  const revision = Math.max(Date.now(), Number(read(revisionKey)) + 1)
  const command: Command = { token, revision, deadline, ...(deadline !== null && endpoint ? { endpoint } : {}) }
  localStorage.setItem(revisionKey, String(revision))
  localStorage.setItem(pendingKey, JSON.stringify(command))
  if (!navigator.onLine) throw new Error('Connect to the internet to update the Lock Screen alert.')
  await sendPending()
}

export function cancelEnabledRestAlert() {
  if (read(preference)) void syncRestAlert(null).catch(() => {})
}

export function useRestAlerts(timer: RestTimer | undefined, controlsOpen: boolean) {
  const supported = !!api && typeof window !== 'undefined' && 'PushManager' in window &&
    'serviceWorker' in navigator && 'Notification' in window
  const [enabled, setEnabled] = useState(() => !!read(preference))
  const [setup, setSetup] = useState<Setup>()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const deadline = timer?.status === 'running' && timer.deadline ? Date.parse(timer.deadline) : null
  const timerRevision = timer?.updatedAt
  useEffect(() => {
    if (!supported || !controlsOpen || enabled) return
    const controller = new AbortController()
    function prepare() {
      setMessage('')
      void Promise.all([fetch(api + '/key', { signal: controller.signal }), navigator.serviceWorker.ready]).then(async ([response, registration]) => {
        if (!response.ok) throw new Error('Alert service unavailable.')
        const key = Uint8Array.from(atob((await response.text()).replace(/-/g, '+').replace(/_/g, '/')), character => character.charCodeAt(0))
        if (!controller.signal.aborted) setSetup({ registration, key })
      }).catch(() => { if (!controller.signal.aborted) setMessage('Connect to the internet to set up Lock Screen alerts.') })
    }
    prepare()
    window.addEventListener('online', prepare)
    return () => { controller.abort(); window.removeEventListener('online', prepare) }
  }, [supported, controlsOpen, enabled])

  useEffect(() => {
    if (!enabled) return
    let active = true
    function sync() {
      const next = deadline !== null && deadline > Date.now() ? deadline : null
      void syncRestAlert(next)
        .then(() => { if (active) setMessage(next === null ? '' : 'Lock Screen alert scheduled.') })
        .catch(error => { if (active) setMessage(error.message) })
    }
    sync()
    window.addEventListener('online', sync)
    return () => { active = false; window.removeEventListener('online', sync) }
  }, [enabled, deadline, timerRevision])

  async function toggle() {
    if (!supported || busy || (!setup && !enabled)) return
    setBusy(true)
    setMessage('')
    try {
      if (enabled) {
        localStorage.removeItem(preference)
        setEnabled(false)
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) await subscription.unsubscribe()
        await syncRestAlert(null)
      } else if (setup) {
        // Call subscribe from the button gesture so iOS can ask for permission.
        const subscription = await setup.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: setup.key })
        if (!read(tokenKey)) {
          const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('')
          localStorage.setItem(tokenKey, token)
        }
        localStorage.setItem(preference, subscription.endpoint)
        setEnabled(true)
      }
    } catch (error) {
      setMessage(enabled && error instanceof Error ? error.message : 'Open AthleticTracker from the Home Screen and allow notifications to enable alerts.')
    } finally {
      setBusy(false)
    }
  }

  return { supported, enabled, busy, ready: !!setup, message, toggle }
}
