import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { expect, it } from 'vitest'
import { WallpaperDatabase, saveWallpaper, saveWallpaperTint, validateWallpaper } from '../src/app/wallpapers'
import { BACKUP_TABLES } from '../src/data/db/database'

it('stores wallpapers per tab and keeps them out of training backups', async () => {
  const name = crypto.randomUUID()
  const first = new Dexie(name)
  first.version(1).stores({ wallpapers: '&screen' })
  const reopened = new WallpaperDatabase(name)
  try {
    await first.table('wallpapers').add({ screen: 'strength', image: new Blob(['original photo'], { type: 'image/jpeg' }) })
    first.close()
    expect(await (await reopened.themeWallpapers.get(['star-wars-plus', 'strength']))?.image.text()).toBe('original photo')
    await saveWallpaper('custom-1', 'strength', new Blob(['first photo'], { type: 'image/jpeg' }), reopened)
    await saveWallpaper('custom-2', 'strength', new Blob(['second photo'], { type: 'image/png' }), reopened)
    await saveWallpaper('custom-1', 'performance', new Blob(['performance photo'], { type: 'image/png' }), reopened)
    await saveWallpaperTint('custom-1', 'strength', 0, reopened)
    await saveWallpaperTint('custom-2', 'strength', 100, reopened)
    await saveWallpaperTint('custom-1', 'performance', 35, reopened)
    await expect(saveWallpaperTint('custom-1', 'settings', 20, reopened)).rejects.toThrow()
    await expect(saveWallpaperTint('custom-1', 'strength', 101, reopened)).rejects.toThrow()
    await saveWallpaper('custom-1', 'strength', new Blob(['replacement'], { type: 'image/png' }), reopened)
    reopened.close()
    await reopened.open()
    expect(await (await reopened.themeWallpapers.get(['custom-1', 'strength']))?.image.text()).toBe('replacement')
    expect((await reopened.themeWallpapers.get(['custom-1', 'strength']))?.tint).toBe(0)
    expect((await reopened.themeWallpapers.get(['custom-2', 'strength']))?.tint).toBe(100)
    expect((await reopened.themeWallpapers.get(['custom-1', 'performance']))?.tint).toBe(35)
    await reopened.themeWallpapers.delete(['custom-1', 'strength'])
    expect(await reopened.themeWallpapers.get(['custom-1', 'strength'])).toBeUndefined()
    expect(await (await reopened.themeWallpapers.get(['custom-2', 'strength']))?.image.text()).toBe('second photo')
    expect(await (await reopened.themeWallpapers.get(['custom-1', 'performance']))?.image.text()).toBe('performance photo')
    expect(await (await reopened.themeWallpapers.get(['star-wars-plus', 'strength']))?.image.text()).toBe('original photo')
    expect(BACKUP_TABLES).not.toContain('themeWallpapers')
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
