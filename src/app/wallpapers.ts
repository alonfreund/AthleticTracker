import Dexie, { type Table } from 'dexie'
import type { WallpaperTheme } from './theme'
import type { Destination } from './navigation'

export const WALLPAPER_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']
const MAX_BYTES = 10 * 1024 * 1024

export class WallpaperDatabase extends Dexie {
  themeWallpapers!: Table<{ theme: WallpaperTheme; screen: Destination; image: Blob }, [WallpaperTheme, Destination]>

  constructor(name = 'athletic-tracker-wallpapers') {
    super(name)
    this.version(1).stores({ wallpapers: '&screen' })
    this.version(2).stores({ themeWallpapers: '[theme+screen]' }).upgrade(async transaction => {
      const previous = transaction.table<{ screen: Destination; image: Blob }>('wallpapers')
      const rows = await previous.toArray()
      await transaction.table('themeWallpapers').bulkAdd(rows.map(row => ({ ...row, theme: 'star-wars-plus' })))
      await previous.clear()
    })
    this.version(3).stores({ wallpapers: null })
  }
}

export const wallpaperDb = new WallpaperDatabase()

export function validateWallpaper(image: Blob) {
  if (!WALLPAPER_TYPES.includes(image.type) || !image.size) throw new Error('Choose a supported image file.')
  if (image.size > MAX_BYTES) throw new Error('Choose an image under 10 MB.')
}

export async function saveWallpaper(theme: WallpaperTheme, screen: Destination, image: Blob, database = wallpaperDb) {
  validateWallpaper(image)
  await database.themeWallpapers.put({ theme, screen, image })
}
