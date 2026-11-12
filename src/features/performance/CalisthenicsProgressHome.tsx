import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { listRepAttempts } from '../../data/repositories/repAttempts'
import { REP_TRACKS, type RepTrack } from '../../domain/calisthenics/repTracks'
import { pushupProgress, type PushupAttempt } from '../../domain/calisthenics/pushups'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'

export function CalisthenicsProgressHome({ blocked, hasWorkoutInProgress, onBack, onHistory, onOpenTrack, onOpenMuscleups, onOpenPlanche, onOpenHandstand }: {
  blocked: boolean
  hasWorkoutInProgress: boolean
  onBack: () => void
  onHistory: () => void
  onOpenMuscleups: () => void
  onOpenHandstand: () => void
  onOpenPlanche: () => void
  onOpenTrack: (track: RepTrack) => void
}) {
  return <>
    <Button className="section-back" variant="secondary" disabled={blocked} onClick={onBack}>Back to Performance</Button>
    <div className="performance-disciplines">
      <section className="training-hero" aria-labelledby="calisthenics-progress-heading">
        <span className="hero-symbol"><Icon name="calisthenics" /></span>
        <h2 id="calisthenics-progress-heading">Skill progressions</h2>
        <p>Choose a skill to see its variations and track what you can do today.</p>
        <ProgressTrack track="pushups" blocked={blocked} onOpen={onOpenTrack} />
        <ProgressTrack track="pullups" blocked={blocked} onOpen={onOpenTrack} />
        <button type="button" className="exercise-row rep-track" disabled={blocked} onClick={onOpenMuscleups}>
          <strong>3 Bar Muscle-ups <Icon name="arrow" /></strong>
          <span>Requirements and practice</span>
        </button>
        <button type="button" className="exercise-row rep-track" disabled={blocked} onClick={onOpenPlanche}>
          <strong>Planche <Icon name="arrow" /></strong>
          <span>Track strength, transitions, and holds</span>
        </button>
        <button type="button" className="exercise-row rep-track" disabled={blocked} onClick={onOpenHandstand}>
          <strong>30-Second Handstand <Icon name="arrow" /></strong>
          <span>Build up to a 30-second freestanding hold</span>
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

function ProgressTrack({ track, blocked, onOpen }: { track: RepTrack; blocked: boolean; onOpen: (track: RepTrack) => void }) {
  const [attempts, setAttempts] = useState<PushupAttempt[]>()
  useEffect(() => {
    const subscription = liveQuery(() => listRepAttempts(track)).subscribe({ next: setAttempts, error: () => setAttempts(undefined) })
    return () => subscription.unsubscribe()
  }, [track])
  const { title, goal, milestones } = REP_TRACKS[track]
  const { best, next } = pushupProgress(attempts ?? [], milestones)
  return <button type="button" className="exercise-row rep-track" disabled={blocked} onClick={() => onOpen(track)}>
    <strong>{title} <Icon name="arrow" /></strong>
    <span>{best !== undefined ? `Best: ${best} reps${next ? ` · Next: ${next}` : ' · Goal achieved'}` : `${goal} clean reps in one go`}</span>
  </button>
}
