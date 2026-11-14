import { useEffect, useState, type CSSProperties } from 'react'
import type { WallpaperTheme } from './theme'
import { liveQuery } from 'dexie'
import { DESTINATIONS, type Destination } from './navigation'
import { DEFAULT_WALLPAPER_TINT, saveWallpaperTint, saveWallpaper, validateWallpaper, wallpaperDb, WALLPAPER_TYPES } from './wallpapers'

const labels: Record<Destination, string> = {
  strength: 'Strength', performance: 'Performance', analytics: 'Analytics', settings: 'Settings',
}

export function useWallpaper(theme: WallpaperTheme | undefined, screen: Destination) {
  const [wallpaper, setWallpaper] = useState<{ theme: WallpaperTheme; screen: Destination; url: string; tint: number }>()
  useEffect(() => {
    if (!theme) return
    let url: string | undefined
    const clear = () => { if (url) URL.revokeObjectURL(url); url = undefined }
    const subscription = liveQuery(() => wallpaperDb.themeWallpapers.get([theme, screen])).subscribe({
      next: row => {
        clear()
        url = row && URL.createObjectURL(row.image)
        setWallpaper(row && url ? { theme, screen, url, tint: row.tint ?? DEFAULT_WALLPAPER_TINT } : undefined)
      },
      error: () => { clear(); setWallpaper(undefined) },
    })
    return () => { subscription.unsubscribe(); clear() }
  }, [theme, screen])
  return wallpaper && wallpaper.theme === theme && wallpaper.screen === screen ? wallpaper : undefined
}

export function WallpaperPicker({ theme }: { theme: WallpaperTheme }) {
  const [screen, setScreen] = useState<Destination>('strength')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const wallpaper = useWallpaper(theme, screen)
  const [draftTint, setDraftTint] = useState<number>()
  const tint = draftTint ?? wallpaper?.tint ?? DEFAULT_WALLPAPER_TINT

  async function applyTint() {
    setBusy(true)
    setError('')
    setStatus('')
    try {
      await saveWallpaperTint(theme, screen, tint)
      setStatus('Tint saved on this device.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save the tint.')
    } finally { setBusy(false) }
  }


  async function change(file?: File) {
    setBusy(true)
    setError('')
    setStatus('')
    try {
      if (file) {
        validateWallpaper(file)
        const preview = URL.createObjectURL(file)
        try {
          const image = new Image()
          image.src = preview
          await image.decode().catch(() => {
            throw new Error('This image could not be opened. Try a JPEG or PNG.')
          })
        } finally { URL.revokeObjectURL(preview) }
        await saveWallpaper(theme, screen, file)
        setStatus('Wallpaper saved on this device.')
      } else {
        await wallpaperDb.themeWallpapers.delete([theme, screen])
        setDraftTint(undefined)
        setStatus('Wallpaper removed.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update the wallpaper.')
    } finally { setBusy(false) }
  }

  return <div className="wallpaper-picker">
    <h3>Private wallpapers</h3>
    <p className="note">Choose an image from Files, up to 10 MB. Wallpapers stay on this device and are excluded from backup exports.</p>
    <label>Screen
      <select value={screen} disabled={busy} onChange={event => {
        setScreen(event.target.value as Destination)
        setDraftTint(undefined)
        setStatus('')
        setError('')
      }}>
        {DESTINATIONS.map(destination => <option key={destination} value={destination}>{labels[destination]}</option>)}
      </select>
    </label>
    {wallpaper && <>
      <div className="wallpaper-preview-frame" style={{ '--wallpaper-tint': tint / 100 } as CSSProperties}>
        <img className="wallpaper-preview" src={wallpaper.url} alt={`${labels[screen]} wallpaper preview`} />
      </div>
      <label>Wallpaper tint · {tint}%
        <input type="range" min={0} max={100} value={tint} disabled={busy}
          aria-valuetext={`${tint}% tint`} onChange={event => { setDraftTint(event.target.valueAsNumber); setStatus(''); setError('') }} />
      </label>
      <button type="button" className="secondary" disabled={busy || tint === wallpaper.tint} onClick={() => void applyTint()}>Save tint</button>
    </>}
    <label>Choose image
      <input type="file" accept={WALLPAPER_TYPES.join(',')} disabled={busy} onChange={event => {
        const file = event.currentTarget.files?.[0]
        event.currentTarget.value = ''
        if (file) void change(file)
      }} />
    </label>
    {wallpaper && <button type="button" className="secondary" disabled={busy} onClick={() => void change()}>Remove wallpaper</button>}
    {status && <p role="status">{status}</p>}
    {error && <p className="error" role="alert">{error}</p>}
  </div>
}
