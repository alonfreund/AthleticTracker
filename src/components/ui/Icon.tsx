export type IconName = 'train' | 'performance' | 'history' | 'analytics' | 'library' | 'settings' | 'arrow' | 'check' | 'medal' | 'shield'
const paths: Record<IconName, string[]> = {
  train: ['M7 5v14M4 8v8M17 5v14M20 8v8M7 12h10'],
  performance: ['M3 12h4l3-7 4 14 3-7h4'],
  history: ['M3 11a9 9 0 1 1 2.6 7M3 4v7h7', 'M12 7v5l3 2'],
  analytics: ['M4 4v16h16M7 15l4-5 4 3 5-7'],
  library: ['M4 5h6a3 3 0 0 1 3 3v12a4 4 0 0 0-4-2H4V5Z', 'M13 8a3 3 0 0 1 3-3h5v13h-5a4 4 0 0 0-3 2'],
  settings: ['M9 3h6l.7 3 2.6 1.5 3 .2 1 5.3-2.7 1.5-1 2.8.8 2.7-4.5 2.7-2.1-2.1h-3L8.7 22l-4.5-2.7.8-2.7-1-2.8L1.3 12l1-5.3 3-.2L8 5l1-2Z', 'M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z'],
  arrow: ['M5 12h14M14 7l5 5-5 5'],
  check: ['m5 12 4 4L19 6'],
  medal: ['m7 3 3 7m7-7-3 7', 'M18 15a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z', 'm12 12 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3Z'],
  shield: ['m12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6l8-3Z', 'm8 12 3 3 5-6'],
}
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={`icon ${className}`}>{paths[name].map(path => <path key={path} d={path} />)}</svg>
}
