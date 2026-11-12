import { useEffect, useLayoutEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { updateSafety } from '../../app/updateSafety'
import { Button } from '../../components/ui/Button'
import { muscleupRequirements } from '../../data/repositories/muscleups'
import { MUSCLEUP_DRILLS, MUSCLEUP_GOAL, MUSCLEUP_REQUIREMENTS, type MuscleupRequirement } from '../../domain/calisthenics/muscleups'
import { RepProgress } from './RepProgress'

function useRequirements() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof muscleupRequirements>> | null>()
  useEffect(() => {
    const subscription = liveQuery(() => muscleupRequirements()).subscribe({ next: setRows, error: () => setRows(null) })
    return () => subscription.unsubscribe()
  }, [])
  return rows
}

export function MuscleupRequirements({ blocked, onBack, onRequirement, onPractice }: {
  blocked: boolean
  onBack: () => void
  onRequirement: (requirement: MuscleupRequirement) => void
  onPractice: () => void
}) {
  const rows = useRequirements()
  const met = rows?.filter(row => row.met).length ?? 0
  return <>
    <Button className="section-back" variant="secondary" disabled={blocked} onClick={onBack}>Back to Calisthenics</Button>
    <section className="surface-card muscleup-requirements" aria-labelledby="muscleup-requirements">
      <h2 id="muscleup-requirements">Requirements</h2>
      {rows === null ? <p role="alert">Could not load progress.</p> : !rows ? <p role="status">Loading progress…</p> : <>
        <p role="status">{met} of {rows.length} requirements met</p>
        <ul className="muscleup-requirement-list">
          {rows.map(({ movement, config, best, met }) => {
            const unit = 'unit' in config ? 'sec' : 'reps'
            return <li key={movement}>
              <strong>{config.title}</strong>
              <span>{best} / {config.goal} {unit} · {met ? 'Met' : `${config.goal - best} to go`}</span>
              <progress aria-label={`${config.title} best attempt`} value={Math.min(best, config.goal)} max={config.goal} />
              <Button variant="secondary" disabled={blocked} aria-label={`Log or view ${config.title} attempts`} onClick={() => onRequirement(movement)}>Log or view attempts</Button>
            </li>
          })}
        </ul>
        {met === rows.length
          ? <Button disabled={blocked} onClick={onPractice}>Continue to muscle-up practice</Button>
          : <p className="note">Meet all four requirements to open muscle-up practice.</p>}
      </>}
    </section>
  </>
}

export function MuscleupRequirementProgress({ requirement, applying, onBack }: {
  requirement: MuscleupRequirement
  applying: boolean
  onBack: () => void
}) {
  return <RepProgress track={requirement} config={MUSCLEUP_REQUIREMENTS[requirement]} applying={applying}
    onBack={onBack} backLabel="Back to requirements" />
}

export function MuscleupPractice({ applying, onBack }: { applying: boolean; onBack: () => void }) {
  const rows = useRequirements()
  const unlocked = !!rows && rows.every(row => row.met)
  useLayoutEffect(() => {
    if (!unlocked) updateSafety.setSafety({ dirty: false, busy: false, restoring: false, loading: false })
  }, [unlocked])
  return <>
    <Button className="section-back" variant="secondary" disabled={applying} onClick={onBack}>Back to requirements</Button>
    {!unlocked ? <section className="surface-card">
      {rows === null ? <p role="alert">Could not load requirements.</p> : <p role="status">{rows ? 'Meet all four requirements to open muscle-up practice.' : 'Loading requirements…'}</p>}
    </section> : <div className="performance-disciplines">
      <section className="surface-card" aria-labelledby="muscleup-drills">
        <h2 id="muscleup-drills">Practice drills</h2>
        <ol>{MUSCLEUP_DRILLS.map(drill => <li key={drill}>{drill} · 10 reps</li>)}</ol>
      </section>
      <RepProgress track="muscleups" config={MUSCLEUP_GOAL} applying={applying} />
    </div>}
  </>
}
