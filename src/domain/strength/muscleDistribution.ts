export const MUSCLE_REGIONS = {
  neck: 'Neck',
  chest: 'Chest',
  shoulders: 'Shoulders',
  'upper-back': 'Upper back',
  lats: 'Lats',
  'lower-back': 'Lower back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  serratus: 'Serratus anterior',
  'hip-flexors': 'Hip flexors',
  glutes: 'Glutes',
  abductors: 'Hip abductors',
  adductors: 'Adductors',
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  shins: 'Tibialis anterior',
} as const
export type MuscleRegion = keyof typeof MUSCLE_REGIONS
export type MuscleRole = 'primary' | 'secondary'

const aliases = new Map<string, MuscleRegion>([
  ['traps', 'upper-back'], ['rhomboids', 'upper-back'],
  ['anterior-deltoid', 'shoulders'], ['lateral-deltoid', 'shoulders'], ['posterior-deltoid', 'shoulders'], ['rotator-cuff', 'shoulders'],
  ['rectus-abdominis', 'core'], ['obliques', 'core'],
  ['serratus-anterior', 'serratus'], ['tibialis-anterior', 'shins'],
])

export function muscleRegion(tag: string): MuscleRegion | undefined {
  return aliases.get(tag) ?? (Object.hasOwn(MUSCLE_REGIONS, tag) ? tag as MuscleRegion : undefined)
}

type MuscleCount = { region: MuscleRegion; count: number }
export function muscleDistribution(cards: { primary: string[]; secondary: string[]; count: number }[]) {
  const totals = { primary: new Map<MuscleRegion, number>(), secondary: new Map<MuscleRegion, number>() }
  let workingSets = 0
  let unmappedSets = 0
  for (const { primary, secondary, count } of cards) {
    const direct = new Set(primary.map(muscleRegion))
    const supporting = new Set(secondary.map(muscleRegion))
    workingSets += count
    if (!primary.length || direct.has(undefined) || supporting.has(undefined)) unmappedSets += count
    for (const region of direct) if (region) totals.primary.set(region, (totals.primary.get(region) ?? 0) + count)
    for (const region of supporting) if (region && !direct.has(region)) totals.secondary.set(region, (totals.secondary.get(region) ?? 0) + count)
  }
  function rank(counts: Map<MuscleRegion, number>): MuscleCount[] {
    return [...counts].map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count || MUSCLE_REGIONS[a.region].localeCompare(MUSCLE_REGIONS[b.region]))
  }
  return { workingSets, unmappedSets, primary: rank(totals.primary), secondary: rank(totals.secondary) }
}

export type MuscleDistribution = ReturnType<typeof muscleDistribution>
export type MusclePeriod = 7 | 30 | 90 | 'all'

export function muscleDateRange(period: MusclePeriod, now = new Date()) {
  if (period === 'all') return undefined
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - period + 1)
  const before = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return { from: from.toISOString(), before: before.toISOString() }
}
