import { useEffect, useRef, useState } from 'react'
import type { RestTimer } from '../../domain/strength/models'

const preference = 'athletic-tracker:rest-chime'
type Countdown = { key: string; remaining: number }

export function restChimeDue(previous: Countdown | undefined, current: Countdown, suppressed: string | undefined) {
  return previous?.key === current.key && previous.remaining > 0 && current.remaining === 0 && suppressed !== current.key
}

export function useRestChime(timer: RestTimer | undefined, remaining: number, paused: boolean) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(preference) === 'on' } catch { return false }
  })
  const audio = useRef<AudioContext>(undefined)
  const previous = useRef<Countdown>(undefined)
  const suppressed = useRef<string>(undefined)
  const key = !paused && timer?.status === 'running' && timer.deadline
    ? JSON.stringify([timer.sourceSetId, timer.deadline, timer.updatedAt]) : undefined

  function prepare() {
    try {
      const context = audio.current ?? (audio.current = new AudioContext())
      if (context.state !== 'running') void context.resume().catch(() => {})
    } catch { /* The visual timer still works when audio is unavailable. */ }
  }

  function toggle(next: boolean) {
    if (next) prepare()
    setEnabled(next)
    try { localStorage.setItem(preference, next ? 'on' : 'off') } catch { /* Keep the preference for this session. */ }
  }

  useEffect(() => {
    if (!key) { previous.current = undefined; suppressed.current = undefined; return }
    const current = { key, remaining }
    const due = restChimeDue(previous.current, current, suppressed.current)
    previous.current = current
    if (!due || !enabled || document.visibilityState !== 'visible') return
    const context = audio.current
    if (context?.state !== 'running') return
    try {
      const tone = context.createOscillator()
      const gain = context.createGain()
      const start = context.currentTime
      tone.frequency.setValueAtTime(660, start)
      tone.frequency.setValueAtTime(880, start + 0.11)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.16, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.26)
      tone.connect(gain).connect(context.destination)
      tone.onended = () => { tone.disconnect(); gain.disconnect() }
      tone.start(start)
      tone.stop(start + 0.27)
    } catch { /* Audio should never interrupt workout logging. */ }
  }, [enabled, key, remaining])

  useEffect(() => () => {
    if (audio.current) void audio.current.close().catch(() => {})
    audio.current = undefined
  }, [])

  return { enabled, toggle, prepare, silence: () => { suppressed.current = key } }
}
