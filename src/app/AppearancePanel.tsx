import { WallpaperPicker } from './WallpaperPicker'
import { useEffect } from 'react'
import { applyTheme, saveTheme, supportsWallpapers, THEMES, type Theme } from './theme'

export function AppearancePanel({ theme, onThemeChange }: { theme: Theme; onThemeChange: (theme: Theme) => void }) {

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
        onThemeChange(next)
      }}>
        {Object.entries(THEMES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
    </label>
    <p className="note">System follows your device’s Light or Dark setting.</p>
    {supportsWallpapers(theme) && <WallpaperPicker key={theme} theme={theme} />}
  </section>
}
