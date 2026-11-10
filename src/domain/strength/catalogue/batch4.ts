// Batch 4: individually authored entries with explicit permanent reservations. Never renumber.
import { defineBatchFour, type Entry } from './define'
const entries: readonly Entry[] = [
  {
    "number": 1,
    "name": "Leg extension machine",
    "aliases": [
      "Seated knee extension machine"
    ],
    "family": "leg-extension",
    "primary": [
      "quadriceps"
    ],
    "secondary": [],
    "equipment": [
      "leg-extension-machine"
    ],
    "patterns": [
      "knee-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back and shin pads",
      "execution": "bilateral"
    },
    "instructions": "Set the seat so the knees align with the machine pivots and the roller rests above the ankles. Straighten both knees under control, then lower without lifting the hips off the seat.",
    "notes": "Keep the roller clear of the feet and use the displayed stack setting.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 2,
    "name": "Single-leg extension machine",
    "aliases": [
      "Unilateral knee extension machine"
    ],
    "family": "leg-extension",
    "primary": [
      "quadriceps"
    ],
    "secondary": [],
    "equipment": [
      "leg-extension-machine"
    ],
    "patterns": [
      "knee-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "machine back and shin pads",
      "execution": "single leg"
    },
    "instructions": "Adjust the machine for knee-pivot alignment and position one shin behind the roller. Extend that knee without lifting the hip, then lower slowly. Repeat on the other leg.",
    "notes": "Use the same stack setting for each leg and keep the non-working leg clear of the lever.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 3,
    "name": "Seated leg curl machine",
    "aliases": [
      "Seated hamstring curl machine"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "seated-leg-curl-machine"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "thigh and back pads",
      "execution": "bilateral"
    },
    "instructions": "Adjust the seat and pads so the knees align with the pivots and thighs are secured. Bend both knees to draw the roller down and back, then extend slowly without lifting the pelvis.",
    "notes": "Keep the thigh restraint snug without pressing directly on the kneecaps.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 4,
    "name": "Single-leg seated leg curl",
    "aliases": [
      "Unilateral seated hamstring curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "seated-leg-curl-machine"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "thigh and back pads",
      "execution": "single leg"
    },
    "instructions": "Secure the thighs on a seated curl machine and place one lower leg against the working roller. Bend that knee, then return smoothly while keeping the hip supported. Repeat on the other side.",
    "notes": "Keep both thighs controlled and use equal settings when comparing sides.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 5,
    "name": "Lying leg curl machine",
    "aliases": [
      "Prone selectorized hamstring curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "lying-leg-curl-machine"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "prone",
      "support": "machine hip pad",
      "execution": "bilateral"
    },
    "instructions": "Lie face down with knees aligned to the pivots and the roller above the heels. Bend both knees to curl the pad toward the thighs, then lower slowly with the hips against the support.",
    "notes": "Avoid lifting the hips or extending the lower back to move the stack.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 6,
    "name": "Single-leg lying leg curl",
    "aliases": [
      "Unilateral prone hamstring curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "lying-leg-curl-machine"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "prone",
      "support": "machine hip pad",
      "execution": "single leg"
    },
    "instructions": "Lie on a selectorized leg curl machine with one lower leg under the roller. Keep the hips down, bend the working knee, then return under control. Repeat on the other side.",
    "notes": "Keep the unused leg clear of the moving roller and avoid twisting the pelvis.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 7,
    "name": "Standing leg curl machine",
    "aliases": [
      "Standing selectorized hamstring curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "standing-leg-curl-machine"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing single leg",
      "support": "machine thigh support",
      "execution": "single leg"
    },
    "instructions": "Adjust the standing curl machine and place the working ankle behind the roller. Hold the supports, keep the thigh against its pad and bend the knee, then lower smoothly. Repeat on both legs.",
    "notes": "Keep the upper leg still rather than swinging the hip backward.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 8,
    "name": "Plate-loaded lying leg curl",
    "aliases": [
      "Lever prone hamstring curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "plate-loaded-lying-leg-curl-machine"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "prone",
      "support": "machine hip pad",
      "execution": "bilateral"
    },
    "instructions": "Load the machine lever and lie face down with knees aligned to the pivots. Curl the roller toward the thighs, then lower the lever slowly while keeping the pelvis supported.",
    "notes": "Record added plates only, excluding the empty lever; lever ratios differ between models.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 9,
    "name": "Plate-loaded kneeling leg curl",
    "aliases": [
      "Lever kneeling hamstring curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "plate-loaded-kneeling-leg-curl-machine"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "stance": "one knee supported",
      "support": "machine torso and knee pads",
      "execution": "single leg"
    },
    "instructions": "Position one knee on the support and the other lower leg behind the roller. Hold the torso pads or handles, curl the working leg, then lower without moving the hip. Switch sides.",
    "notes": "Set the machine for the working knee pivot and count only plates on the working lever.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 10,
    "name": "Standing cable leg curl",
    "aliases": [
      "Ankle-cuff hamstring curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "cable",
      "ankle-strap",
      "rack"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing low pulley",
      "support": "free hand on rack",
      "execution": "single leg"
    },
    "instructions": "Attach an ankle cuff to a low cable and face the pulley with a hand on a secure support. Keep the thigh still, bend the working knee to lift the heel, then lower slowly. Repeat on both sides.",
    "notes": "Keep the cable clear of the standing leg and avoid pulling through the hip.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 11,
    "name": "Lying cable leg curl",
    "aliases": [
      "Prone ankle-cuff cable curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "calves"
    ],
    "equipment": [
      "cable",
      "ankle-strap",
      "bench"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "prone feet toward low pulley",
      "support": "flat bench",
      "execution": "single leg"
    },
    "instructions": "Place a bench with its foot end toward a low pulley and attach a cuff to one ankle. Lie face down with the knee free to bend, curl the heel toward the thigh, then return slowly. Repeat on both sides.",
    "notes": "Arrange cable clearance before loading and keep the pelvis against the bench.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 12,
    "name": "Seated cable leg extension",
    "aliases": [
      "Ankle-cuff cable knee extension"
    ],
    "family": "leg-extension",
    "primary": [
      "quadriceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "ankle-strap",
      "bench"
    ],
    "patterns": [
      "knee-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated facing away from low pulley",
      "support": "bench",
      "execution": "single leg"
    },
    "instructions": "Sit on a high enough bench facing away from a low pulley with a cuff on one ankle. Keep the thigh still, straighten the working knee, then bend it to return. Repeat on the other side.",
    "notes": "The cable runs behind the working leg; leave clearance for the ankle and full comfortable knee motion.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 13,
    "name": "Standing cable hip extension",
    "aliases": [
      "Standing cable glute kickback"
    ],
    "family": "hip-extension",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings"
    ],
    "equipment": [
      "cable",
      "ankle-strap",
      "rack"
    ],
    "patterns": [
      "hip-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing low pulley",
      "support": "hands on rack",
      "execution": "straight-leg kickback"
    },
    "instructions": "Attach an ankle cuff and face a low pulley with hands on a secure support. Keep the pelvis square and knee softly bent, move the leg backward from the hip, then return. Repeat on both sides.",
    "notes": "Use a modest hip range rather than arching the lower back to raise the leg higher.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 14,
    "name": "Bench-supported cable glute kickback",
    "aliases": [
      "Kneeling cable hip extension"
    ],
    "family": "hip-extension",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings"
    ],
    "equipment": [
      "cable",
      "ankle-strap",
      "bench"
    ],
    "patterns": [
      "hip-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "one knee and hands on bench",
      "support": "bench",
      "execution": "bent-knee kickback"
    },
    "instructions": "Support both hands and one knee on a stable bench facing the low pulley with the other ankle cuffed. Keep a bent working knee and extend that hip backward, then return without twisting. Repeat on both sides.",
    "notes": "Position the bench so the cable clears it, and keep the ribs down throughout.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 15,
    "name": "Glute kickback machine",
    "aliases": [
      "Selectorized hip extension machine"
    ],
    "family": "hip-extension",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings"
    ],
    "equipment": [
      "glute-kickback-machine"
    ],
    "patterns": [
      "hip-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing supported",
      "support": "machine torso pad",
      "execution": "single-leg press back"
    },
    "instructions": "Adjust the torso support and place one foot on the machine pedal. Keep the pelvis square, press the working leg backward through hip extension, then return under control. Repeat on both sides.",
    "notes": "This entry uses a selectorized kickback machine; do not estimate plate load from the stack label.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 16,
    "name": "Hip abduction machine",
    "aliases": [
      "Seated outer-thigh machine"
    ],
    "family": "hip-abduction",
    "primary": [
      "abductors"
    ],
    "secondary": [
      "glutes"
    ],
    "equipment": [
      "hip-abduction-machine"
    ],
    "patterns": [
      "hip-abduction"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "back pad",
      "execution": "bilateral knees outward"
    },
    "instructions": "Sit with the outer thighs against the machine pads and adjust the starting width. Move both thighs outward while staying against the backrest, then return slowly without letting the stack drop.",
    "notes": "Use a controlled hip range rather than bouncing the pads or rocking the torso.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 17,
    "name": "Hip adduction machine",
    "aliases": [
      "Seated inner-thigh machine"
    ],
    "family": "hip-adduction",
    "primary": [
      "adductors"
    ],
    "secondary": [],
    "equipment": [
      "hip-adduction-machine"
    ],
    "patterns": [
      "hip-adduction"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "back pad",
      "execution": "bilateral knees inward"
    },
    "instructions": "Set a comfortable open starting position with the inner thighs against the pads. Bring both thighs inward under control, then reopen slowly while keeping the pelvis supported.",
    "notes": "Do not force a wide starting stretch; keep the same setup when comparing sets.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 18,
    "name": "Standing cable hip abduction",
    "aliases": [
      "Cable outer-thigh raise"
    ],
    "family": "hip-abduction",
    "primary": [
      "abductors"
    ],
    "secondary": [
      "glutes"
    ],
    "equipment": [
      "cable",
      "ankle-strap",
      "rack"
    ],
    "patterns": [
      "hip-abduction"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on",
      "support": "free hand on rack",
      "execution": "leg away from midline"
    },
    "instructions": "Stand side-on to a low pulley with the cuff on the farther ankle and hold a secure support. Move that leg outward without leaning the torso, then return slowly. Repeat on both sides.",
    "notes": "Keep the pelvis level and the toes facing mostly forward rather than turning the movement into a kick.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 19,
    "name": "Standing cable hip adduction",
    "aliases": [
      "Cable inner-thigh pull"
    ],
    "family": "hip-adduction",
    "primary": [
      "adductors"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "ankle-strap",
      "rack"
    ],
    "patterns": [
      "hip-adduction"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on",
      "support": "free hand on rack",
      "execution": "leg toward midline"
    },
    "instructions": "Stand side-on to a low pulley with the cuff on the nearer ankle. Hold a secure support, draw the working leg inward toward the midline, then return under control. Repeat on the other side.",
    "notes": "Keep the cable clear of the standing foot and avoid twisting the hips to move it.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 20,
    "name": "Seated calf raise machine",
    "aliases": [
      "Plate-loaded bent-knee calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "seated-calf-raise-machine"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated knees bent",
      "support": "thigh pads",
      "execution": "bilateral"
    },
    "instructions": "Place the balls of both feet on the machine step with thigh pads secured. Raise the heels to lift the lever, then lower through a comfortable ankle range without bouncing.",
    "notes": "Record added plates only and keep the knees bent; bent-knee and straight-knee calf work remain separate entries.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 21,
    "name": "Standing calf raise machine",
    "aliases": [
      "Selectorized straight-leg calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "standing-calf-raise-machine"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing knees nearly straight",
      "support": "shoulder pads",
      "execution": "bilateral"
    },
    "instructions": "Set the shoulder pads and stand with the balls of the feet on the machine step. Raise both heels without bending the knees to drive the load, then lower smoothly.",
    "notes": "Keep a soft knee position and a controlled ankle range rather than bouncing from the bottom.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 22,
    "name": "Donkey calf raise machine",
    "aliases": [
      "Plate-loaded hip-supported calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "donkey-calf-raise-machine"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "hinged knees nearly straight",
      "support": "pelvic pad and handles",
      "execution": "bilateral"
    },
    "instructions": "Adjust the pelvic pad on a donkey calf machine and place the balls of both feet on the step. With the torso supported and knees nearly straight, raise the heels, then lower under control.",
    "notes": "Use the machine pad as directed and record added plates, excluding its unloaded lever.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 23,
    "name": "45-degree leg press calf raise",
    "aliases": [
      "Incline sled calf press"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "incline-leg-press-machine"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated knees nearly straight",
      "support": "sled back pad",
      "execution": "bilateral ankle press"
    },
    "instructions": "Sit against the leg press pad and position the balls of both feet securely on the plate edge. With knees nearly straight, press through the ankles to raise the sled, then lower the heels slowly.",
    "notes": "Keep enough foot contact to prevent slipping, use the safeties and exclude sled mass from the recorded plates.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 24,
    "name": "Single-leg 45-degree leg press calf raise",
    "aliases": [
      "Unilateral incline sled calf press"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "incline-leg-press-machine"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated one working foot",
      "support": "sled back pad",
      "execution": "single-leg ankle press"
    },
    "instructions": "Set a conservative leg press load and place one forefoot securely on the plate edge. Keep that knee nearly straight, press through the ankle and lower smoothly, then repeat on the other side.",
    "notes": "Use both feet to position and secure the sled as needed. Record the full added plate load, not half.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 25,
    "name": "Smith machine standing calf raise",
    "aliases": [
      "Smith straight-leg calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "smith-machine",
      "calf-block"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "standing knees nearly straight",
      "support": "Smith bar upper back and calf block",
      "execution": "bilateral"
    },
    "instructions": "Set the Smith stops and place the balls of both feet on a stable calf block beneath the bar. Unlock with the bar on the upper back, raise the heels and lower slowly without knee drive.",
    "notes": "Test block placement and rail path unloaded. Re-lock the bar before stepping off.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 26,
    "name": "Smith machine seated calf raise",
    "aliases": [
      "Smith bent-knee calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "smith-machine",
      "bench",
      "calf-block"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "seated knees bent",
      "support": "bench and Smith bar on thighs",
      "execution": "bilateral"
    },
    "instructions": "Sit on a stable bench under the Smith bar with forefeet on a calf block. Position the padded bar across the lower thighs, unlock and lift the heels, then lower smoothly with knees bent.",
    "notes": "Keep the bar clear of the kneecaps, set stops and check the setup unloaded.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "bar-pad"
    ]
  },
  {
    "number": 27,
    "name": "Standing cable calf raise",
    "aliases": [
      "Dual-cable standing calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing on floor",
      "grip": "two handles at sides",
      "execution": "bilateral"
    },
    "instructions": "Stand between two low pulleys holding equal handles beside the thighs with arms long. Raise both heels while keeping the body tall, then lower to the floor slowly without pulling with the arms.",
    "notes": "Use equal stack settings and record one stack; this floor-based version does not require a raised step.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 28,
    "name": "Tibialis raise machine",
    "aliases": [
      "Plate-loaded seated dorsiflexion"
    ],
    "family": "tibialis-raise",
    "primary": [
      "tibialis-anterior"
    ],
    "secondary": [],
    "equipment": [
      "tibialis-raise-machine"
    ],
    "patterns": [
      "dorsiflexion"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated legs forward",
      "support": "machine heel and shin supports",
      "execution": "bilateral toes upward"
    },
    "instructions": "Sit at a plate-loaded tibialis machine and secure the feet under its lifting pad with heels supported. Draw the toes toward the shins to raise the lever, then lower slowly without bending the knees to help.",
    "notes": "Follow the machine foot-retention setup and record added plates only, excluding the lever.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 29,
    "name": "Decline Smith machine bench press",
    "aliases": [
      "Decline Smith chest press"
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
      "decline-bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "decline bench",
      "angle": "decline",
      "grip": "pronated"
    },
    "instructions": "Secure yourself on a decline bench positioned under the Smith bar and set the stops. Unlock, lower toward the lower chest along the rails, then press without lifting off the pad.",
    "notes": "Test bench position unloaded and use a bench designed to secure the legs in decline.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 30,
    "name": "Close-grip Smith machine bench press",
    "aliases": [
      "Narrow-grip Smith press"
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
      "smith-machine",
      "bench"
    ],
    "patterns": [
      "horizontal-push",
      "elbow-extension"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "angle": "flat",
      "grip": "close pronated"
    },
    "instructions": "Place a flat bench under the Smith bar and take a comfortably narrow grip. Set stops, lower with elbows near the torso, then press along the rails while keeping wrists over the forearms.",
    "notes": "A narrow grip does not require touching hands. Check the unloaded path before adding plates.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 31,
    "name": "Smith machine floor press",
    "aliases": [
      "Smith floor chest press"
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
      "smith-machine"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "floor",
      "angle": "flat",
      "grip": "pronated"
    },
    "instructions": "Lie beneath the Smith bar with knees bent and stops set for the floor position. Unlock and lower until the upper arms gently contact the floor, then press without bouncing.",
    "notes": "Confirm you can safely unlock and re-lock from the floor before loading.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 32,
    "name": "Standing Smith machine overhead press",
    "aliases": [
      "Standing Smith shoulder press"
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
      "smith-machine"
    ],
    "patterns": [
      "vertical-push"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "none",
      "angle": "vertical",
      "grip": "pronated",
      "execution": "strict"
    },
    "instructions": "Stand at the Smith bar with a comfortable front-of-body rail path and set stops. Brace, unlock at shoulder height and press overhead without knee drive, then lower under control.",
    "notes": "Adjust foot position to the rail angle and keep the bar in front of the head.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 33,
    "name": "Smith machine shrug",
    "aliases": [
      "Front Smith shoulder shrug"
    ],
    "family": "shrug",
    "primary": [
      "traps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "smith-machine"
    ],
    "patterns": [
      "scapular-movement"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "Smith rails",
      "grip": "pronated in front"
    },
    "instructions": "Hold the Smith bar in front of the thighs with straight arms and stops near the starting height. Unlock, lift the shoulders upward, then lower smoothly without elbow bending.",
    "notes": "Keep the neck neutral and do not roll the shoulders or use leg drive.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 34,
    "name": "Behind-the-back Smith machine shrug",
    "aliases": [
      "Rear Smith shoulder shrug"
    ],
    "family": "shrug",
    "primary": [
      "traps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "smith-machine"
    ],
    "patterns": [
      "scapular-movement"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "Smith rails",
      "grip": "pronated behind hips"
    },
    "instructions": "Stand in front of the Smith bar and grip it behind the hips with arms long. Test a comfortable rail path, unlock and raise the shoulders, then lower without leaning or bending the elbows.",
    "notes": "Use only a comfortable shoulder position; do not force the bar farther behind the torso.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 35,
    "name": "Smith machine deadlift",
    "aliases": [
      "Smith dead-stop deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "hamstrings",
      "quadriceps"
    ],
    "secondary": [
      "lower-back",
      "core",
      "forearms"
    ],
    "equipment": [
      "smith-machine"
    ],
    "patterns": [
      "hinge"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "Smith rails",
      "grip": "pronated",
      "execution": "low-stop reset"
    },
    "instructions": "Set the Smith stops at a reachable low starting height and stand close to the bar. Brace, extend hips and knees to stand along the rails, then lower to the stops and reset.",
    "notes": "Note starting height and machine used. This resets low each rep, unlike the existing top-start Smith RDL.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 36,
    "name": "Smith machine good morning",
    "aliases": [
      "Smith hip-hinge good morning"
    ],
    "family": "good-morning",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core"
    ],
    "equipment": [
      "smith-machine"
    ],
    "patterns": [
      "hinge"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "Smith bar upper back",
      "execution": "hip hinge"
    },
    "instructions": "Set the Smith bar across the upper back and stops within a conservative hinge range. Soften the knees, unlock and send the hips back as the torso inclines, then stand without arching backward.",
    "notes": "Test the rail path unloaded and keep the range short enough to stay braced.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 37,
    "name": "Smith machine reverse lunge",
    "aliases": [
      "Smith backward lunge"
    ],
    "family": "lunge",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors",
      "core"
    ],
    "equipment": [
      "smith-machine"
    ],
    "patterns": [
      "lunge-step"
    ],
    "load": "smith",
    "repetitions": "per-side",
    "variant": {
      "stance": "backward step",
      "support": "Smith bar upper back",
      "execution": "return to start"
    },
    "instructions": "Position the Smith bar across the upper back with stops set. Step one foot backward, lower through both knees along the rails, then stand through the front foot and return to the start. Repeat on both sides.",
    "notes": "Allow room behind the machine and test foot placement unloaded; this is a stepping lunge, not a stationary split squat.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 38,
    "name": "Heels-elevated Smith machine squat",
    "aliases": [
      "Smith cyclist squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "core"
    ],
    "equipment": [
      "smith-machine",
      "heel-wedge"
    ],
    "patterns": [
      "squat"
    ],
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "narrow heels elevated",
      "support": "Smith bar upper back",
      "execution": "controlled squat"
    },
    "instructions": "Set a stable heel wedge beneath the Smith bar and test a comfortably narrow stance. With the bar across the upper back, unlock, squat through a controlled depth, then stand without shifting off the wedge.",
    "notes": "Keep wedge height and foot position consistent, and set stops before loading.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 39,
    "name": "Single-leg Smith machine Romanian deadlift",
    "aliases": [
      "Single-leg Smith RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "abductors",
      "core"
    ],
    "equipment": [
      "smith-machine"
    ],
    "patterns": [
      "hinge",
      "lateral-stability"
    ],
    "load": "smith",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg",
      "support": "Smith rails",
      "grip": "pronated",
      "execution": "Romanian top start"
    },
    "instructions": "Start standing with the Smith bar held at the thighs. Shift onto one leg, soften its knee and hinge as the free leg moves behind, then stand without rotating the pelvis. Repeat on both sides.",
    "notes": "Use stops and a light load; leave clearance for the free leg and keep the bar close along the rail path.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 40,
    "name": "Single-leg Smith machine calf raise",
    "aliases": [
      "Unilateral Smith standing calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "smith-machine",
      "calf-block"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "smith",
    "repetitions": "per-side",
    "variant": {
      "stance": "one working forefoot elevated",
      "support": "Smith bar upper back and calf block",
      "execution": "single leg"
    },
    "instructions": "Set stops and stand under the Smith bar with one forefoot on a stable calf block. Keep the working knee nearly straight, lift and lower that heel under control, then switch legs safely.",
    "notes": "Use both feet to position or re-lock the bar as needed. Keep full forefoot contact and test the setup unloaded.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 41,
    "name": "Incline chest press machine",
    "aliases": [
      "Selectorized incline press"
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
      "incline-chest-press-machine"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "angle": "incline",
      "grip": "machine handles"
    },
    "instructions": "Adjust the seat so the incline press handles start near the upper chest. Keep the torso supported, press along the machine path, then return slowly without letting the stack drop.",
    "notes": "Use consistent seat and handle settings; this entry uses a selectorized stack, not plate-loaded levers.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 42,
    "name": "Decline chest press machine",
    "aliases": [
      "Selectorized decline press"
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
      "decline-chest-press-machine"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "angle": "decline",
      "grip": "machine handles"
    },
    "instructions": "Adjust a selectorized decline press so the handles align with the lower chest. Keep the back on the pad, press along the downward-forward path, then return without bouncing the stack.",
    "notes": "Follow the machine setup markings and use the same handle choice for comparisons.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 43,
    "name": "Plate-loaded shoulder press machine",
    "aliases": [
      "Lever overhead press machine"
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
      "plate-loaded-shoulder-press-machine"
    ],
    "patterns": [
      "vertical-push"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "angle": "vertical",
      "grip": "machine handles",
      "execution": "bilateral"
    },
    "instructions": "Set the seat and load both working levers evenly. With the back against the pad, press both handles overhead, then lower smoothly without lifting the hips.",
    "notes": "Record the combined added plates on both working arms, excluding unloaded lever resistance.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 44,
    "name": "Single-arm plate-loaded shoulder press",
    "aliases": [
      "Unilateral lever overhead press"
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
      "plate-loaded-shoulder-press-machine"
    ],
    "patterns": [
      "vertical-push"
    ],
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "angle": "vertical",
      "grip": "machine handle",
      "execution": "single arm"
    },
    "instructions": "Use a plate-loaded shoulder machine with independent arms and adjust the seat. Press one handle overhead while keeping the torso supported, lower under control, then repeat with the other arm.",
    "notes": "Record plates on the working arm only, not plates sitting on an unused independent lever.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 45,
    "name": "Single-arm plate-loaded chest press",
    "aliases": [
      "Unilateral lever chest press"
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
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "angle": "horizontal",
      "grip": "machine handle",
      "execution": "single arm"
    },
    "instructions": "Adjust a chest press with independent plate-loaded arms. Keep the back against the pad, press one handle forward without rotating the torso, then return and repeat on the other side.",
    "notes": "Record added plates on the working arm only. Keep the seat and grip consistent.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 46,
    "name": "Single-arm plate-loaded incline chest press",
    "aliases": [
      "Unilateral incline lever press"
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
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "angle": "incline",
      "grip": "machine handle",
      "execution": "single arm"
    },
    "instructions": "Set the seat on an incline press with independent levers. Press one handle along its incline path with the torso supported, then lower slowly without twisting. Repeat on the other side.",
    "notes": "Record the working arm plates only, excluding the unloaded lever and unused-arm plates.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 47,
    "name": "Plate-loaded high row machine",
    "aliases": [
      "Lever high row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "traps"
    ],
    "equipment": [
      "plate-loaded-high-row-machine"
    ],
    "patterns": [
      "horizontal-pull",
      "vertical-pull"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "chest pad",
      "grip": "machine handles",
      "angle": "high to low",
      "execution": "bilateral"
    },
    "instructions": "Adjust the chest pad and seat on a high-row machine and load both arms evenly. Pull the high handles diagonally down toward the ribs, then extend smoothly while keeping the chest supported.",
    "notes": "The diagonal row path differs from a vertical pulldown. Record all added plates on both working levers.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 48,
    "name": "Single-arm plate-loaded high row",
    "aliases": [
      "Unilateral lever high row"
    ],
    "family": "horizontal-row",
    "primary": [
      "lats",
      "rhomboids"
    ],
    "secondary": [
      "biceps",
      "posterior-deltoid",
      "traps"
    ],
    "equipment": [
      "plate-loaded-high-row-machine"
    ],
    "patterns": [
      "horizontal-pull",
      "vertical-pull"
    ],
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "chest pad",
      "grip": "machine handle",
      "angle": "high to low",
      "execution": "single arm"
    },
    "instructions": "Set a high-row machine with independent arms and keep the chest against its pad. Pull one high handle diagonally toward the working ribs, then extend slowly. Repeat on the other side.",
    "notes": "Record plates on the working lever only and avoid rotating off the chest pad.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 49,
    "name": "Wide neutral-grip seated cable row",
    "aliases": [
      "Wide parallel-grip cable row"
    ],
    "family": "horizontal-row",
    "primary": [
      "rhomboids",
      "traps"
    ],
    "secondary": [
      "lats",
      "biceps",
      "posterior-deltoid"
    ],
    "equipment": [
      "cable",
      "cable-row-station",
      "wide-neutral-row-handle"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "none",
      "grip": "wide neutral",
      "execution": "elbows out"
    },
    "instructions": "Sit at a cable row station holding a wide neutral-grip attachment. Pull toward the upper abdomen with elbows out, then extend under control without rocking the torso.",
    "notes": "Use the wide parallel handle consistently; this differs from the close neutral and wide pronated rows already in the library.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 50,
    "name": "Wide-grip chest-supported row machine",
    "aliases": [
      "Wide-handle selectorized row"
    ],
    "family": "horizontal-row",
    "primary": [
      "rhomboids",
      "posterior-deltoid"
    ],
    "secondary": [
      "traps",
      "lats",
      "biceps"
    ],
    "equipment": [
      "seated-row-machine"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "chest pad",
      "grip": "wide pronated",
      "execution": "elbows out"
    },
    "instructions": "Adjust the supported row machine and choose its wide overhand handles. Keep the chest against the pad, pull with elbows out toward the upper ribs, then return slowly.",
    "notes": "Use a machine with the stated wide handle option and retain that setting for comparable records.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 51,
    "name": "Pullover machine",
    "aliases": [
      "Selectorized pullover"
    ],
    "family": "pullover",
    "primary": [
      "lats"
    ],
    "secondary": [
      "triceps",
      "chest"
    ],
    "equipment": [
      "pullover-machine"
    ],
    "patterns": [
      "shoulder-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back and arm pads",
      "grip": "machine handles"
    },
    "instructions": "Adjust the pullover seat and arm pads, using its entry lever if provided. With the torso supported and elbows at a consistent bend, sweep the arms downward, then return under control.",
    "notes": "Follow the machine entry and exit procedure; keep the movement at the shoulders rather than turning it into an elbow extension.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 52,
    "name": "Plate-loaded seated dip press",
    "aliases": [
      "Lever seated triceps press"
    ],
    "family": "dip",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "chest",
      "anterior-deltoid"
    ],
    "equipment": [
      "plate-loaded-dip-press-machine"
    ],
    "patterns": [
      "vertical-push",
      "elbow-extension"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "grip": "handles beside hips",
      "execution": "seated press-down"
    },
    "instructions": "Adjust a plate-loaded seated dip machine and load its working levers evenly. Keep the torso supported, press both handles down by extending the elbows, then return smoothly.",
    "notes": "This is a seated external-load press, not a bodyweight or assisted suspended dip. Count all working-arm plates.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 53,
    "name": "Seated dip press machine",
    "aliases": [
      "Selectorized seated triceps press"
    ],
    "family": "dip",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "chest",
      "anterior-deltoid"
    ],
    "equipment": [
      "dip-press-machine"
    ],
    "patterns": [
      "vertical-push",
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back pad",
      "grip": "handles beside hips",
      "execution": "seated press-down"
    },
    "instructions": "Set the seat and starting handles on a selectorized seated dip machine. Press both handles down with the torso supported, then bend the elbows to return without letting the stack slam.",
    "notes": "The displayed setting is external resistance, not assistance; it should not use the assisted-dip tracking mode.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 54,
    "name": "Plate-loaded preacher curl machine",
    "aliases": [
      "Lever preacher curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "plate-loaded-preacher-curl-machine"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine preacher pad",
      "grip": "machine handles",
      "execution": "bilateral"
    },
    "instructions": "Adjust a plate-loaded preacher curl machine so the elbows align with its pivots. Keep both upper arms supported, curl the handles, then lower the lever smoothly without dropping into elbow lockout.",
    "notes": "Record all added plates on the working lever or levers, excluding the unloaded mechanism.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 55,
    "name": "Underhand plate-loaded lat pulldown",
    "aliases": [
      "Reverse-grip lever pulldown"
    ],
    "family": "pulldown",
    "primary": [
      "lats",
      "biceps"
    ],
    "secondary": [
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "plate-loaded-pulldown-machine"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "thigh restraint",
      "grip": "supinated",
      "execution": "bilateral"
    },
    "instructions": "Choose a plate-loaded pulldown with underhand handles and secure the thighs. Pull both handles toward the upper chest, then return overhead without lifting from the seat.",
    "notes": "Use equal arm loading and record all working plates. Keep the selected grip consistent.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 56,
    "name": "Single-arm plate-loaded lat pulldown",
    "aliases": [
      "Unilateral lever pulldown"
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
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "thigh restraint",
      "grip": "neutral",
      "execution": "single arm"
    },
    "instructions": "Use a plate-loaded pulldown with independent arms and secure the thighs. Pull one neutral handle toward the working shoulder, then extend overhead without leaning sideways. Repeat on the other side.",
    "notes": "Record plates on the working arm only, not both independent levers.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 57,
    "name": "Single-arm standing cable chest fly",
    "aliases": [
      "One-arm mid-height cable fly"
    ],
    "family": "chest-fly",
    "primary": [
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "horizontal-adduction",
      "anti-rotation"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "split stance",
      "support": "none",
      "angle": "mid-height",
      "execution": "single arm"
    },
    "instructions": "Stand side-on to a chest-height pulley holding one handle with a soft elbow bend. Sweep that arm across in front of the chest, then reopen slowly without turning the torso. Repeat on both sides.",
    "notes": "Keep the elbow angle nearly fixed rather than pressing the handle.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 58,
    "name": "Flat-bench cable chest fly",
    "aliases": [
      "Supine cable pec fly"
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
      "cable-handle",
      "bench"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "angle": "flat",
      "grip": "neutral"
    },
    "instructions": "Place a flat bench between two low pulleys and lie with one handle in each hand. Keep a small fixed elbow bend, bring the handles together above the chest, then open to a controlled depth.",
    "notes": "Use equal stack settings and arrange a safe way to take and release the handles.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 59,
    "name": "Incline-bench cable chest fly",
    "aliases": [
      "Incline cable pec fly"
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
      "cable-handle",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "supine reclined",
      "support": "incline bench",
      "angle": "low incline",
      "grip": "neutral"
    },
    "instructions": "Place a low-incline bench between two low pulleys. With the back supported and elbows softly bent, sweep both handles together above the upper chest, then reopen without lifting from the pad.",
    "notes": "Keep bench angle and stack settings consistent; record one equally loaded stack.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 60,
    "name": "Seated cable chest fly",
    "aliases": [
      "Back-supported cable pec fly"
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
      "cable-handle",
      "adjustable-bench"
    ],
    "patterns": [
      "horizontal-adduction"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "upright back pad",
      "angle": "horizontal",
      "grip": "neutral"
    },
    "instructions": "Sit against an upright bench between pulleys set near chest height. With elbows slightly bent, bring both handles forward together, then reopen while keeping the back on the pad.",
    "notes": "Position the bench and handles before loading; avoid a deep forced shoulder stretch.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 61,
    "name": "Single-arm cable reverse fly",
    "aliases": [
      "One-arm cable rear delt fly"
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
      "cable-handle"
    ],
    "patterns": [
      "horizontal-abduction"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on",
      "support": "none",
      "grip": "neutral",
      "execution": "single arm across body"
    },
    "instructions": "Stand side-on to a shoulder-height pulley holding the handle in the farther hand across the body. Open that arm out to the side with a small fixed elbow bend, then return slowly. Repeat on both sides.",
    "notes": "Keep the torso still and avoid pulling the elbow back into a row.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 62,
    "name": "Bent-over cable reverse fly",
    "aliases": [
      "Low-cable bent-over rear delt fly"
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
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "hip hinge",
      "support": "none",
      "grip": "neutral",
      "execution": "two crossed low cables"
    },
    "instructions": "Hinge between two low pulleys holding opposite handles with cables crossed. Brace the torso, raise both arms out to the sides with softly bent elbows, then lower without changing the hinge angle.",
    "notes": "Use equal stacks and keep the movement in the arms rather than standing up to lift the load.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 63,
    "name": "Cable upright row",
    "aliases": [
      "Straight-bar cable high pull row"
    ],
    "family": "upright-row",
    "primary": [
      "lateral-deltoid",
      "traps"
    ],
    "secondary": [
      "biceps"
    ],
    "equipment": [
      "cable",
      "cable-bar"
    ],
    "patterns": [
      "shoulder-raise",
      "scapular-movement"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing low pulley",
      "grip": "pronated bar",
      "execution": "elbows lift outward"
    },
    "instructions": "Stand facing a low pulley holding a bar in front of the thighs. Draw the elbows outward and upward through a comfortable range, then lower without leaning back or jerking the stack.",
    "notes": "Keep the grip comfortably spaced and stop before shoulder discomfort; elbows do not need to rise above shoulder height.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 64,
    "name": "Rope cable upright row",
    "aliases": [
      "Rope high-elbow row"
    ],
    "family": "upright-row",
    "primary": [
      "lateral-deltoid",
      "traps"
    ],
    "secondary": [
      "biceps"
    ],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "shoulder-raise",
      "scapular-movement"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing low pulley",
      "grip": "neutral rope",
      "execution": "elbows lift outward"
    },
    "instructions": "Hold a low-pulley rope with arms long in front of the thighs. Lift the elbows outward as the hands travel upward, then lower smoothly while keeping the torso still.",
    "notes": "Let the rope ends separate naturally and use only a comfortable shoulder range.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 65,
    "name": "Cable shrug",
    "aliases": [
      "Low-pulley bar shrug"
    ],
    "family": "shrug",
    "primary": [
      "traps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "cable",
      "cable-bar"
    ],
    "patterns": [
      "scapular-movement"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing low pulley",
      "grip": "pronated in front"
    },
    "instructions": "Stand facing a low pulley holding its bar in front of the thighs with straight arms. Raise the shoulders upward, pause briefly, then lower without bending the elbows or rocking backward.",
    "notes": "Keep the neck neutral and avoid rolling the shoulders in circles.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 66,
    "name": "Behind-the-body cable shrug",
    "aliases": [
      "Rear low-cable shrug"
    ],
    "family": "shrug",
    "primary": [
      "traps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "cable",
      "cable-bar"
    ],
    "patterns": [
      "scapular-movement"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing away from low pulley",
      "grip": "pronated behind hips"
    },
    "instructions": "Face away from a low pulley holding its bar behind the hips with arms long. Lift the shoulders upward through a comfortable range, then lower without arching the back or bending the elbows.",
    "notes": "Keep the cable and bar clear of the legs; do not force the shoulders into a deep rearward position.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 67,
    "name": "Cable preacher curl",
    "aliases": [
      "Low-cable preacher bar curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "cable",
      "cable-bar",
      "preacher-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated facing low pulley",
      "support": "preacher pad",
      "grip": "supinated bar",
      "execution": "bilateral"
    },
    "instructions": "Place a preacher bench facing a low pulley and support both upper arms on the pad. Curl the cable bar without lifting the elbows, then lower smoothly through a comfortable extension.",
    "notes": "Set the bench distance to keep cable tension and leave clearance for the bar.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 68,
    "name": "Single-arm cable preacher curl",
    "aliases": [
      "Unilateral low-cable preacher curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "cable",
      "cable-handle",
      "preacher-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated facing low pulley",
      "support": "preacher pad",
      "grip": "supinated handle",
      "execution": "single arm"
    },
    "instructions": "Support one upper arm on a preacher pad facing a low pulley. Curl the handle with the shoulder supported, then lower without dropping into elbow lockout. Repeat on the other side.",
    "notes": "Keep the elbow on the pad and use the same stack setting for both arms.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 69,
    "name": "Seated overhead cable-bar triceps extension",
    "aliases": [
      "Seated high-arm cable bar extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-bar",
      "adjustable-bench"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated facing away from low pulley",
      "support": "upright bench",
      "grip": "pronated bar",
      "execution": "overhead bilateral"
    },
    "instructions": "Sit against an upright bench with a low cable behind you and hold its bar behind the head. Keep the upper arms raised, extend both elbows, then bend them slowly without lifting off the backrest.",
    "notes": "Arrange a controlled setup and release of the bar; keep the cable clear of the bench.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 70,
    "name": "Cable external rotation at shoulder height",
    "aliases": [
      "Cable external rotation at 90-degree abduction"
    ],
    "family": "shoulder-external-rotation",
    "primary": [
      "rotator-cuff"
    ],
    "secondary": [
      "posterior-deltoid"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "shoulder-rotation"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing pulley",
      "support": "upper arm raised",
      "execution": "outward rotation elbow at shoulder height"
    },
    "instructions": "Set a pulley near shoulder height and hold one handle with the upper arm raised to a comfortable side position and elbow bent. Rotate the forearm upward, then return without moving the elbow. Repeat on both sides.",
    "notes": "Use a light setting and do not force a full right-angle arm position if it is uncomfortable.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 71,
    "name": "Cable internal rotation at shoulder height",
    "aliases": [
      "Cable internal rotation at 90-degree abduction"
    ],
    "family": "shoulder-internal-rotation",
    "primary": [
      "rotator-cuff"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "shoulder-rotation"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing away from pulley",
      "support": "upper arm raised",
      "execution": "inward rotation elbow at shoulder height"
    },
    "instructions": "Set the pulley behind the working shoulder and raise the upper arm comfortably to the side with elbow bent. Rotate the forearm forward and downward through a controlled arc, then return. Repeat on both sides.",
    "notes": "Keep the elbow position still, use a light setting and avoid forcing shoulder rotation.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 72,
    "name": "Single-arm cable scaption",
    "aliases": [
      "Cable scapular-plane raise"
    ],
    "family": "scaption",
    "primary": [
      "anterior-deltoid",
      "lateral-deltoid"
    ],
    "secondary": [
      "rotator-cuff",
      "traps"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "thumb up",
      "angle": "scapular plane",
      "execution": "single-arm diagonal forward raise"
    },
    "instructions": "Hold a low-cable handle with the thumb facing up. Raise the arm in a plane slightly forward of the side, then lower without shrugging or leaning the torso. Repeat on the other side.",
    "notes": "Keep the path about a third of the way between a side raise and front raise, within a comfortable shoulder range.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 73,
    "name": "Kneeling cable crunch",
    "aliases": [
      "Rope kneeling abdominal crunch"
    ],
    "family": "crunch",
    "primary": [
      "rectus-abdominis"
    ],
    "secondary": [
      "obliques"
    ],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "trunk-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "kneeling facing high pulley",
      "grip": "rope beside head",
      "execution": "spinal flexion"
    },
    "instructions": "Kneel facing a high pulley with the rope held beside the head. Bring the ribs toward the pelvis by curling the trunk, then uncurl slowly while keeping the hips mostly in place.",
    "notes": "Move through the trunk rather than pulling with the arms or sitting the hips backward.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 74,
    "name": "Standing cable crunch",
    "aliases": [
      "Standing rope abdominal crunch"
    ],
    "family": "crunch",
    "primary": [
      "rectus-abdominis"
    ],
    "secondary": [
      "obliques"
    ],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "trunk-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing away from high pulley",
      "grip": "rope beside head",
      "execution": "spinal flexion"
    },
    "instructions": "Face away from a high pulley with the rope beside the head and knees softly bent. Curl the ribs toward the pelvis, then return slowly without leaning backward or turning the movement into a hip hinge.",
    "notes": "Keep the hands in place and choose a load that does not pull you off balance.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 75,
    "name": "Abdominal crunch machine",
    "aliases": [
      "Selectorized seated ab crunch"
    ],
    "family": "crunch",
    "primary": [
      "rectus-abdominis"
    ],
    "secondary": [
      "obliques"
    ],
    "equipment": [
      "abdominal-crunch-machine"
    ],
    "patterns": [
      "trunk-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine back and torso pads",
      "execution": "machine-guided trunk flexion"
    },
    "instructions": "Adjust the seat and torso pads on an abdominal crunch machine. Curl the trunk against the resistance with the pelvis supported, then return slowly without jerking through the handles.",
    "notes": "Follow the model-specific pivot and pad setup; use the displayed stack setting.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 76,
    "name": "Torso rotation machine",
    "aliases": [
      "Selectorized rotary torso"
    ],
    "family": "torso-rotation",
    "primary": [
      "obliques"
    ],
    "secondary": [
      "rectus-abdominis"
    ],
    "equipment": [
      "torso-rotation-machine"
    ],
    "patterns": [
      "trunk-rotation"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "machine pelvis and torso pads",
      "execution": "rotation one direction"
    },
    "instructions": "Adjust the torso rotation machine and secure the pelvis as directed. Rotate through a controlled trunk range against the resistance, then return slowly. Set the opposite starting direction to train the other side.",
    "notes": "Record reps per rotation direction and keep the chosen range consistent; do not bounce against the stops.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 77,
    "name": "Cable Pallof press",
    "aliases": [
      "Standing cable anti-rotation press"
    ],
    "family": "pallof",
    "primary": [
      "obliques"
    ],
    "secondary": [
      "rectus-abdominis",
      "shoulders"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "anti-rotation"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on",
      "grip": "both hands at chest",
      "execution": "press out and return"
    },
    "instructions": "Stand side-on to a chest-height pulley holding its handle at the sternum with both hands. Brace and press straight forward without rotating, then return to the chest. Turn around to train the other direction.",
    "notes": "One press and return is one rep per cable direction. Keep the feet still; the aim is resisting rotation.",
    "type": "stability",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 78,
    "name": "Cable Pallof hold",
    "aliases": [
      "Standing cable anti-rotation hold"
    ],
    "family": "pallof",
    "primary": [
      "obliques"
    ],
    "secondary": [
      "rectus-abdominis",
      "shoulders"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "anti-rotation"
    ],
    "load": "stack",
    "repetitions": "unspecified",
    "variant": {
      "stance": "standing side-on",
      "grip": "both hands extended",
      "execution": "timed anti-rotation hold"
    },
    "instructions": "Stand side-on to a chest-height pulley and press the handle forward with both hands. Hold the arms extended and torso facing ahead for the planned time, then return slowly. Repeat facing the other way.",
    "notes": "Duration is per cable direction. Use separate sets with direction notes if hold times differ; record the displayed stack setting.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 79,
    "name": "High-to-low cable wood chop",
    "aliases": [
      "Downward cable woodchop"
    ],
    "family": "wood-chop",
    "primary": [
      "obliques"
    ],
    "secondary": [
      "rectus-abdominis",
      "glutes",
      "shoulders"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "trunk-rotation"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on",
      "grip": "both hands",
      "angle": "high to low",
      "execution": "controlled diagonal rotation"
    },
    "instructions": "Stand side-on to a high pulley and hold the handle with both hands. Turn through the hips and trunk to draw it diagonally toward the opposite hip, then reverse slowly. Repeat on the other side.",
    "notes": "Allow the feet to pivot rather than twisting through planted knees; count one diagonal pull and return as one rep.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 80,
    "name": "Low-to-high cable wood chop",
    "aliases": [
      "Upward cable woodchop",
      "Cable lift"
    ],
    "family": "wood-chop",
    "primary": [
      "obliques"
    ],
    "secondary": [
      "rectus-abdominis",
      "glutes",
      "shoulders"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "trunk-rotation"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on",
      "grip": "both hands",
      "angle": "low to high",
      "execution": "controlled diagonal rotation"
    },
    "instructions": "Stand side-on to a low pulley holding the handle with both hands. Turn through the hips and trunk as the hands travel diagonally upward across the body, then return slowly. Repeat on both sides.",
    "notes": "Allow a controlled foot pivot and avoid throwing the handle upward or arching the lower back.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  }
]
export const BATCH_FOUR_EXERCISES = entries.map(defineBatchFour)
