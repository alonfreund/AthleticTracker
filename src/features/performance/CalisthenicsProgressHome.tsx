import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { listPushupAttempts } from '../../data/repositories/pushups'
import { pushupProgress, type PushupAttempt } from '../../domain/calisthenics/pushups'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'

export function CalisthenicsProgressHome({ blocked, hasWorkoutInProgress, onBack, onHistory, onOpenPushups }: {
  blocked: boolean
  hasWorkoutInProgress: boolean
  onBack: () => void
  onHistory: () => void
  onOpenPushups: () => void
}) {
  const [attempts, setAttempts] = useState<PushupAttempt[]>()
  useEffect(() => {
    const subscription = liveQuery(() => listPushupAttempts()).subscribe({ next: setAttempts, error: () => setAttempts(undefined) })
    return () => subscription.unsubscribe()
  }, [])
  const { best, next } = pushupProgress(attempts ?? [])
  return <>
    <Button className="section-back" variant="secondary" disabled={blocked} onClick={onBack}>Back to Performance</Button>
    <div className="performance-disciplines">
      <section className="training-hero" aria-labelledby="calisthenics-progress-heading">
        <span className="hero-symbol"><Icon name="calisthenics" /></span>
        <h2 id="calisthenics-progress-heading">Skill progressions</h2>
        <p>Choose a skill to see its variations and track what you can do today.</p>
        <button type="button" className="exercise-row pushup-track" disabled={blocked} onClick={onOpenPushups}>
          <strong>100 Push-ups <Icon name="arrow" /></strong>
          <span>{best !== undefined ? `Best: ${best} reps${next ? ` · Next: ${next}` : ' · Goal achieved'}` : '100 clean reps in one go'}</span>
        </button>
      </section>
      <section className="surface-card" aria-labelledby="calisthenics-previous-heading">
        <h2 id="calisthenics-previous-heading">Previous workouts</h2>
        {hasWorkoutInProgress && <p className="note">Use the Resume banner to finish or cancel your saved workout.</p>}
        <Button variant="secondary" disabled={blocked} onClick={onHistory}><Icon name="history" /> View previous workouts</Button>
      </section>
    </div>
  </>
}
