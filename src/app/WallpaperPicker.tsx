import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { DESTINATIONS, type Destination } from './navigation'
import { saveWallpaper, validateWallpaper, wallpaperDb, WALLPAPER_TYPES } from './wallpapers'

const labels: Record<Destination, string> = {
  strength: 'Strength', performance: 'Performance', analytics: 'Analytics', settings: 'Settings',
}

export function useWallpaper(screen: Destination) {
  const [wallpaper, setWallpaper] = useState<{ screen: Destination; url: string }>()
  useEffect(() => {
    let url: string | undefined
    const clear = () => { if (url) URL.revokeObjectURL(url); url = undefined }
    const subscription = liveQuery(() => wallpaperDb.wallpapers.get(screen)).subscribe({
      next: row => {
        clear()
        url = row && URL.createObjectURL(row.image)
        setWallpaper(url ? { screen, url } : undefined)
      },
      error: () => { clear(); setWallpaper(undefined) },
    })
    return () => { subscription.unsubscribe(); clear() }
  }, [screen])
  return wallpaper?.screen === screen ? wallpaper.url : undefined
}

export function WallpaperPicker() {
  const [screen, setScreen] = useState<Destination>('strength')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const url = useWallpaper(screen)

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
        await saveWallpaper(screen, file)
        setStatus('Wallpaper saved on this device.')
      } else {
        await wallpaperDb.wallpapers.delete(screen)
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
        setStatus('')
        setError('')
      }}>
        {DESTINATIONS.map(destination => <option key={destination} value={destination}>{labels[destination]}</option>)}
      </select>
    </label>
    {url && <img className="wallpaper-preview" src={url} alt={`${labels[screen]} wallpaper preview`} />}
    <label>Choose image
      <input type="file" accept={WALLPAPER_TYPES.join(',')} disabled={busy} onChange={event => {
        const file = event.currentTarget.files?.[0]
        event.currentTarget.value = ''
        if (file) void change(file)
      }} />
    </label>
    {url && <button type="button" className="secondary" disabled={busy} onClick={() => void change()}>Remove wallpaper</button>}
    {status && <p role="status">{status}</p>}
    {error && <p className="error" role="alert">{error}</p>}
  </div>
}
