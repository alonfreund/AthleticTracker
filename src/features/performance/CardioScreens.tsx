import { Button } from '../../components/ui/Button'
import { Icon, type IconName } from '../../components/ui/Icon'
import { CARDIO_ACTIVITIES, type CardioActivity } from './cardioActivities'

const icons: Record<CardioActivity, IconName> = {
  running: 'running', cycling: 'cycling', swimming: 'swimming',
  walking: 'walking', hiking: 'hiking', rowing: 'rowing', other: 'performance',
}

export function CardioHome({ onBack, onActivity, onHistory, blocked }: {
  onBack: () => void
  onActivity: (activity: CardioActivity) => void
  onHistory: () => void
  blocked: boolean
}) {
  return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={blocked}>Back to Performance</Button>
    <div className="cardio-home">
      <section className="surface-card" aria-labelledby="cardio-activities">
        <h2 id="cardio-activities">Choose an activity</h2>
        <div className="cardio-activities">
          {(Object.keys(CARDIO_ACTIVITIES) as CardioActivity[]).map(activity =>
            <Button key={activity} variant="secondary" disabled={blocked} onClick={() => onActivity(activity)}>
              <Icon name={icons[activity]} />{CARDIO_ACTIVITIES[activity]}
            </Button>,
          )}
        </div>
      </section>
      <section className="surface-card" aria-labelledby="cardio-week">
        <h2 id="cardio-week">This week</h2>
        <dl className="cardio-week">
          {['Total distance', 'Cardio duration', 'Sessions'].map(label => <div key={label}>
            <dt>{label}</dt><dd><span aria-hidden="true">—</span><span className="sr-only">No data</span></dd>
          </div>)}
        </dl>
        <p className="note">Weekly totals will appear once you’ve logged cardio sessions.</p>
      </section>
      <section className="surface-card" aria-labelledby="cardio-recent">
        <h2 id="cardio-recent">Recent sessions</h2>
        <p className="note">No cardio sessions yet.</p>
        <Button variant="secondary" disabled={blocked} onClick={onHistory}>View cardio history <Icon name="arrow" /></Button>
      </section>
    </div>
  </>
}

export function CardioSubscreen({ activity, onBack, blocked }: {
  activity?: CardioActivity
  onBack: () => void
  blocked: boolean
}) {
  return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={blocked}>Back to Cardio</Button>
    <section className="surface-card">
      {activity ? <><h2>Session logging is coming</h2><p>You’ll be able to record your {CARDIO_ACTIVITIES[activity].toLowerCase()} sessions here.</p></>
        : <><h2>No cardio sessions yet</h2><p>Your recorded sessions will appear here.</p></>}
    </section>
  </>
}
