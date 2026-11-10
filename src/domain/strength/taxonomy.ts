export const MUSCLES: Record<string, string> = {
  chest: 'Chest', 'upper-back': 'Upper back', lats: 'Lats', traps: 'Traps', 'lower-back': 'Lower back / spinal erectors', shoulders: 'Shoulders',
  rhomboids: 'Rhomboids', 'anterior-deltoid': 'Anterior deltoid', 'lateral-deltoid': 'Lateral deltoid', 'posterior-deltoid': 'Posterior deltoid', 'rotator-cuff': 'Rotator cuff', neck: 'Neck', 'rectus-abdominis': 'Rectus abdominis', obliques: 'Obliques',
  triceps: 'Triceps', biceps: 'Biceps', forearms: 'Forearms', core: 'Core', quadriceps: 'Quadriceps', hamstrings: 'Hamstrings',
  glutes: 'Glutes', calves: 'Calves', adductors: 'Adductors', abductors: 'Hip abductors', 'tibialis-anterior': 'Tibialis anterior',
}
export const MUSCLE_FILTER_GROUPS: Record<string, readonly string[]> = { back: ['upper-back', 'lats', 'traps', 'rhomboids', 'lower-back'], 'upper-back': ['upper-back','rhomboids','traps'], shoulders: ['shoulders','anterior-deltoid','lateral-deltoid','posterior-deltoid','rotator-cuff'], core: ['core','rectus-abdominis','obliques'] }
export const EQUIPMENT: Record<string, string> = {
  barbell: 'Barbell', dumbbells: 'Dumbbells', kettlebell: 'Kettlebell', cable: 'Cable', 'resistance-band': 'Resistance band',
  machine: 'Machine', bench: 'Bench', rack: 'Rack / safeties', 'pull-up-bar': 'Pull-up bar', 'dip-belt': 'Dip belt', mat: 'Mat',
  'parallel-bars': 'Parallel bars', platform: 'Platform / step', 'smith-machine': 'Smith machine', 'leg-press-machine': 'Leg press machine',
  'leg-extension-machine': 'Leg extension machine', 'leg-curl-machine': 'Leg curl machine', 'assisted-pull-up-machine': 'Assisted pull-up machine',
  'adjustable-bench': 'Adjustable incline bench', 'decline-bench': 'Decline bench', 'seal-row-bench': 'Raised seal-row bench',
  'chest-press-machine': 'Selectorized chest press machine', 'plate-loaded-chest-press-machine': 'Plate-loaded chest press machine', 'plate-loaded-incline-press-machine': 'Plate-loaded incline press machine',
  'shoulder-press-machine': 'Selectorized shoulder press machine', 'seated-row-machine': 'Selectorized supported row machine', 'plate-loaded-row-machine': 'Plate-loaded supported row machine', 't-bar-row-machine': 'Chest-supported T-bar row machine', 'reverse-fly-machine': 'Reverse pec deck machine', 'pec-deck-machine': 'Pec deck machine',
  'cable-row-station': 'Seated cable row station', 'lat-pulldown-station': 'Cable lat pulldown station', 'dual-cable-station': 'Dual cable station', 'neutral-pulldown-handle': 'Neutral-grip pulldown handle', 'neutral-row-handle': 'Neutral-grip row handle',
  'fixed-bar': 'Secure fixed horizontal bar', 'neutral-pull-up-bar': 'Neutral-grip pull-up handles', 'overhead-band-anchor': 'Secure overhead band anchor',
  'landmine-attachment': 'Landmine attachment', 'landmine-row-handle': 'Landmine row handle', rings: 'Gymnastic rings', 'suspension-trainer': 'Suspension trainer',
  'ez-bar': 'EZ bar', 'trap-bar': 'Trap bar', 'safety-squat-bar': 'Safety-squat bar', 'multi-grip-bar': 'Multi-grip bar', 'medicine-ball': 'Medicine ball', sled: 'Sled', 'ab-wheel': 'Ab wheel', sliders: 'Sliders', 'stability-ball': 'Stability ball', 'neck-harness': 'Neck harness', 'weight-vest': 'Weight vest',
  'plate-loaded-pulldown-machine': 'Plate-loaded pulldown machine', 'pulldown-machine': 'Pulldown machine', 'cable-rope': 'Cable rope', 'cable-bar': 'Cable bar', 'cable-handle': 'Cable handle',
}
export const EXERCISE_TYPES = { compound: 'Compound', isolation: 'Isolation', stability: 'Stability', conditioning: 'Conditioning', unspecified: 'Unspecified' } as const
// Legacy categories remain readable; they are not mutually exclusive exercise types.
export const CATEGORIES: Record<string, string> = { ...EXERCISE_TYPES, bodyweight: 'Bodyweight', isometric: 'Isometric' }
export const MOVEMENT_PATTERNS: Record<string, string> = {
  'horizontal-adduction': 'Horizontal adduction', 'diagonal-push': 'Diagonal push', 'shoulder-extension': 'Shoulder extension', 'wrist-flexion': 'Wrist flexion', 'wrist-extension': 'Wrist extension', 'forearm-pronation': 'Forearm pronation', 'forearm-supination': 'Forearm supination', 'neck-flexion': 'Neck flexion', 'neck-extension': 'Neck extension', 'neck-lateral-flexion': 'Neck lateral flexion', 'neck-rotation': 'Neck rotation', 'neck-stability': 'Neck stability',
  'horizontal-push': 'Horizontal push', 'vertical-push': 'Vertical push', 'horizontal-pull': 'Horizontal pull', 'vertical-pull': 'Vertical pull',
  squat: 'Squat / knee dominant', hinge: 'Hinge / hip dominant', 'lunge-step': 'Lunge / step', 'elbow-flexion': 'Elbow flexion', 'elbow-extension': 'Elbow extension',
  'shoulder-raise': 'Shoulder raise', 'horizontal-abduction': 'Horizontal abduction', 'shoulder-rotation': 'Shoulder rotation',
  'hip-abduction': 'Hip abduction', 'hip-adduction': 'Hip adduction', 'knee-flexion': 'Knee flexion', 'knee-extension': 'Knee extension',
  'plantar-flexion': 'Ankle plantar flexion', dorsiflexion: 'Ankle dorsiflexion', 'scapular-movement': 'Scapular movement / elevation',
  'trunk-flexion': 'Trunk flexion', 'trunk-extension': 'Trunk extension', 'trunk-rotation': 'Trunk rotation', 'anti-extension': 'Anti-extension',
  'anti-rotation': 'Anti-rotation', 'lateral-stability': 'Lateral stability', carry: 'Carry', locomotion: 'Locomotion', 'jump-power': 'Jump / power',
}
export const REPETITION_CONVENTIONS = { unspecified: 'Not specified', total: 'Total repetitions', 'per-side': 'Repetitions per side' } as const

export const EQUIPMENT_FILTER_GROUPS: Record<string,readonly string[]> = {
  machine: Object.keys(EQUIPMENT).filter(id=>id==='machine'||id.endsWith('-machine')),
  cable: ['cable','cable-row-station','lat-pulldown-station','dual-cable-station'],
}
