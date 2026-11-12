import type { Screen } from '../../app/navigation'
const titles: Record<Screen, string> = { strength: 'Strength', performance: 'Performance', 'strength/history': 'Workout history', analytics: 'Analytics', 'strength/library': 'Exercise library', settings: 'Settings' }
const descriptions: Record<Screen, string> = {
  strength: 'Start a workout or pick up where you left off.', performance: 'Track your development across disciplines.', 'strength/history': 'Your training, recorded over time.', analytics: 'Exercise progress and personal records.', 'strength/library': 'Find a movement. Make it your own.', settings: 'Your data, storage and app preferences.',
}
export function PageHeader({ destination }: { destination: Screen }) {
  return <header className="page-header"><div className="brand"><span className="brand-mark" aria-hidden="true">a<span>·</span></span><span>AthleticTracker</span></div><h1 id="page-title">{titles[destination]}</h1><p>{descriptions[destination]}</p></header>
}
