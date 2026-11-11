import { DESTINATIONS, type Destination } from '../../app/navigation'
import { Icon } from './Icon'
const labels: Record<Destination, string> = { train: 'Train', history: 'History', analytics: 'Analytics', library: 'Library', settings: 'Settings' }
export function BottomNavigation({ current, blocked, updateAvailable, onNavigate }: { current: Destination; blocked: boolean; updateAvailable: boolean; onNavigate: (view: Destination) => void }) {
  return <nav className="bottom-nav" aria-label="Primary navigation"><div className="bottom-nav__inner">{DESTINATIONS.map(destination => <button key={destination} type="button" className={`bottom-nav__item ${current === destination ? 'is-active' : ''}`} aria-current={current === destination ? 'page' : undefined} aria-label={destination === 'settings' && updateAvailable ? 'Settings, update available' : labels[destination]} disabled={blocked} onClick={() => onNavigate(destination)}>
    <span className="bottom-nav__icon"><Icon name={destination} />{destination === 'settings' && updateAvailable && <span className="notification-dot" />}</span>
    <span>{labels[destination]}</span>
  </button>)}</div></nav>
}
