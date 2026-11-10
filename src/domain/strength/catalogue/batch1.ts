// Batch 1: explicit, permanent reservations. Original instructions; no generated variation combinations.
import { defineBatchOne, type Entry } from './define'
const entries: readonly Entry[] = [
  {
    "number": 1,
    "name": "Dumbbell bench press",
    "aliases": [
      "Flat dumbbell press",
      "DB bench press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "flat bench",
      "grip": "pronated"
    },
    "instructions": "Lie on a flat bench with feet planted and dumbbells beside the chest. Press both weights upward without bouncing them together. Lower with the forearms under the weights.",
    "notes": "Set the dumbbells down under control at the end of the set."
  },
  {
    "number": 2,
    "name": "Incline barbell bench press",
    "aliases": [
      "Incline bench press",
      "Incline BB press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "barbell",
      "rack",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "low incline",
      "support": "incline bench",
      "grip": "pronated"
    },
    "instructions": "Set an adjustable bench to a low incline inside a rack. Unrack the bar with wrists above the elbows, lower toward the upper chest, then press back to the start.",
    "notes": "Use rack safeties or a spotter. Keep the chosen incline consistent between sessions."
  },
  {
    "number": 3,
    "name": "Incline dumbbell bench press",
    "aliases": [
      "Incline DB press",
      "Incline dumbbell chest press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "low incline",
      "support": "incline bench",
      "grip": "pronated"
    },
    "instructions": "Sit against a low-incline bench with the dumbbells near the upper chest. Press upward while keeping the torso against the pad. Lower both weights through a comfortable range.",
    "notes": "Use the same bench angle for comparable records."
  },
  {
    "number": 4,
    "name": "Decline barbell bench press",
    "aliases": [
      "Decline bench press",
      "Decline BB press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "barbell",
      "rack",
      "decline-bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "decline",
      "support": "decline bench",
      "grip": "pronated"
    },
    "instructions": "Secure the legs on a decline bench beneath a racked bar. Unrack with assistance if needed, lower the bar toward the lower chest, then press upward under control.",
    "notes": "Use a bench designed for decline pressing and arrange safeties or a spotter."
  },
  {
    "number": 5,
    "name": "Decline dumbbell bench press",
    "aliases": [
      "Decline DB press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "decline-bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "decline",
      "support": "decline bench",
      "grip": "pronated"
    },
    "instructions": "Secure yourself on a decline bench and position both dumbbells beside the chest. Press them above the torso, then lower without letting the shoulders roll forward.",
    "notes": "Arrange a controlled way to get the weights into and out of position."
  },
  {
    "number": 6,
    "name": "Close-grip barbell bench press",
    "aliases": [
      "Close-grip bench press",
      "Narrow-grip bench press"
    ],
    "family": "bench-press",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "chest",
      "anterior-deltoid"
    ],
    "equipment": [
      "barbell",
      "rack",
      "bench"
    ],
    "patterns": [
      "horizontal-push",
      "elbow-extension"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "flat bench",
      "grip": "close pronated"
    },
    "instructions": "Lie on a flat bench and hold the bar with a comfortably narrow grip. Lower with the wrists aligned over the forearms and elbows near the torso. Press to straight arms without bouncing.",
    "notes": "A close grip does not require the hands to touch. Use safeties or a spotter."
  },
  {
    "number": 7,
    "name": "Paused barbell bench press",
    "aliases": [
      "Pause bench press",
      "Paused BB bench"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "barbell",
      "rack",
      "bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "flat bench",
      "grip": "pronated",
      "execution": "deliberate pause at chest"
    },
    "instructions": "Lower a racked barbell to the chest while keeping the upper back set. Hold the bar motionless briefly without relaxing into the chest, then press to the start.",
    "notes": "Use a consistent pause duration for comparison; do not bounce the bar."
  },
  {
    "number": 8,
    "name": "Barbell floor press",
    "aliases": [
      "BB floor press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "floor",
      "grip": "pronated"
    },
    "instructions": "Lie on the floor under a safely racked bar with knees bent. Lower until the upper arms gently contact the floor. Maintain tension and press upward without rebounding.",
    "notes": "Set rack safeties for the floor position; the floor limits the bottom range."
  },
  {
    "number": 9,
    "name": "Dumbbell floor press",
    "aliases": [
      "DB floor press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "floor",
      "grip": "pronated"
    },
    "instructions": "Lie on the floor with knees bent and dumbbells above the chest. Lower until the upper arms lightly touch the floor, then press both weights upward.",
    "notes": "Keep the elbows controlled rather than striking or bouncing off the floor."
  },
  {
    "number": 10,
    "name": "Neutral-grip dumbbell bench press",
    "aliases": [
      "Palms-in dumbbell bench press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "flat bench",
      "grip": "neutral"
    },
    "instructions": "Lie on a flat bench with palms facing each other. Lower the dumbbells beside the chest while keeping that grip. Press both weights upward with the feet supported.",
    "notes": "Keep the palms-in grip throughout; this is distinct from the standard pronated press."
  },
  {
    "number": 11,
    "name": "Single-arm dumbbell bench press",
    "aliases": [
      "One-arm dumbbell bench press",
      "Unilateral DB bench press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "horizontal-push",
      "anti-rotation"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "angle": "flat",
      "support": "flat bench",
      "grip": "neutral",
      "execution": "single arm"
    },
    "instructions": "Lie on a flat bench holding one dumbbell beside the chest. Brace the torso so the hips do not roll, press the weight up, then lower. Repeat on the other side.",
    "notes": "Use a load that allows a stable torso; do not twist to finish the press."
  },
  {
    "number": 12,
    "name": "Smith machine bench press",
    "aliases": [
      "Flat Smith press",
      "Smith chest press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "smith-machine",
      "bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "flat bench",
      "grip": "pronated"
    },
    "instructions": "Position a flat bench so the Smith bar reaches the chest without forcing the shoulders. Set the stops, unlock the bar, then lower and press along the rails.",
    "notes": "Check bench placement with an unloaded carriage before loading plates."
  },
  {
    "number": 13,
    "name": "Incline Smith machine bench press",
    "aliases": [
      "Incline Smith press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "smith-machine",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "angle": "low incline",
      "support": "incline bench",
      "grip": "pronated"
    },
    "instructions": "Place a low-incline bench under the Smith bar and set the stops. Unlock the carriage, lower toward the upper chest, then press while keeping the back supported.",
    "notes": "Keep the bench angle and position consistent; rail angles differ between machines."
  },
  {
    "number": 14,
    "name": "Seated chest press machine",
    "aliases": [
      "Selectorized chest press",
      "Machine chest press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "chest-press-machine"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "horizontal",
      "support": "machine back pad",
      "grip": "machine handles"
    },
    "instructions": "Adjust the seat so the handles start around mid-chest. Keep the back on the pad, press the handles forward, then return without letting the stack slam.",
    "notes": "Follow the machine setup markings and use the same handle option for comparisons."
  },
  {
    "number": 15,
    "name": "Plate-loaded chest press machine",
    "aliases": [
      "Lever chest press",
      "Plate-loaded flat chest press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "plate-loaded-chest-press-machine"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "angle": "horizontal",
      "support": "machine back pad",
      "grip": "machine handles"
    },
    "instructions": "Set the seat on a plate-loaded horizontal chest press and load the working levers evenly. Press both handles away from the chest, then lower the levers under control.",
    "notes": "This entry records a bilateral set on a plate-loaded machine, not a selectorized stack."
  },
  {
    "number": 16,
    "name": "Plate-loaded incline chest press",
    "aliases": [
      "Incline lever press",
      "Plate-loaded incline press machine"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "triceps"
    ],
    "equipment": [
      "plate-loaded-incline-press-machine"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "angle": "incline",
      "support": "machine back pad",
      "grip": "machine handles"
    },
    "instructions": "Adjust the seat on an incline press machine so the handles align with the upper chest. Press along the machine path, then return with the torso against the pad.",
    "notes": "Use equal loading on independent arms for bilateral sets."
  },
  {
    "number": 17,
    "name": "Standing cable chest press",
    "aliases": [
      "Dual-cable chest press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "cable",
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-push",
      "anti-extension"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "horizontal",
      "support": "none",
      "stance": "split stance",
      "execution": "two arms"
    },
    "instructions": "Set two cable handles around chest height and take a stable split stance. Brace, press both handles forward, then return without letting the cables pull the torso backward.",
    "notes": "Two matching handles and two independent pulleys are required."
  },
  {
    "number": 18,
    "name": "Single-arm standing cable chest press",
    "aliases": [
      "One-arm cable chest press"
    ],
    "family": "bench-press",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-push",
      "anti-rotation"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "angle": "horizontal",
      "support": "none",
      "stance": "split stance",
      "execution": "single arm"
    },
    "instructions": "Face away from a chest-height pulley in a split stance. Press one handle forward without turning the torso, then bring it back beside the chest. Change sides.",
    "notes": "Keep the ribs and pelvis facing forward rather than rotating through the press."
  },
  {
    "number": 19,
    "name": "Dumbbell chest fly",
    "aliases": [
      "Flat dumbbell fly",
      "DB pec fly"
    ],
    "family": "chest-fly",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "type": "isolation",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "flat",
      "support": "flat bench",
      "grip": "neutral"
    },
    "instructions": "Lie on a flat bench holding dumbbells above the chest. With a small fixed elbow bend, open the arms to a comfortable depth, then bring the weights back over the chest.",
    "notes": "Keep the elbow angle nearly constant; do not turn the return into a press."
  },
  {
    "number": 20,
    "name": "Incline dumbbell chest fly",
    "aliases": [
      "Incline dumbbell fly",
      "Incline DB fly"
    ],
    "family": "chest-fly",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "type": "isolation",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "low incline",
      "support": "incline bench",
      "grip": "neutral"
    },
    "instructions": "Lie against a low-incline bench with dumbbells above the upper chest. Open the arms with softly bent elbows, then close the same arc without lifting the torso.",
    "notes": "Do not chase extra depth by letting the shoulders roll forward."
  },
  {
    "number": 21,
    "name": "Standing cable chest fly",
    "aliases": [
      "Mid-height cable fly",
      "Cable crossover"
    ],
    "family": "chest-fly",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid"
    ],
    "equipment": [
      "cable",
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "mid-height",
      "support": "none",
      "stance": "split stance"
    },
    "instructions": "Set two pulleys around chest height and stand between them. With a slight fixed elbow bend, sweep the handles together in front of the chest, then reopen under control.",
    "notes": "Use equal stack settings. Keep the crossing point consistent rather than alternating large overlaps."
  },
  {
    "number": 22,
    "name": "Low-to-high cable chest fly",
    "aliases": [
      "Low cable fly",
      "Low cable crossover"
    ],
    "family": "chest-fly",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid"
    ],
    "equipment": [
      "cable",
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "low to high",
      "support": "none",
      "stance": "split stance"
    },
    "instructions": "Start with two handles on low pulleys and a stable stance. Sweep the arms forward and upward toward the upper chest with elbows softly bent. Return along the same path.",
    "notes": "The upward path is a variation, not isolation of a separate upper-chest muscle."
  },
  {
    "number": 23,
    "name": "High-to-low cable chest fly",
    "aliases": [
      "High cable fly",
      "High cable crossover"
    ],
    "family": "chest-fly",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid"
    ],
    "equipment": [
      "cable",
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "high to low",
      "support": "none",
      "stance": "split stance"
    },
    "instructions": "Take handles from high pulleys and step into a stable stance. Bring the arms down and inward in front of the lower chest, then reopen slowly.",
    "notes": "Maintain the elbow bend and avoid using a torso dip to move the load."
  },
  {
    "number": 24,
    "name": "Pec deck chest fly",
    "aliases": [
      "Machine chest fly",
      "Butterfly machine"
    ],
    "family": "chest-fly",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid"
    ],
    "equipment": [
      "pec-deck-machine"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "horizontal",
      "support": "machine back pad",
      "grip": "machine pads or handles"
    },
    "instructions": "Set the seat so the upper arms align with the machine pivots. Bring the pads or handles together in front of the chest, then return without forcing a deep stretch.",
    "notes": "Use the machine in its chest-fly configuration, not the reverse-fly position."
  },
  {
    "number": 25,
    "name": "Standing barbell overhead press",
    "aliases": [
      "Military press",
      "Strict barbell press",
      "BB overhead press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "traps",
      "core"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "patterns": [
      "vertical-push"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "none",
      "stance": "standing",
      "grip": "pronated",
      "execution": "strict"
    },
    "instructions": "Start with the bar at the upper chest and feet planted. Brace the trunk and press overhead without dipping the knees. Lower to the starting position under control.",
    "notes": "Keep this entry strict; use the separate push-press entry when using leg drive."
  },
  {
    "number": 26,
    "name": "Seated barbell shoulder press",
    "aliases": [
      "Seated BB overhead press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "traps"
    ],
    "equipment": [
      "barbell",
      "rack",
      "adjustable-bench"
    ],
    "patterns": [
      "vertical-push"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "upright bench",
      "stance": "seated",
      "grip": "pronated"
    },
    "instructions": "Sit against an upright bench with the bar racked in front of you. Unrack, press overhead without lifting off the pad, then lower the bar in front of the face.",
    "notes": "Set safeties and use a comfortable front-of-body bar path; this is not a behind-neck press."
  },
  {
    "number": 27,
    "name": "Seated dumbbell shoulder press",
    "aliases": [
      "Seated DB overhead press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "traps"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "vertical-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "upright bench",
      "stance": "seated",
      "grip": "pronated"
    },
    "instructions": "Sit with the back supported and dumbbells near shoulder height. Press both weights overhead, then lower with the forearms beneath the dumbbells.",
    "notes": "Keep the bench position consistent and avoid sliding into a steep incline chest press."
  },
  {
    "number": 28,
    "name": "Seated Arnold press",
    "aliases": [
      "Arnold dumbbell press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "vertical-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "upright bench",
      "stance": "seated",
      "grip": "rotating supinated to pronated"
    },
    "instructions": "Sit upright with dumbbells in front of the shoulders and palms facing you. Rotate the arms outward as you press overhead. Reverse the motion smoothly on the way down.",
    "notes": "Use a comfortable rotation and avoid forcing the shoulders behind the torso."
  },
  {
    "number": 29,
    "name": "Seated neutral-grip dumbbell shoulder press",
    "aliases": [
      "Palms-in seated DB press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "traps"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "vertical-push"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "upright bench",
      "stance": "seated",
      "grip": "neutral"
    },
    "instructions": "Sit against an upright backrest with palms facing each other. Press both dumbbells overhead while retaining the neutral grip, then lower beside the shoulders.",
    "notes": "Keep the palms-in position throughout the set."
  },
  {
    "number": 30,
    "name": "Single-arm standing dumbbell overhead press",
    "aliases": [
      "One-arm DB overhead press",
      "Unilateral dumbbell shoulder press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "core",
      "traps"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "vertical-push",
      "lateral-stability"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "angle": "vertical",
      "support": "none",
      "stance": "standing",
      "grip": "neutral",
      "execution": "single arm strict"
    },
    "instructions": "Hold one dumbbell near the shoulder while standing tall. Press overhead without leaning sideways or dipping the knees, then lower and repeat on the other arm.",
    "notes": "Brace against the sideways pull of the single weight; no leg drive."
  },
  {
    "number": 31,
    "name": "Seated Smith machine shoulder press",
    "aliases": [
      "Smith overhead press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "traps"
    ],
    "equipment": [
      "smith-machine",
      "adjustable-bench"
    ],
    "patterns": [
      "vertical-push"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "upright bench",
      "stance": "seated",
      "grip": "pronated"
    },
    "instructions": "Place an upright bench under the Smith bar with the bar path in front of the face. Set the stops, unlock the carriage, then press overhead and lower under control.",
    "notes": "Check the unloaded path first; do not force a behind-neck position to fit the rails."
  },
  {
    "number": 32,
    "name": "Shoulder press machine",
    "aliases": [
      "Selectorized shoulder press",
      "Machine overhead press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "traps"
    ],
    "equipment": [
      "shoulder-press-machine"
    ],
    "patterns": [
      "vertical-push"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "machine back pad",
      "stance": "seated",
      "grip": "machine handles"
    },
    "instructions": "Adjust the seat so the handles begin near shoulder height. Keep the torso supported, press the handles upward, then return without dropping the stack.",
    "notes": "Use the same handle option and seat setting for comparable logs."
  },
  {
    "number": 33,
    "name": "Half-kneeling single-arm landmine press",
    "aliases": [
      "Half-kneeling landmine press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid"
    ],
    "secondary": [
      "chest",
      "triceps",
      "core"
    ],
    "equipment": [
      "barbell",
      "landmine-attachment"
    ],
    "patterns": [
      "diagonal-push",
      "anti-rotation"
    ],
    "type": "compound",
    "load": "landmine",
    "repetitions": "per-side",
    "variant": {
      "angle": "diagonal",
      "support": "none",
      "stance": "half kneeling",
      "grip": "bar sleeve",
      "execution": "single arm"
    },
    "instructions": "Secure one bar end in a landmine attachment and kneel with the opposite foot forward. Hold the sleeve near the working shoulder, press it diagonally forward and up, then return.",
    "notes": "Keep the trunk facing forward. The anchored bar follows an arc rather than a vertical path."
  },
  {
    "number": 34,
    "name": "Barbell push press",
    "aliases": [
      "BB push press"
    ],
    "family": "push-press",
    "primary": [
      "anterior-deltoid",
      "triceps"
    ],
    "secondary": [
      "quadriceps",
      "glutes",
      "lateral-deltoid",
      "core"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "patterns": [
      "vertical-push",
      "jump-power"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "stance": "standing",
      "grip": "pronated",
      "execution": "leg-driven press"
    },
    "instructions": "Hold the bar in a front-rack position. Make a short upright knee dip, drive through the legs and finish the press overhead. Lower and reset before the next repetition.",
    "notes": "This is a push press, not a jerk: do not re-bend the knees to catch the bar."
  },
  {
    "number": 35,
    "name": "Dumbbell push press",
    "aliases": [
      "DB push press"
    ],
    "family": "push-press",
    "primary": [
      "anterior-deltoid",
      "triceps"
    ],
    "secondary": [
      "quadriceps",
      "glutes",
      "lateral-deltoid",
      "core"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "vertical-push",
      "jump-power"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "stance": "standing",
      "grip": "neutral",
      "execution": "leg-driven press"
    },
    "instructions": "Hold two dumbbells at the shoulders. Dip slightly through the knees with the torso upright, then drive the legs and press both weights overhead. Lower and reset the rack position.",
    "notes": "Count one leg drive and overhead finish as one rep; do not turn the set into repeated bouncing."
  },
  {
    "number": 36,
    "name": "Dumbbell Z press",
    "aliases": [
      "Seated floor dumbbell press",
      "DB Z press"
    ],
    "family": "shoulder-press",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "triceps",
      "core",
      "traps"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "vertical-push",
      "anti-extension"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "angle": "vertical",
      "support": "floor",
      "stance": "seated legs forward",
      "grip": "neutral"
    },
    "instructions": "Sit on the floor with legs forward and the torso tall. Start the dumbbells at shoulder height, press overhead, then lower without rolling backward or using leg drive.",
    "notes": "Use a position that lets the torso stay upright; floor sitting makes this distinct from a back-supported press."
  },
  {
    "number": 37,
    "name": "Barbell bent-over row",
    "aliases": [
      "Bent-over barbell row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "lower-back"
    ],
    "equipment": [
      "barbell"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "support": "none",
      "stance": "hip hinge",
      "execution": null
    },
    "instructions": "Hinge at the hips with a braced torso and hold the bar below the shoulders. Pull toward the lower ribs, then extend the elbows without changing the torso angle.",
    "notes": ""
  },
  {
    "number": 38,
    "name": "Underhand barbell row",
    "aliases": [
      "Supinated barbell row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "lower-back"
    ],
    "equipment": [
      "barbell"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "grip": "supinated",
      "support": "none",
      "stance": "hip hinge",
      "execution": null
    },
    "instructions": "Hinge with an underhand grip and the bar hanging beneath the shoulders. Draw the elbows back toward the hips, lower smoothly and keep the wrists straight.",
    "notes": ""
  },
  {
    "number": 39,
    "name": "Pendlay row",
    "aliases": [
      "Dead-stop barbell row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "lower-back"
    ],
    "equipment": [
      "barbell"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "support": "none",
      "stance": "hip hinge",
      "execution": "floor reset"
    },
    "instructions": "Start each rep with the bar resting on the floor and the torso near horizontal. Brace, row toward the lower chest without standing up, then return the bar to the floor and reset.",
    "notes": ""
  },
  {
    "number": 40,
    "name": "Single-arm dumbbell row",
    "aliases": [
      "One-arm DB row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "support": "hand and knee on bench",
      "stance": "split support",
      "execution": null
    },
    "instructions": "Support one hand and knee on a bench, keeping the back steady. Pull the other dumbbell toward the hip, then lower to a controlled arm extension. Complete both sides.",
    "notes": ""
  },
  {
    "number": 41,
    "name": "Chest-supported dumbbell row",
    "aliases": [
      "Incline bench DB row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "support": "incline chest pad",
      "stance": "prone",
      "execution": null
    },
    "instructions": "Lie chest down on an incline bench with dumbbells hanging and palms facing each other. Row toward the hips with elbows close, then lower without lifting the chest off the pad.",
    "notes": ""
  },
  {
    "number": 42,
    "name": "Barbell seal row",
    "aliases": [
      "Seal row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "barbell",
      "seal-row-bench"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "support": "flat raised bench",
      "stance": "prone",
      "execution": null
    },
    "instructions": "Lie face down on a raised seal-row bench with the bar below and enough clearance for full arm extension. Row toward the underside of the bench, then lower while keeping the chest supported.",
    "notes": ""
  },
  {
    "number": 43,
    "name": "Incline-bench dumbbell high row",
    "aliases": [
      "Chest-supported DB high row"
    ],
    "family": "horizontal-row",
    "primary": [
      "rhomboids",
      "posterior-deltoid"
    ],
    "secondary": [
      "traps",
      "biceps"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "support": "incline chest pad",
      "stance": "prone",
      "execution": "elbows out"
    },
    "instructions": "Lie chest down on an incline bench and hold dumbbells with palms facing back. Row with elbows out toward shoulder height, then lower under control without shrugging.",
    "notes": ""
  },
  {
    "number": 44,
    "name": "Seated cable row",
    "aliases": [
      "Close-grip cable row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "cable",
      "cable-row-station",
      "neutral-row-handle"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "support": "none",
      "stance": "seated",
      "execution": null
    },
    "instructions": "Sit at a cable row station with knees slightly bent and hold the neutral handle. Pull toward the lower ribs with a steady torso, then extend the arms without rounding the lower back.",
    "notes": ""
  },
  {
    "number": 45,
    "name": "Wide-grip seated cable row",
    "aliases": [
      "Wide cable row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "cable",
      "cable-row-station",
      "cable-bar"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "wide pronated",
      "support": "none",
      "stance": "seated",
      "execution": "elbows out"
    },
    "instructions": "Sit at a cable row station holding a wide overhand bar grip. Pull toward the upper abdomen with elbows out, then return without leaning backward to move the stack.",
    "notes": ""
  },
  {
    "number": 46,
    "name": "Single-arm seated cable row",
    "aliases": [
      "One-arm cable row seated"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "cable",
      "cable-row-station",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "support": "none",
      "stance": "seated",
      "execution": "single arm"
    },
    "instructions": "Sit square to a cable row station and hold one handle. Row toward the working hip while keeping both shoulders facing forward, then reach under control. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 47,
    "name": "Single-arm standing cable row",
    "aliases": [
      "Standing one-arm cable row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "support": "none",
      "stance": "split stance",
      "execution": "single arm"
    },
    "instructions": "Stand in a split stance facing a cable set around lower-chest height. Row one handle toward the ribs without rotating the torso, then return. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 48,
    "name": "Half-kneeling single-arm cable row",
    "aliases": [
      "Kneeling one-arm cable row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "support": "none",
      "stance": "half kneeling",
      "execution": "single arm"
    },
    "instructions": "Half-kneel facing a cable set near chest height and hold one handle. Pull toward the working ribs with hips and shoulders square, then extend the arm. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 49,
    "name": "Chest-supported row machine",
    "aliases": [
      "Selectorized supported row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "seated-row-machine"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "support": "chest pad",
      "stance": "seated",
      "execution": null
    },
    "instructions": "Adjust the seat and chest pad so the handles are reachable with arms extended. Keep the chest supported, pull the handles back, then return without letting the stack slam.",
    "notes": ""
  },
  {
    "number": 50,
    "name": "Plate-loaded chest-supported row",
    "aliases": [
      "Plate-loaded supported row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "plate-loaded-row-machine"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "support": "chest pad",
      "stance": "seated",
      "execution": null
    },
    "instructions": "Load the working levers evenly and adjust the chest support. Row both handles toward the ribs while staying against the pad, then lower the levers smoothly.",
    "notes": ""
  },
  {
    "number": 51,
    "name": "Single-arm row machine",
    "aliases": [
      "Unilateral selectorized row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "seated-row-machine"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "support": "chest pad",
      "stance": "seated",
      "execution": "single arm"
    },
    "instructions": "Adjust a supported selectorized row machine and hold one independent handle. Keep the torso against the pad, row the working arm, then return. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 52,
    "name": "Chest-supported T-bar row",
    "aliases": [
      "Supported T-bar row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "t-bar-row-machine"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "support": "chest pad",
      "stance": "standing on platform",
      "execution": null
    },
    "instructions": "Set the chest pad and stand on the T-bar row platform. With the chest supported, pull the handles toward the ribs, then lower to a controlled arm extension.",
    "notes": ""
  },
  {
    "number": 53,
    "name": "Meadows row",
    "aliases": [
      "Single-arm landmine sleeve row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "lower-back"
    ],
    "equipment": [
      "barbell",
      "landmine-attachment"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "landmine",
    "repetitions": "per-side",
    "variant": {
      "grip": "pronated sleeve",
      "support": "none",
      "stance": "staggered hip hinge",
      "execution": "single arm"
    },
    "instructions": "Stand side-on to the free end of an anchored bar and hinge with a staggered stance. Grip the sleeve overhand, row toward the hip and lower without twisting the trunk. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 54,
    "name": "Landmine T-bar row",
    "aliases": [
      "Unsupported T-bar row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "lower-back"
    ],
    "equipment": [
      "barbell",
      "landmine-attachment",
      "landmine-row-handle"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "landmine",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "support": "none",
      "stance": "hip hinge",
      "execution": null
    },
    "instructions": "Straddle an anchored bar and attach a suitable neutral row handle near its free end. Hinge with a braced back, pull toward the lower ribs, then lower without jerking the torso upward.",
    "notes": ""
  },
  {
    "number": 55,
    "name": "Smith machine bent-over row",
    "aliases": [
      "Smith row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "lower-back"
    ],
    "equipment": [
      "smith-machine"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "support": "none",
      "stance": "hip hinge",
      "execution": null
    },
    "instructions": "Set the Smith bar low, take an overhand grip and hinge with knees softly bent. Pull along the rails toward the abdomen, then lower while holding the torso angle.",
    "notes": ""
  },
  {
    "number": 56,
    "name": "Inverted row",
    "aliases": [
      "Bodyweight row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "fixed-bar"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "support": "none",
      "stance": "heels on floor",
      "execution": "rigid body"
    },
    "instructions": "Set a secure fixed bar above floor level and hang beneath it with heels on the floor. Keep the body straight, pull the chest toward the bar, then lower with control.",
    "notes": ""
  },
  {
    "number": 57,
    "name": "Feet-elevated inverted row",
    "aliases": [
      "Elevated bodyweight row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "fixed-bar",
      "platform"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "support": "none",
      "stance": "heels elevated",
      "execution": "rigid body"
    },
    "instructions": "Hang beneath a secure fixed bar with heels on a stable raised platform. Brace the body in a straight line, pull the chest toward the bar, then lower without dropping the hips.",
    "notes": ""
  },
  {
    "number": 58,
    "name": "Dumbbell pullover",
    "aliases": [
      "DB pullover"
    ],
    "family": "pullover",
    "primary": [
      "lats",
      "chest"
    ],
    "secondary": [
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "shoulder-extension"
    ],
    "type": "isolation",
    "load": "single-dumbbell",
    "repetitions": "total",
    "variant": {
      "support": "flat bench",
      "stance": "supine",
      "grip": "both hands on one dumbbell"
    },
    "instructions": "Lie lengthwise on a bench holding one dumbbell above the chest. With elbows slightly bent, lower behind the head only as far as the ribs stay down, then bring the weight back above the chest.",
    "notes": "Keep the elbow angle nearly constant; this is not a triceps extension."
  },
  {
    "number": 59,
    "name": "Straight-arm cable pulldown",
    "aliases": [
      "Cable pullover"
    ],
    "family": "pullover",
    "primary": [
      "lats"
    ],
    "secondary": [
      "triceps",
      "core"
    ],
    "equipment": [
      "cable",
      "cable-bar"
    ],
    "patterns": [
      "shoulder-extension"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "pronated"
    },
    "instructions": "Face a high pulley with a bar attachment. Keep a small fixed elbow bend and pull the bar toward the thighs, then return overhead without leaning farther forward.",
    "notes": ""
  },
  {
    "number": 60,
    "name": "Rope straight-arm cable pulldown",
    "aliases": [
      "Rope pullover"
    ],
    "family": "pullover",
    "primary": [
      "lats"
    ],
    "secondary": [
      "triceps",
      "core"
    ],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "shoulder-extension"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "neutral rope"
    },
    "instructions": "Face a high pulley holding the rope ends. Keep elbows softly bent, sweep the hands down beside the thighs, then return without arching the back.",
    "notes": ""
  },
  {
    "number": 61,
    "name": "Neutral-grip lat pulldown",
    "aliases": [
      "Parallel-grip pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "lat-pulldown-station",
      "neutral-pulldown-handle"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "seated",
      "execution": null
    },
    "instructions": "Secure the thighs under the pad and hold a neutral pulldown handle. Pull toward the upper chest with elbows moving down, then let the arms extend without lifting out of the seat.",
    "notes": ""
  },
  {
    "number": 62,
    "name": "Underhand lat pulldown",
    "aliases": [
      "Reverse-grip pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "lat-pulldown-station",
      "cable-bar"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "supinated",
      "stance": "seated",
      "execution": null
    },
    "instructions": "Sit with thighs secured and take a shoulder-width underhand grip. Pull toward the upper chest, then return smoothly without swinging backward or bending the wrists.",
    "notes": ""
  },
  {
    "number": 63,
    "name": "Wide-grip lat pulldown",
    "aliases": [
      "Wide overhand pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "lat-pulldown-station",
      "cable-bar"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "wide pronated",
      "stance": "seated",
      "execution": null
    },
    "instructions": "Sit with thighs secured and grip the bar moderately wider than the shoulders. Pull in front of the head toward the upper chest, then return overhead. Avoid an extreme grip width.",
    "notes": ""
  },
  {
    "number": 64,
    "name": "Half-kneeling single-arm cable lat pulldown",
    "aliases": [
      "Kneeling one-arm pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "stance": "half kneeling",
      "execution": "single arm"
    },
    "instructions": "Half-kneel beneath a high cable holding one handle. Pull the elbow down toward the working ribs without tilting sideways, then reach overhead under control. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 65,
    "name": "Plate-loaded lat pulldown machine",
    "aliases": [
      "Plate-loaded pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "plate-loaded-pulldown-machine"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "seated",
      "execution": null
    },
    "instructions": "Load the machine levers evenly and adjust the seat and thigh support. Pull the handles downward toward the shoulders, then return without letting the levers drop.",
    "notes": ""
  },
  {
    "number": 66,
    "name": "Chin-up",
    "aliases": [
      "Underhand pull-up"
    ],
    "family": "pull-up",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "pull-up-bar"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "grip": "supinated",
      "stance": "hanging",
      "execution": null
    },
    "instructions": "Hang from a secure bar with an underhand grip. Pull until the chin clears the bar without kicking, then lower to a comfortable arm extension.",
    "notes": ""
  },
  {
    "number": 67,
    "name": "Neutral-grip pull-up",
    "aliases": [
      "Parallel-grip pull-up"
    ],
    "family": "pull-up",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "neutral-pull-up-bar"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "hanging",
      "execution": null
    },
    "instructions": "Hang from secure parallel pull-up handles with palms facing each other. Pull upward without swinging, then lower under control to a comfortable arm extension.",
    "notes": ""
  },
  {
    "number": 68,
    "name": "Weighted chin-up",
    "aliases": [
      "Added-weight chin-up"
    ],
    "family": "pull-up",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "pull-up-bar",
      "dip-belt"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "added",
    "repetitions": "total",
    "variant": {
      "grip": "supinated",
      "stance": "hanging",
      "execution": null
    },
    "instructions": "Secure added weight to a dip belt and hang from a bar with an underhand grip. Pull the chin above the bar without swinging, then lower smoothly. Keep the plates clear of nearby objects.",
    "notes": ""
  },
  {
    "number": 69,
    "name": "Assisted chin-up machine",
    "aliases": [
      "Machine-assisted chin-up"
    ],
    "family": "pull-up",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "assisted-pull-up-machine"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "assisted",
    "repetitions": "total",
    "variant": {
      "grip": "supinated",
      "stance": "supported hanging",
      "execution": null
    },
    "instructions": "Select assistance and mount the assisted pull-up machine according to its design. Take an underhand grip, pull upward without bouncing the support pad, then lower under control.",
    "notes": ""
  },
  {
    "number": 70,
    "name": "Scapular pull-up",
    "aliases": [
      "Scap pull-up",
      "Active hang repetitions"
    ],
    "family": "scapular-pull-up",
    "primary": [
      "lats",
      "traps"
    ],
    "secondary": [],
    "equipment": [
      "pull-up-bar"
    ],
    "patterns": [
      "scapular-movement"
    ],
    "type": "isolation",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "grip": "pronated",
      "stance": "hanging",
      "execution": "straight elbows"
    },
    "instructions": "Hang from a secure bar with straight elbows. Draw the shoulders gently down to raise the torso a small distance, then return to the starting hang. Keep the elbows straight throughout.",
    "notes": "Use a comfortable shoulder range rather than forcing a passive hang."
  },
  {
    "number": 71,
    "name": "Single-arm seated lat pulldown",
    "aliases": [
      "Seated unilateral pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "lat-pulldown-station",
      "cable-handle"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "stance": "seated",
      "execution": "single arm"
    },
    "instructions": "Sit at a pulldown station with thighs secured and one cable handle overhead. Pull the working elbow toward the ribs while keeping the torso square, then extend overhead. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 72,
    "name": "Band lat pulldown",
    "aliases": [
      "Kneeling resistance-band pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats"
    ],
    "secondary": [
      "biceps",
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "resistance-band",
      "overhead-band-anchor"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "type": "compound",
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "kneeling",
      "execution": null
    },
    "instructions": "Secure a suitable band to an overhead anchor and kneel beneath it. Hold both ends, pull the elbows down toward the ribs, then return slowly. Check the band and anchor before loading them.",
    "notes": ""
  },
  {
    "number": 73,
    "name": "Cable face pull",
    "aliases": [
      "Rope face pull"
    ],
    "family": "face-pull",
    "primary": [
      "posterior-deltoid",
      "traps"
    ],
    "secondary": [
      "rhomboids",
      "rotator-cuff"
    ],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "horizontal-pull",
      "shoulder-rotation"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "neutral rope",
      "stance": "standing"
    },
    "instructions": "Set the rope around face height. Pull the ends toward the sides of the face with elbows out and rotate the hands back comfortably. Return without leaning backward.",
    "notes": "Use a light enough load to keep the neck relaxed and the movement controlled."
  },
  {
    "number": 74,
    "name": "Reverse pec deck fly",
    "aliases": [
      "Rear delt machine fly"
    ],
    "family": "reverse-fly",
    "primary": [
      "posterior-deltoid"
    ],
    "secondary": [
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "reverse-fly-machine"
    ],
    "patterns": [
      "horizontal-abduction"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "seated",
      "support": "chest pad"
    },
    "instructions": "Face the machine pad and adjust the handles near shoulder height. Open the arms outward with a small fixed elbow bend, then return without lifting the chest from the pad.",
    "notes": ""
  },
  {
    "number": 75,
    "name": "Bent-over dumbbell reverse fly",
    "aliases": [
      "Bent-over rear delt fly"
    ],
    "family": "reverse-fly",
    "primary": [
      "posterior-deltoid"
    ],
    "secondary": [
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "horizontal-abduction"
    ],
    "type": "isolation",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "hip hinge",
      "support": "none"
    },
    "instructions": "Hinge at the hips with dumbbells beneath the chest. Raise the arms out to the sides with softly bent elbows, then lower without swinging the torso.",
    "notes": ""
  },
  {
    "number": 76,
    "name": "Chest-supported dumbbell reverse fly",
    "aliases": [
      "Incline bench rear delt fly"
    ],
    "family": "reverse-fly",
    "primary": [
      "posterior-deltoid"
    ],
    "secondary": [
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-abduction"
    ],
    "type": "isolation",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "prone",
      "support": "incline chest pad"
    },
    "instructions": "Lie chest down on an incline bench with dumbbells hanging beneath the shoulders. Raise the arms outward with a fixed slight elbow bend, then lower while keeping the chest supported.",
    "notes": ""
  },
  {
    "number": 77,
    "name": "Standing cable reverse fly",
    "aliases": [
      "Cross-cable rear delt fly"
    ],
    "family": "reverse-fly",
    "primary": [
      "posterior-deltoid"
    ],
    "secondary": [
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "cable",
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-abduction"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "standing"
    },
    "instructions": "Set two pulleys near shoulder height and hold the opposite handles with cables crossed. Open both arms outward without leaning back, then return slowly to the crossed starting position.",
    "notes": ""
  },
  {
    "number": 78,
    "name": "Dumbbell lateral raise",
    "aliases": [
      "DB side raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [
      "traps"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "type": "isolation",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "grip": "neutral",
      "stance": "standing"
    },
    "instructions": "Stand with dumbbells beside the thighs and elbows softly bent. Raise the arms out slightly forward of the sides to around shoulder height, then lower without shrugging or swinging.",
    "notes": ""
  },
  {
    "number": 79,
    "name": "Single-arm cable lateral raise",
    "aliases": [
      "One-arm cable side raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [
      "traps"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "type": "isolation",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral",
      "stance": "standing",
      "execution": "single arm"
    },
    "instructions": "Stand side-on to a low pulley and hold the handle in the farther hand. Raise the arm outward to around shoulder height, then lower smoothly. Repeat on the other side.",
    "notes": ""
  },
  {
    "number": 80,
    "name": "Alternating dumbbell front raise",
    "aliases": [
      "Alternating DB anterior raise"
    ],
    "family": "front-raise",
    "primary": [
      "anterior-deltoid"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "type": "isolation",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "grip": "pronated",
      "stance": "standing",
      "execution": "alternating"
    },
    "instructions": "Stand holding dumbbells in front of the thighs. Raise one arm forward to around shoulder height, lower it, then alternate arms without rocking the torso. Count repetitions separately for each side.",
    "notes": ""
  }
]
export const BATCH_ONE_EXERCISES = entries.map(defineBatchOne)
