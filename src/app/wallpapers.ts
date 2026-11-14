import Dexie, { type Table } from 'dexie'
import type { Destination } from './navigation'

export const WALLPAPER_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']
const MAX_BYTES = 10 * 1024 * 1024

export class WallpaperDatabase extends Dexie {
  wallpapers!: Table<{ screen: Destination; image: Blob }, Destination>

  constructor(name = 'athletic-tracker-wallpapers') {
    super(name)
    this.version(1).stores({ wallpapers: '&screen' })
  }
}

export const wallpaperDb = new WallpaperDatabase()

export function validateWallpaper(image: Blob) {
  if (!WALLPAPER_TYPES.includes(image.type) || !image.size) throw new Error('Choose a supported image file.')
  if (image.size > MAX_BYTES) throw new Error('Choose an image under 10 MB.')
}

export async function saveWallpaper(screen: Destination, image: Blob, database = wallpaperDb) {
  validateWallpaper(image)
  await database.wallpapers.put({ screen, image })
}
