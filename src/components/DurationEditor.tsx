import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { durationFromFields } from '../domain/rest'
export function DurationEditor({ seconds, label, saveLabel, disabled, onSave, onDirty, onUseGlobal }: {
  seconds: number; label: string; saveLabel: string; disabled: boolean
  onSave: (seconds: number) => Promise<void>; onDirty?: (dirty: boolean) => void; onUseGlobal?: () => Promise<void>
}) {
  const [minutes, setMinutes] = useState(String(Math.floor(seconds / 60)))
  const [secs, setSecs] = useState(String(seconds % 60))
  const [baseline, setBaseline] = useState(`${minutes}:${secs}`)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const dirty = `${minutes}:${secs}` !== baseline
  const report = useRef(onDirty); report.current = onDirty
  useLayoutEffect(() => { report.current?.(dirty); return () => report.current?.(false) }, [dirty])
  useEffect(() => {
    if (dirty) return
    const value = `${Math.floor(seconds / 60)}:${seconds % 60}`
    setMinutes(String(Math.floor(seconds / 60))); setSecs(String(seconds % 60)); setBaseline(value)
  }, [seconds, dirty])
  async function save(useGlobal = false) {
    if (saving || disabled) return
    setError(''); setSaving(true)
    try {
      if (useGlobal) await onUseGlobal?.()
      else await onSave(durationFromFields(minutes, secs))
      setBaseline(`${minutes}:${secs}`)
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save rest duration.') }
    finally { setSaving(false) }
  }
  return <div className="duration-editor" role="group" aria-label={label}>
    <div className="duration-fields"><label>Minutes<input type="text" inputMode="numeric" maxLength={6} aria-label={`${label}, minutes`} value={minutes} disabled={disabled || saving} onChange={event => setMinutes(event.target.value)} /></label><label>Seconds<input type="text" inputMode="numeric" maxLength={6} aria-label={`${label}, seconds`} value={secs} disabled={disabled || saving} onChange={event => setSecs(event.target.value)} /></label></div>
    <p className="note">0:00 turns rest off. Seconds above 59 are converted to minutes.</p>
    <div className="actions"><button disabled={disabled || saving} onClick={() => void save()}>{saving ? 'Saving…' : saveLabel}</button>{onUseGlobal && <button className="secondary" disabled={disabled || saving} onClick={() => void save(true)}>Use global default</button>}{dirty && <button className="secondary" disabled={disabled || saving} onClick={() => { setMinutes(String(Math.floor(seconds / 60))); setSecs(String(seconds % 60)); setBaseline(`${Math.floor(seconds / 60)}:${seconds % 60}`); setError('') }}>Discard changes</button>}</div>
    {dirty && <p className="note" role="status">Rest changes not saved yet.</p>}{error && <p role="alert" className="inline-error">{error}</p>}
  </div>
}
