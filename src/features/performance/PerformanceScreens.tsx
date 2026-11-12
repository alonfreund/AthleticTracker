import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'

export function PerformanceHome({ onOpenCardio, blocked }: { onOpenCardio: () => void; blocked: boolean }) {
  return <section className="training-hero" aria-labelledby="performance-cardio">
    <span className="hero-symbol"><Icon name="performance" /></span>
    <h2 id="performance-cardio">Cardio</h2>
    <p>Running, cycling, swimming, walking, hiking, and rowing.</p>
    <Button onClick={onOpenCardio} disabled={blocked}>Open Cardio <Icon name="arrow" /></Button>
  </section>
}
