import type { Destination } from '../../app/navigation'
const titles: Record<Destination, string> = { train: 'Train', history: 'History', library: 'Library', settings: 'Settings' }
const descriptions: Record<Destination, string> = {
  train: 'Start a session or pick up where you left off.', history: 'Your training, recorded over time.', library: 'Find a movement. Make it your own.', settings: 'Your data, storage and app preferences.',
}
export function PageHeader({ destination }: { destination: Destination }) {
  return <header className="page-header"><div className="brand"><span className="brand-mark" aria-hidden="true">a<span>·</span></span><span>AthleticTracker</span></div><h1 id="page-title">{titles[destination]}</h1><p>{descriptions[destination]}</p></header>
}
