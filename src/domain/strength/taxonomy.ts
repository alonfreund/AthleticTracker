export const MUSCLES: Record<string, string> = {
  chest: 'Chest', 'upper-back': 'Upper back', lats: 'Lats', traps: 'Traps', 'lower-back': 'Lower back / spinal erectors', shoulders: 'Shoulders',
  triceps: 'Triceps', biceps: 'Biceps', forearms: 'Forearms', core: 'Core', quadriceps: 'Quadriceps', hamstrings: 'Hamstrings',
  glutes: 'Glutes', calves: 'Calves', adductors: 'Adductors', abductors: 'Hip abductors', 'tibialis-anterior': 'Tibialis anterior',
}
export const MUSCLE_FILTER_GROUPS: Record<string, readonly string[]> = { back: ['upper-back', 'lats', 'traps', 'lower-back'] }
export const EQUIPMENT: Record<string, string> = {
  barbell: 'Barbell', dumbbells: 'Dumbbells', kettlebell: 'Kettlebell', cable: 'Cable', 'resistance-band': 'Resistance band',
  machine: 'Machine', bench: 'Bench', rack: 'Rack / safeties', 'pull-up-bar': 'Pull-up bar', 'dip-belt': 'Dip belt', mat: 'Mat',
  'parallel-bars': 'Parallel bars', platform: 'Platform / step', 'smith-machine': 'Smith machine', 'leg-press-machine': 'Leg press machine',
  'leg-extension-machine': 'Leg extension machine', 'leg-curl-machine': 'Leg curl machine', 'assisted-pull-up-machine': 'Assisted pull-up machine',
  'pulldown-machine': 'Pulldown machine', 'cable-rope': 'Cable rope', 'cable-bar': 'Cable bar', 'cable-handle': 'Cable handle',
}
export const EXERCISE_TYPES = { compound: 'Compound', isolation: 'Isolation', stability: 'Stability', conditioning: 'Conditioning', unspecified: 'Unspecified' } as const
// Legacy categories remain readable; they are not mutually exclusive exercise types.
export const CATEGORIES: Record<string, string> = { ...EXERCISE_TYPES, bodyweight: 'Bodyweight', isometric: 'Isometric' }
export const MOVEMENT_PATTERNS: Record<string, string> = {
  'horizontal-push': 'Horizontal push', 'vertical-push': 'Vertical push', 'horizontal-pull': 'Horizontal pull', 'vertical-pull': 'Vertical pull',
  squat: 'Squat / knee dominant', hinge: 'Hinge / hip dominant', 'lunge-step': 'Lunge / step', 'elbow-flexion': 'Elbow flexion', 'elbow-extension': 'Elbow extension',
  'shoulder-raise': 'Shoulder raise', 'horizontal-abduction': 'Horizontal abduction', 'shoulder-rotation': 'Shoulder rotation',
  'hip-abduction': 'Hip abduction', 'hip-adduction': 'Hip adduction', 'knee-flexion': 'Knee flexion', 'knee-extension': 'Knee extension',
  'plantar-flexion': 'Ankle plantar flexion', dorsiflexion: 'Ankle dorsiflexion', 'scapular-movement': 'Scapular movement / elevation',
  'trunk-flexion': 'Trunk flexion', 'trunk-extension': 'Trunk extension', 'trunk-rotation': 'Trunk rotation', 'anti-extension': 'Anti-extension',
  'anti-rotation': 'Anti-rotation', 'lateral-stability': 'Lateral stability', carry: 'Carry', locomotion: 'Locomotion', 'jump-power': 'Jump / power',
}
export const REPETITION_CONVENTIONS = { unspecified: 'Not specified', total: 'Total repetitions', 'per-side': 'Repetitions per side' } as const
