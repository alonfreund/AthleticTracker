import { MUSCLE_REGIONS, type MuscleRegion } from '../../domain/strength/muscleDistribution'

type RegionShape = { path: string; mirror?: boolean }
export type BodySide = 'front' | 'back'
const outline = 'M80 7 C67 7 62 17 63 29 Q63 39 69 44 L69 52 51 57 Q40 58 35 71 L30 103 23 129 17 161 12 178 Q10 187 17 188 L25 177 29 164 40 133 48 108 50 101 Q55 120 53 137 L48 158 Q46 176 51 200 L55 231 Q53 243 57 260 L61 284 54 295 Q52 301 64 301 L72 299 74 281 76 258 77 227 80 183 83 227 84 258 86 281 88 299 96 301 Q108 301 106 295 L99 284 103 260 Q107 243 105 231 L109 200 Q114 176 112 158 L107 137 Q105 120 110 101 L112 108 120 133 131 164 135 177 143 188 Q150 187 148 178 L143 161 137 129 130 103 125 71 Q120 58 109 57 L91 52 91 44 Q97 39 97 29 C98 17 93 7 80 7Z'
const shared = {
  neck: { path: 'M70 44 Q80 50 90 44 L91 53 98 56 Q80 64 62 56 L69 53Z' },
  shoulders: { path: 'M54 59 Q41 59 37 71 L35 86 Q44 85 53 76 L59 63Z', mirror: true },
  forearms: { path: 'M31 118 L39 124 32 145 25 164 18 163 22 143Z', mirror: true },
}
const shapes: Record<BodySide, Partial<Record<MuscleRegion, RegionShape>>> = {
  front: {
    ...shared,
    chest: { path: 'M59 64 Q69 60 78 65 L78 88 Q64 94 51 82Z', mirror: true },
    serratus: { path: 'M52 85 Q59 92 65 92 L61 103 55 107Z', mirror: true },
    biceps: { path: 'M35 88 Q42 87 49 82 L47 104 40 120 32 115Z', mirror: true },
    core: { path: 'M67 94 Q80 90 93 94 L100 105 103 131 Q97 143 80 150 Q63 143 57 131 L60 110Z' },
    'hip-flexors': { path: 'M55 136 Q63 141 74 151 L78 162 Q67 156 54 153Z', mirror: true },
    abductors: { path: 'M53 155 Q57 154 62 158 L55 178 49 174Z', mirror: true },
    adductors: { path: 'M72 160 L78 165 77 184 73 202 68 187Z', mirror: true },
    quadriceps: { path: 'M64 160 L70 160 65 186 72 206 73 223 Q66 232 57 225 L53 199 52 181Z', mirror: true },
    shins: { path: 'M58 237 Q62 232 68 237 L69 253 66 280 62 278 58 256Z', mirror: true },
  },
  back: {
    ...shared,
    'upper-back': { path: 'M62 58 Q80 64 98 58 L104 71 Q99 81 92 82 L80 101 68 82 Q61 81 56 71Z' },
    lats: { path: 'M54 77 Q62 83 68 85 L76 100 72 126 56 111Z', mirror: true },
    'lower-back': { path: 'M77 103 L80 106 83 103 89 128 101 140 Q91 146 80 145 Q69 146 59 140 L71 128Z' },
    triceps: { path: 'M35 88 Q43 87 49 81 L47 104 40 119 32 115Z', mirror: true },
    glutes: { path: 'M56 143 Q68 148 78 147 L78 170 Q67 179 50 170 L51 155Z', mirror: true },
    hamstrings: { path: 'M51 174 Q64 181 77 174 L75 204 71 226 Q65 230 57 223 L53 201Z', mirror: true },
    calves: { path: 'M57 234 Q65 229 73 234 L73 252 Q71 269 66 280 L62 278 58 260 Q54 247 57 234Z', mirror: true },
  },
}

export function sideForRegion(side: BodySide, region: MuscleRegion): BodySide {
  if (shapes[side][region]) return side
  return side === 'front' ? 'back' : 'front'
}

export function heatLevel(count: number, max: number) {
  return count > 0 && max > 0 ? Math.ceil(4 * count / max) : 0
}

export function MuscleBodyMap({ side, counts, max, selected, onSelect }: {
  side: BodySide
  counts: Map<MuscleRegion, number>
  max: number
  selected?: MuscleRegion
  onSelect: (region: MuscleRegion) => void
}) {
  return <svg viewBox="0 0 160 309" className="muscle-body" role="group" aria-label={`${side === 'front' ? 'Front' : 'Back'} muscle map`}>
    <path className="muscle-outline" d={outline} aria-hidden="true" />
    {(Object.keys(shapes[side]) as MuscleRegion[]).map(region => {
      const shape = shapes[side][region]!
      const count = counts.get(region) ?? 0
      return <g key={region} role="button" tabIndex={0} aria-label={`${MUSCLE_REGIONS[region]}, ${count} ${count === 1 ? 'set' : 'sets'}`}
        aria-pressed={selected === region} className={`muscle-shape heat-${heatLevel(count, max)}`}
        onClick={() => onSelect(region)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!event.repeat) onSelect(region)
          }
        }}>
        <path d={shape.path} aria-hidden="true" />
        {shape.mirror && <path d={shape.path} transform="translate(160 0) scale(-1 1)" aria-hidden="true" />}
      </g>
    })}
  </svg>
}
