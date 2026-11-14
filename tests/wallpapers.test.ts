import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { WallpaperDatabase, saveWallpaper, validateWallpaper } from '../src/app/wallpapers'
import { BACKUP_TABLES } from '../src/data/db/database'

it('stores wallpapers per tab and keeps them out of training backups', async () => {
  const name = crypto.randomUUID()
  const first = new WallpaperDatabase(name)
  const reopened = new WallpaperDatabase(name)
  try {
    await saveWallpaper('strength', new Blob(['strength photo'], { type: 'image/jpeg' }), first)
    await saveWallpaper('performance', new Blob(['performance photo'], { type: 'image/png' }), first)
    first.close()
    expect(await (await reopened.wallpapers.get('strength'))?.image.text()).toBe('strength photo')
    await reopened.wallpapers.delete('strength')
    expect(await reopened.wallpapers.get('strength')).toBeUndefined()
    expect(await (await reopened.wallpapers.get('performance'))?.image.text()).toBe('performance photo')
    expect(BACKUP_TABLES).not.toContain('wallpapers')
  } finally {
    first.close()
    await reopened.delete()
  }
})

it('rejects empty, unsupported and oversized images', () => {
  expect(() => validateWallpaper(new Blob([], { type: 'image/png' }))).toThrow()
  expect(() => validateWallpaper(new Blob(['<svg/>'], { type: 'image/svg+xml' }))).toThrow()
  expect(() => validateWallpaper(new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: 'image/jpeg' }))).toThrow('10 MB')
})
