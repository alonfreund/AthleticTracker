import { CARDIO_ACTIVITIES, type CardioActivity } from '../../domain/cardio/activities'
import type { Screen } from '../../app/navigation'
const titles: Record<Screen, string> = { strength: 'Strength', performance: 'Performance', 'performance/cardio': 'Cardio', 'performance/cardio/history': 'Cardio history', 'performance/cardio/activity': 'Cardio activity', 'performance/cardio/session': 'Cardio session', 'strength/history': 'Workout history', analytics: 'Analytics', 'strength/library': 'Exercise library', settings: 'Settings' }
const descriptions: Record<Screen, string> = {
  strength: 'Start a workout or pick up where you left off.', performance: 'Choose an athletic discipline.', 'performance/cardio': 'Your endurance activities.', 'performance/cardio/history': '', 'performance/cardio/activity': '', 'performance/cardio/session': '', 'strength/history': 'Your training, recorded over time.', analytics: 'Exercise progress and personal records.', 'strength/library': 'Find a movement. Make it your own.', settings: 'Your data, storage and app preferences.',
}
export function PageHeader({ destination, cardioActivity }: { destination: Screen; cardioActivity?: CardioActivity }) {
  return <header className="page-header"><div className="brand"><span className="brand-mark" aria-hidden="true">a<span>·</span></span><span>AthleticTracker</span></div><h1 id="page-title">{destination === 'performance/cardio/activity' && cardioActivity ? CARDIO_ACTIVITIES[cardioActivity] : titles[destination]}</h1>{descriptions[destination] && <p>{descriptions[destination]}</p>}</header>
}
