export const CARDIO_ACTIVITIES = {
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  walking: 'Walking',
  hiking: 'Hiking',
  rowing: 'Rowing',
  other: 'Other cardio',
} as const

export type CardioActivity = keyof typeof CARDIO_ACTIVITIES

export function isCardioActivity(value: string): value is CardioActivity {
  return Object.hasOwn(CARDIO_ACTIVITIES, value)
}
