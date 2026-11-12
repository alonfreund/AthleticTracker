import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'

export function PerformanceHome({ onOpenCardio, onOpenCalisthenics, blocked }: {
  onOpenCardio: () => void
  onOpenCalisthenics: () => void
  blocked: boolean
}) {
  return <div className="performance-disciplines">
    <section className="training-hero" aria-labelledby="performance-cardio">
      <span className="hero-symbol"><Icon name="performance" /></span>
      <h2 id="performance-cardio">Cardio</h2>
      <p>Running, cycling, swimming, walking, hiking, and rowing.</p>
      <Button onClick={onOpenCardio} disabled={blocked}>Open Cardio <Icon name="arrow" /></Button>
    </section>
    <section className="training-hero" aria-labelledby="performance-calisthenics">
      <span className="hero-symbol"><Icon name="calisthenics" /></span>
      <h2 id="performance-calisthenics">Calisthenics</h2>
      <p>Bodyweight and weighted movements, static holds, and skill progressions.</p>
      <Button onClick={onOpenCalisthenics} disabled={blocked}>Open Calisthenics <Icon name="arrow" /></Button>
    </section>
  </div>
}

export function CalisthenicsHome({ onBack, blocked }: { onBack: () => void; blocked: boolean }) {
  return <>
    <Button className="section-back" variant="secondary" onClick={onBack} disabled={blocked}>Back to Performance</Button>
    <section className="surface-card" aria-labelledby="calisthenics-tracking">
      <h2 id="calisthenics-tracking">Calisthenics tracking is coming</h2>
      <p>Movement benchmarks, holds, and skill practice will live here.</p>
    </section>
  </>
}
