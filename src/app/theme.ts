export const THEMES = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
  ocean: 'Ocean',
  forest: 'Forest',
  dusk: 'Dusk',
  'star-wars': 'Star Wars',
  'star-wars-plus': 'Star Wars+',
  'custom-1': 'Custom 1',
  'custom-2': 'Custom 2',
} as const
export type Theme = keyof typeof THEMES

export type WallpaperTheme = 'star-wars-plus' | 'custom-1' | 'custom-2'

export function supportsWallpapers(theme: Theme): theme is WallpaperTheme {
  return theme === 'star-wars-plus' || theme === 'custom-1' || theme === 'custom-2'
}

function isTheme(value: string): value is Theme {
  return Object.hasOwn(THEMES, value)
}

const key = 'athletic-tracker:theme'

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null && isTheme(saved)) return saved
  } catch { /* Use the system appearance when storage is unavailable. */ }
  return 'system'
}

export function resolveTheme(theme: Theme, systemDark: boolean): Exclude<Theme, 'system'> {
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
}

export function applyTheme(theme: Theme, systemDark = matchMedia('(prefers-color-scheme: dark)').matches) {
  const resolved = resolveTheme(theme, systemDark)
  const root = document.documentElement
  root.dataset.theme = resolved
  const color = getComputedStyle(root).getPropertyValue('--color-bg').trim()
  if (color) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
}

export function saveTheme(theme: Theme) {
  try { localStorage.setItem(key, theme) } catch { /* Apply the choice for this session. */ }
  applyTheme(theme)
}
