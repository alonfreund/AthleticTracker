import { useCallback, useEffect, useRef, useState } from 'react'

/** Serial writes prevent an older input value completing after a newer one. */
export function useAutosave<T>(initial: T, persist: (value: T) => Promise<unknown>) {
  const [value, setValue] = useState(initial)
  const latest = useRef(initial)
  const revision = useRef(0)
  const saved = useRef(0)
  const count = useRef(0)
  const persistRef = useRef(persist); persistRef.current = persist
  const queue = useRef<Promise<void>>(Promise.resolve())
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(true)
  const [status, setStatus] = useState({ dirty: false, saving: false, error: '' })
  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    if (saved.current === revision.current) { await queue.current; return }
    const version = revision.current; const input = structuredClone(latest.current); const write = persistRef.current
    count.current++
    if (mounted.current) setStatus(current => ({ ...current, saving: true, error: '' }))
    const operation = queue.current.catch(() => {}).then(async () => {
      await write(input); saved.current = Math.max(saved.current, version)
    })
    queue.current = operation
    try {
      await operation
      if (mounted.current && saved.current === revision.current) setStatus(current => ({ ...current, error: '' }))
    }
    catch (error) {
      if (mounted.current) setStatus({ dirty: true, saving: count.current > 1, error: error instanceof Error ? error.message : 'Could not save. Please retry.' })
      throw error
    } finally {
      count.current--
      if (mounted.current) setStatus(current => ({ ...current, dirty: saved.current !== revision.current, saving: count.current > 0 }))
    }
  }, [])
  function change(next: T) {
    latest.current = next; revision.current++; setValue(next)
    setStatus(current => ({ ...current, dirty: true, error: '' }))
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { void flush().catch(() => {}) }, 300)
  }
  useEffect(() => {
    mounted.current = true
    const flushWhenHidden = () => { if (document.visibilityState === 'hidden') void flush().catch(() => {}) }
    document.addEventListener('visibilitychange', flushWhenHidden)
    return () => { mounted.current = false; clearTimeout(timer.current); document.removeEventListener('visibilitychange', flushWhenHidden) }
  }, [flush])
  return { value, change, flush, ...status }
}
