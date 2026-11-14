import { useEffect, useState } from 'react'
import { applyTheme, readTheme, saveTheme, type Theme } from './theme'

export function AppearancePanel() {
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    const system = matchMedia('(prefers-color-scheme: dark)')
    const update = () => applyTheme(theme, system.matches)
    update()
    system.addEventListener('change', update)
    return () => system.removeEventListener('change', update)
  }, [theme])

  return <section className="surface-card" aria-labelledby="appearance-heading">
    <h2 id="appearance-heading">Appearance</h2>
    <label>App theme
      <select value={theme} onChange={event => {
        const next = event.target.value as Theme
        saveTheme(next)
        setTheme(next)
      }}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    <p className="note">System follows your device’s Light or Dark setting.</p>
  </section>
}
