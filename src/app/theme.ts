export type Theme = 'system' | 'light' | 'dark'

const key = 'athletic-tracker:theme'

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(key)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* Use the system appearance when storage is unavailable. */ }
  return 'system'
}

export function resolveTheme(theme: Theme, systemDark: boolean): 'light' | 'dark' {
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
