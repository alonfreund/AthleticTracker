// Combined 100-entry scope for Batches 5–8. Explicit permanent reservations; never renumber.
import { defineCombinedBatches, type Entry } from './define'
const entries: readonly Entry[] = [
  {
    "number": 1,
    "name": "Incline push-up",
    "aliases": [
      "Hands-elevated push-up"
    ],
    "family": "push-up",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "bench"
    ],
    "patterns": [
      "horizontal-push",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank",
      "support": "hands on bench",
      "angle": "incline"
    },
    "instructions": "Place the hands on a secure bench and walk the feet back into a straight body position. Bend the elbows to lower the chest toward the bench, then press up without letting the hips sag.",
    "notes": "Record bench height in notes; changing elevation changes difficulty without changing bodyweight.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 2,
    "name": "Knee push-up",
    "aliases": [
      "Modified knee-supported push-up"
    ],
    "family": "push-up",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "horizontal-push",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "kneeling plank",
      "support": "hands and knees"
    },
    "instructions": "Support yourself on hands and knees with a straight line from knees through hips to shoulders. Bend the elbows to lower the chest, then press back while keeping that alignment.",
    "notes": "Keep the hips moving with the torso rather than folding at the waist.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 3,
    "name": "Decline push-up",
    "aliases": [
      "Feet-elevated push-up"
    ],
    "family": "push-up",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "bench"
    ],
    "patterns": [
      "horizontal-push",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank",
      "support": "feet on bench",
      "angle": "decline"
    },
    "instructions": "Place the feet on a stable bench and hands on the floor. Keep the trunk braced, lower the chest by bending the elbows, then press up without letting the lower back arch.",
    "notes": "Keep foot elevation consistent and leave room for the head to clear the floor.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 4,
    "name": "Pike push-up",
    "aliases": [
      "Bodyweight pike press"
    ],
    "family": "push-up",
    "primary": [
      "anterior-deltoid",
      "triceps"
    ],
    "secondary": [
      "lateral-deltoid",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "vertical-push"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "hips high inverted V",
      "support": "hands and feet"
    },
    "instructions": "Start with hands and feet on the floor and hips raised. Bend the elbows to lower the head between and slightly ahead of the hands, then press back while keeping the hips high.",
    "notes": "Use a controlled range and avoid resting bodyweight on the head.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 5,
    "name": "Feet-elevated pike push-up",
    "aliases": [
      "Box pike press"
    ],
    "family": "push-up",
    "primary": [
      "anterior-deltoid",
      "triceps"
    ],
    "secondary": [
      "lateral-deltoid",
      "core"
    ],
    "equipment": [
      "platform"
    ],
    "patterns": [
      "vertical-push"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "hips high",
      "support": "hands on floor feet on platform"
    },
    "instructions": "Set the feet on a stable platform and walk the hands into a pike position. Lower the head under control between the hands, then press up without collapsing through the shoulders.",
    "notes": "Note platform height and keep the head clear of the floor.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 6,
    "name": "Archer push-up",
    "aliases": [
      "Side-shifting archer push-up"
    ],
    "family": "push-up",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "horizontal-push",
      "anti-rotation"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "wide-hand plank",
      "support": "hands and toes",
      "execution": "one elbow bends other arm long"
    },
    "instructions": "Set a wide hand position in a firm plank. Lower the chest toward one hand as that elbow bends and the opposite arm stays relatively long, then press back to centre. Repeat to the other side.",
    "notes": "Count reps per working side and use only a width that stays controlled.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 7,
    "name": "Scapular push-up",
    "aliases": [
      "Straight-arm scapular push-up"
    ],
    "family": "push-up",
    "primary": [
      "serratus-anterior"
    ],
    "secondary": [
      "core",
      "rotator-cuff"
    ],
    "equipment": [],
    "patterns": [
      "scapular-movement",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank",
      "support": "hands and toes",
      "execution": "straight elbows shoulder-blade glide"
    },
    "instructions": "Hold a plank with elbows straight. Let the chest sink slightly as the shoulder blades come closer, then push the floor away to spread them without bending the elbows.",
    "notes": "Keep the trunk still; this is shoulder-blade movement rather than a full push-up.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 8,
    "name": "Ring push-up",
    "aliases": [
      "Gymnastic-ring press-up"
    ],
    "family": "push-up",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "rings"
    ],
    "patterns": [
      "horizontal-push",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank",
      "support": "hands in low rings"
    },
    "instructions": "Set secure rings low and take a firm plank with feet on the floor. Lower the chest between the hands with the rings controlled, then press back without letting them drift apart.",
    "notes": "Note ring height and body angle; greater instability is not measured as extra weight.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 9,
    "name": "Ring row",
    "aliases": [
      "Gymnastic-ring inverted row"
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
      "rings"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "heels on floor body inclined",
      "support": "hands in rings",
      "grip": "rotating to neutral"
    },
    "instructions": "Hold secure rings and lean back with the body straight and heels grounded. Pull the chest toward the rings, then extend the arms under control without dropping the hips.",
    "notes": "Note ring height and foot position for comparisons.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 10,
    "name": "Ring dip",
    "aliases": [
      "Gymnastic-ring bodyweight dip"
    ],
    "family": "dip",
    "primary": [
      "triceps",
      "chest"
    ],
    "secondary": [
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "rings"
    ],
    "patterns": [
      "vertical-push",
      "elbow-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "suspended",
      "support": "rings",
      "execution": "controlled dip"
    },
    "instructions": "Support yourself above secure rings with arms straight and rings close. Bend the elbows to lower through a controlled shoulder range, then press up while keeping the rings steady.",
    "notes": "Use only a range you can stabilise; avoid bouncing into the bottom.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 11,
    "name": "Ring chin-up",
    "aliases": [
      "Supinating ring pull-up"
    ],
    "family": "pull-up",
    "primary": [
      "lats",
      "biceps"
    ],
    "secondary": [
      "rhomboids",
      "traps"
    ],
    "equipment": [
      "rings"
    ],
    "patterns": [
      "vertical-pull"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "hanging",
      "support": "rings",
      "grip": "rotating toward supinated"
    },
    "instructions": "Hang from secure rings and let the hands rotate naturally toward palms facing you. Pull the chest upward without kicking, then lower to a comfortable arm extension.",
    "notes": "Keep ring spacing and starting position consistent; do not force wrist rotation.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 12,
    "name": "Ring support hold",
    "aliases": [
      "Straight-arm ring support"
    ],
    "family": "support-hold",
    "primary": [
      "triceps",
      "shoulders"
    ],
    "secondary": [
      "chest",
      "core"
    ],
    "equipment": [
      "rings"
    ],
    "patterns": [
      "vertical-push"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "suspended above rings",
      "support": "straight arms in rings",
      "execution": "timed support"
    },
    "instructions": "Set secure rings so you can enter support safely. Hold the body above them with elbows straight and rings close to the hips, then step down under control when the hold ends.",
    "notes": "Record seconds with a controlled shoulder position; do not count shaking as repetitions.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 13,
    "name": "Ring fallout",
    "aliases": [
      "Standing ring rollout"
    ],
    "family": "fallout",
    "primary": [
      "rectus-abdominis",
      "obliques"
    ],
    "secondary": [
      "lats",
      "shoulders"
    ],
    "equipment": [
      "rings"
    ],
    "patterns": [
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing lean forward",
      "support": "hands in rings",
      "execution": "arms reach overhead"
    },
    "instructions": "Stand holding rings in front with the trunk braced. Let the arms reach forward as the body leans as one unit, then pull back to standing without arching the lower back.",
    "notes": "Keep ring height and foot placement consistent and limit the reach to a controlled range.",
    "type": "stability",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 14,
    "name": "Ring biceps curl",
    "aliases": [
      "Bodyweight ring curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms",
      "core"
    ],
    "equipment": [
      "rings"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing leaned back",
      "support": "hands in rings",
      "grip": "supinated"
    },
    "instructions": "Lean back holding secure rings with palms up and upper arms raised in front. Bend the elbows to bring the hands toward the head, then extend slowly while keeping the body aligned.",
    "notes": "Keep upper arms still rather than rowing the elbows behind the torso.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 15,
    "name": "Ring triceps extension",
    "aliases": [
      "Bodyweight ring elbow extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "core"
    ],
    "equipment": [
      "rings"
    ],
    "patterns": [
      "elbow-extension",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing leaned forward",
      "support": "hands in rings",
      "execution": "forehead toward hands"
    },
    "instructions": "Lean forward holding rings with arms extended in front. Bend the elbows to bring the head toward the hands, then straighten them without letting the trunk fold or the shoulders swing.",
    "notes": "Adjust foot position to a controllable body angle and keep the rings secure.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 16,
    "name": "Suspension trainer row",
    "aliases": [
      "TRX row"
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
      "suspension-trainer"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing leaned back",
      "support": "suspension handles",
      "grip": "neutral"
    },
    "instructions": "Hold an anchored suspension trainer and lean back with the body straight. Pull the handles toward the ribs, then extend the arms without dropping the hips or shrugging.",
    "notes": "Note strap length and foot position; changing the body angle changes difficulty.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 17,
    "name": "Suspension trainer push-up",
    "aliases": [
      "TRX chest press"
    ],
    "family": "push-up",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "suspension-trainer"
    ],
    "patterns": [
      "horizontal-push",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing leaned forward",
      "support": "suspension handles"
    },
    "instructions": "Hold secure suspension handles and lean forward in a straight body line. Bend the elbows to lower between the handles, then press away without letting the straps rub or the hips sag.",
    "notes": "Keep strap length and foot position consistent.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 18,
    "name": "Suspension trainer biceps curl",
    "aliases": [
      "TRX biceps curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms",
      "core"
    ],
    "equipment": [
      "suspension-trainer"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing leaned back",
      "support": "suspension handles",
      "grip": "supinated"
    },
    "instructions": "Lean back from secure suspension handles with palms up and upper arms in front. Curl the hands toward the head by bending the elbows, then lower the body smoothly.",
    "notes": "Keep elbows in place rather than turning the curl into a row.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 19,
    "name": "Suspension trainer triceps extension",
    "aliases": [
      "TRX elbow extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "core"
    ],
    "equipment": [
      "suspension-trainer"
    ],
    "patterns": [
      "elbow-extension",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing leaned forward",
      "support": "suspension handles",
      "execution": "forehead toward handles"
    },
    "instructions": "Lean forward from secure suspension handles with arms extended. Bend the elbows to bring the head toward the hands, then extend without arching the trunk or moving the upper arms much.",
    "notes": "Use a body angle you can control and keep the straps taut.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 20,
    "name": "Suspension trainer hamstring curl",
    "aliases": [
      "TRX leg curl"
    ],
    "family": "leg-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "glutes",
      "core"
    ],
    "equipment": [
      "suspension-trainer"
    ],
    "patterns": [
      "knee-flexion",
      "hip-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "supine hips raised",
      "support": "heels in foot cradles"
    },
    "instructions": "Lie on the floor with heels in secure foot cradles. Lift the hips, bend both knees to draw the heels toward the body, then extend them slowly while keeping the pelvis controlled.",
    "notes": "Adjust strap length so the heels clear the floor; do not arch the lower back to hold the hips up.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 21,
    "name": "Suspension trainer knee tuck",
    "aliases": [
      "TRX suspended knee tuck"
    ],
    "family": "knee-tuck",
    "primary": [
      "rectus-abdominis",
      "obliques"
    ],
    "secondary": [
      "hip-flexors",
      "shoulders"
    ],
    "equipment": [
      "suspension-trainer"
    ],
    "patterns": [
      "hip-flexion",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank",
      "support": "hands on floor feet in cradles"
    },
    "instructions": "Place the feet in secure cradles and hold a plank on the hands. Draw both knees toward the chest, then extend the legs back slowly without letting the lower back sag.",
    "notes": "One tuck and return is one rep; keep both feet secure in the cradles.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 22,
    "name": "Suspension trainer pike",
    "aliases": [
      "TRX suspended pike"
    ],
    "family": "pike",
    "primary": [
      "rectus-abdominis",
      "obliques"
    ],
    "secondary": [
      "hip-flexors",
      "shoulders"
    ],
    "equipment": [
      "suspension-trainer"
    ],
    "patterns": [
      "hip-flexion",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank to inverted V",
      "support": "hands on floor feet in cradles"
    },
    "instructions": "Start in a hand-supported plank with feet secured in suspension cradles. Keep the knees nearly straight and lift the hips to draw the feet inward, then return under control.",
    "notes": "Move only through a range that keeps the shoulders stable and feet secured.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 23,
    "name": "Suspension-assisted pistol squat",
    "aliases": [
      "TRX assisted single-leg squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "abductors",
      "core"
    ],
    "equipment": [
      "suspension-trainer"
    ],
    "patterns": [
      "squat"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg free leg forward",
      "support": "hands on suspension handles"
    },
    "instructions": "Hold an anchored suspension trainer and balance on one leg with the other leg forward. Squat through a controlled range using the handles for support, then stand and repeat on the other side.",
    "notes": "Hand support is unmeasured; note how much assistance you use rather than entering a fictitious assistance weight.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 24,
    "name": "Pistol squat",
    "aliases": [
      "Unassisted single-leg squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "abductors",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "squat"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg free leg forward",
      "support": "none"
    },
    "instructions": "Balance on one leg with the other held forward. Lower into a single-leg squat through a controllable depth, then stand without touching down the free foot. Repeat on the other leg.",
    "notes": "Keep the working foot supported and reduce depth if balance or control is lost.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 25,
    "name": "Parallel-bar L-sit hold",
    "aliases": [
      "L-sit on parallel bars"
    ],
    "family": "l-sit",
    "primary": [
      "hip-flexors",
      "rectus-abdominis"
    ],
    "secondary": [
      "triceps",
      "shoulders"
    ],
    "equipment": [
      "parallel-bars"
    ],
    "patterns": [
      "hip-flexion",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "suspended legs straight forward",
      "support": "straight arms on parallel bars"
    },
    "instructions": "Support yourself on secure parallel bars with elbows straight. Lift both straight legs forward while keeping the torso controlled, hold the position, then lower the feet safely.",
    "notes": "Record seconds in the chosen position; do not substitute a tucked-leg hold without noting the change.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 26,
    "name": "Resistance-band pull-apart",
    "aliases": [
      "Band shoulder pull-apart"
    ],
    "family": "band-pull-apart",
    "primary": [
      "posterior-deltoid",
      "rhomboids"
    ],
    "secondary": [
      "traps",
      "rotator-cuff"
    ],
    "equipment": [
      "resistance-band"
    ],
    "patterns": [
      "horizontal-abduction"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "pronated band",
      "execution": "arms open horizontally"
    },
    "instructions": "Hold a band in front of the chest with softly bent elbows. Spread the arms apart without shrugging or leaning back, then return slowly while keeping tension controlled.",
    "notes": "Keep band length and hand spacing consistent; this entry records repetitions, not an estimated mass.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 27,
    "name": "Resistance-band face pull",
    "aliases": [
      "Band face pull"
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
      "resistance-band",
      "band-anchor"
    ],
    "patterns": [
      "horizontal-pull",
      "shoulder-rotation"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing face-height anchor",
      "grip": "band ends"
    },
    "instructions": "Secure a band near face height and hold its ends. Pull toward the sides of the face with elbows out, then return slowly without leaning back or letting the band snap forward.",
    "notes": "Check the anchor and band condition before loading; note band and standing distance.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 28,
    "name": "Resistance-band external rotation",
    "aliases": [
      "Band shoulder external rotation at side"
    ],
    "family": "shoulder-external-rotation",
    "primary": [
      "rotator-cuff"
    ],
    "secondary": [
      "posterior-deltoid"
    ],
    "equipment": [
      "resistance-band",
      "band-anchor"
    ],
    "patterns": [
      "shoulder-rotation"
    ],
    "load": "reps-only",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on",
      "support": "elbow at side",
      "execution": "outward rotation"
    },
    "instructions": "Stand side-on to an elbow-height band anchor with the farther hand holding the band. Keep the bent elbow beside the ribs and rotate the forearm outward, then return slowly. Repeat on both sides.",
    "notes": "Use light, controlled band tension without turning the torso.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 29,
    "name": "Seated resistance-band row",
    "aliases": [
      "Anchored seated band row"
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
      "resistance-band",
      "band-anchor"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "seated facing low anchor",
      "grip": "band ends"
    },
    "instructions": "Sit facing a secure low band anchor with knees slightly bent. Pull the band ends toward the ribs while keeping the torso still, then extend the arms under control.",
    "notes": "Use a fixed anchor rather than wrapping a damaged band around the feet; note band and distance.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 30,
    "name": "Standing resistance-band chest press",
    "aliases": [
      "Anchored band chest press"
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
      "resistance-band",
      "band-anchor"
    ],
    "patterns": [
      "horizontal-push",
      "anti-extension"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "split stance facing away from chest-height anchor",
      "execution": "bilateral"
    },
    "instructions": "Face away from a secure chest-height band anchor holding both ends beside the chest. Brace, press both hands forward, then return without letting the band pull the torso backward.",
    "notes": "Keep band type, starting stretch and stance consistent between sessions.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 31,
    "name": "Resistance-band biceps curl",
    "aliases": [
      "Standing band curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "resistance-band"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "standing on band",
      "grip": "supinated",
      "execution": "simultaneous"
    },
    "instructions": "Stand securely on the middle of a band and hold its ends with palms up. Curl both hands while keeping the elbows near the ribs, then lower slowly without rocking the torso.",
    "notes": "Use suitable footwear and keep band length and foot spacing consistent.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 32,
    "name": "Resistance-band overhead triceps extension",
    "aliases": [
      "Anchored band overhead elbow extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "resistance-band",
      "band-anchor"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing away from low anchor",
      "execution": "overhead bilateral"
    },
    "instructions": "Face away from a low band anchor with both hands behind the head and upper arms raised. Straighten the elbows while bracing the trunk, then bend them slowly to return.",
    "notes": "Keep the anchor secure and avoid arching the lower back as tension rises.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 33,
    "name": "Resistance-band lateral raise",
    "aliases": [
      "Band side raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [
      "traps"
    ],
    "equipment": [
      "resistance-band"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "standing on band",
      "execution": "bilateral"
    },
    "instructions": "Stand securely on the middle of a band with one end in each hand. Raise both arms outward with a small elbow bend, then lower without shrugging or swinging.",
    "notes": "Keep foot spacing and grip length consistent and stop at a controlled shoulder height.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 34,
    "name": "Resistance-band good morning",
    "aliases": [
      "Band hip hinge"
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
      "resistance-band"
    ],
    "patterns": [
      "hinge"
    ],
    "load": "reps-only",
    "repetitions": "total",
    "variant": {
      "stance": "standing on band",
      "support": "band across upper back"
    },
    "instructions": "Stand on a loop band and position it across the upper back, clear of the neck. Soften the knees, hinge the hips backward while braced, then extend the hips to stand.",
    "notes": "Use hands to secure the band position and avoid placing pressure directly on the neck.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 35,
    "name": "Lateral resistance-band walk",
    "aliases": [
      "Side-step mini-band walk"
    ],
    "family": "lateral-band-walk",
    "primary": [
      "abductors"
    ],
    "secondary": [
      "glutes"
    ],
    "equipment": [
      "resistance-band"
    ],
    "patterns": [
      "hip-abduction",
      "locomotion"
    ],
    "load": "reps-only",
    "repetitions": "per-side",
    "variant": {
      "stance": "shallow squat",
      "support": "loop band above knees",
      "execution": "lateral steps"
    },
    "instructions": "Place a loop band above the knees and hold a shallow squat. Step sideways under control, then bring the trailing foot in without losing all band tension. Repeat in the opposite direction.",
    "notes": "Count leading steps separately for each direction and note band position; this is not distance tracking.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 36,
    "name": "Two-hand kettlebell swing",
    "aliases": [
      "Russian kettlebell swing"
    ],
    "family": "swing",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "core",
      "lower-back",
      "forearms"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "hinge",
      "jump-power"
    ],
    "load": "kettlebell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "two hands on one bell",
      "execution": "hip-driven swing to chest height"
    },
    "instructions": "Hike one kettlebell back between the legs with a braced hip hinge. Drive the hips forward to float it to around chest height, then guide it back into the next hinge.",
    "notes": "Power comes from the hips, not an arm raise or a deep squat. Park the bell under control after the last rep.",
    "type": "conditioning",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 37,
    "name": "Single-arm kettlebell swing",
    "aliases": [
      "One-arm Russian swing"
    ],
    "family": "swing",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "core",
      "lower-back",
      "forearms"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "hinge",
      "anti-rotation",
      "jump-power"
    ],
    "load": "kettlebell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "single arm",
      "execution": "hip-driven swing to chest height"
    },
    "instructions": "Hike one kettlebell between the legs with one hand. Drive through the hips to float it forward while keeping the shoulders square, then guide it back into the hinge. Complete both sides.",
    "notes": "Avoid twisting or pulling with the arm; change hands only through a controlled setup.",
    "type": "conditioning",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 38,
    "name": "Kettlebell goblet squat",
    "aliases": [
      "KB goblet squat"
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
      "kettlebell"
    ],
    "patterns": [
      "squat"
    ],
    "load": "kettlebell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "bell held at chest"
    },
    "instructions": "Hold one kettlebell securely by its horns close to the chest. Squat between the hips with the feet grounded, then stand without letting the bell drift away from the torso.",
    "notes": "Record the single bell mass and keep the grip secure throughout.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 39,
    "name": "Kettlebell deadlift",
    "aliases": [
      "Single-bell KB deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "hamstrings",
      "quadriceps"
    ],
    "secondary": [
      "lower-back",
      "forearms",
      "core"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "hinge"
    ],
    "load": "kettlebell",
    "repetitions": "total",
    "variant": {
      "stance": "standing over bell",
      "grip": "two hands",
      "execution": "floor reset"
    },
    "instructions": "Place one kettlebell between the feet, bend the hips and knees and take a two-hand grip. Brace and stand, then lower the bell to the floor close to the body and reset.",
    "notes": "Keep the back controlled rather than reaching by rounding to the handle.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 40,
    "name": "Kettlebell Turkish get-up",
    "aliases": [
      "KB Turkish get-up",
      "TGU"
    ],
    "family": "get-up",
    "primary": [
      "core",
      "shoulders",
      "glutes"
    ],
    "secondary": [
      "quadriceps",
      "triceps"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "lunge-step",
      "anti-rotation"
    ],
    "load": "kettlebell",
    "repetitions": "per-side",
    "variant": {
      "stance": "supine to standing",
      "grip": "one bell overhead",
      "execution": "full get-up and return"
    },
    "instructions": "Start lying with one bell held vertically and that-side knee bent. Roll to the opposite elbow and hand, lift the hips and sweep the free leg under into a kneel, then stand. Reverse the sequence to lie down.",
    "notes": "Keep the bell controlled overhead. One rise and full return is one rep per arm; learn the sequence unloaded before adding mass.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 41,
    "name": "Single-arm kettlebell clean",
    "aliases": [
      "One-arm KB clean"
    ],
    "family": "clean",
    "primary": [
      "glutes",
      "hamstrings"
    ],
    "secondary": [
      "shoulders",
      "forearms",
      "core"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "hinge",
      "jump-power"
    ],
    "load": "kettlebell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "single arm",
      "execution": "swing to front rack"
    },
    "instructions": "Hike one bell into a hinge, drive the hips and guide it close to the body into the shoulder rack. Let the hand settle through the handle without the bell crashing onto the forearm, then return under control.",
    "notes": "Count each rack catch as one rep and keep sides separate.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 42,
    "name": "Single-arm kettlebell snatch",
    "aliases": [
      "One-arm KB snatch"
    ],
    "family": "snatch",
    "primary": [
      "glutes",
      "hamstrings",
      "shoulders"
    ],
    "secondary": [
      "triceps",
      "forearms",
      "core"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "hinge",
      "jump-power"
    ],
    "load": "kettlebell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "single arm",
      "execution": "swing to overhead catch"
    },
    "instructions": "Drive one bell from a backswing using the hips, guide it close and pass the hand through the handle to a controlled overhead finish. Lower through a controlled path before the next repetition.",
    "notes": "This is a technical lift; prevent the bell striking the forearm and use a load you can stabilise overhead.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 43,
    "name": "Single-arm kettlebell strict press",
    "aliases": [
      "One-arm KB shoulder press"
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
      "kettlebell"
    ],
    "patterns": [
      "vertical-push",
      "lateral-stability"
    ],
    "load": "kettlebell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "support": "none",
      "grip": "single bell front rack",
      "execution": "strict"
    },
    "instructions": "Start with one kettlebell in a secure shoulder rack. Brace and press overhead without knee drive or leaning sideways, then lower to the rack and repeat on the other side.",
    "notes": "Keep the ribs down and maintain a comfortable wrist position under the handle.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 44,
    "name": "Single-arm kettlebell push press",
    "aliases": [
      "One-arm KB push press"
    ],
    "family": "push-press",
    "primary": [
      "anterior-deltoid",
      "triceps"
    ],
    "secondary": [
      "quadriceps",
      "glutes",
      "core"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "vertical-push",
      "jump-power"
    ],
    "load": "kettlebell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "single bell front rack",
      "execution": "leg-driven press"
    },
    "instructions": "Rack one kettlebell at the shoulder. Make a short upright knee dip, drive through the legs and finish the press overhead, then lower to the rack under control. Repeat on the other side.",
    "notes": "Do not re-bend the knees to catch the bell; that would be a jerk rather than this push press.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 45,
    "name": "Single-arm kettlebell row",
    "aliases": [
      "Bench-supported KB row"
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
      "kettlebell",
      "bench"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "load": "kettlebell",
    "repetitions": "per-side",
    "variant": {
      "stance": "hinged",
      "support": "free hand on bench",
      "grip": "neutral"
    },
    "instructions": "Support the free hand on a stable bench and hinge with the back controlled. Pull one kettlebell toward the hip without rotating the torso, then lower to arm extension. Repeat on both sides.",
    "notes": "Keep the upper arm close and avoid using a torso twist to finish the row.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 46,
    "name": "Double-kettlebell front squat",
    "aliases": [
      "Double KB rack squat"
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
      "kettlebell"
    ],
    "patterns": [
      "squat"
    ],
    "load": "kettlebells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "two bells in front rack"
    },
    "instructions": "Hold two equal kettlebells in a secure shoulder rack. Brace, squat between the hips while keeping the feet grounded, then stand without letting the bells pull the torso forward.",
    "notes": "Two bells are required. Record one bell mass, not the combined pair.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 47,
    "name": "Double-kettlebell clean",
    "aliases": [
      "Double KB rack clean"
    ],
    "family": "clean",
    "primary": [
      "glutes",
      "hamstrings"
    ],
    "secondary": [
      "shoulders",
      "forearms",
      "core"
    ],
    "equipment": [
      "kettlebell"
    ],
    "patterns": [
      "hinge",
      "jump-power"
    ],
    "load": "kettlebells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "two bells",
      "execution": "simultaneous swing to rack"
    },
    "instructions": "Set up with two equal bells and enough stance width for clearance. Hike both into a hinge, drive the hips and guide them close into a controlled shoulder rack, then lower smoothly.",
    "notes": "One simultaneous rack catch is one rep. Record one bell weight and keep both bells clear of the knees.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 48,
    "name": "Landmine rotation",
    "aliases": [
      "Landmine side-to-side arc"
    ],
    "family": "torso-rotation",
    "primary": [
      "obliques"
    ],
    "secondary": [
      "shoulders",
      "glutes"
    ],
    "equipment": [
      "barbell",
      "landmine-attachment"
    ],
    "patterns": [
      "trunk-rotation"
    ],
    "load": "landmine",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing anchor",
      "grip": "both hands on sleeve",
      "execution": "centre to side and return"
    },
    "instructions": "Hold the free end of a secured landmine in front with both hands. Guide it down toward one hip with controlled hip and trunk rotation, then return to centre. Repeat to the other side.",
    "notes": "Allow the feet to pivot. Count each side-and-return separately and record only free-end plates.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 49,
    "name": "Standing single-arm landmine press",
    "aliases": [
      "Standing one-arm landmine shoulder press"
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
    "load": "landmine",
    "repetitions": "per-side",
    "variant": {
      "stance": "split stance standing",
      "support": "none",
      "grip": "bar sleeve",
      "execution": "single arm"
    },
    "instructions": "Stand in a split stance holding the landmine sleeve near one shoulder. Brace and press diagonally forward and up along the bar arc, then lower without rotating the torso. Repeat on both arms.",
    "notes": "Keep the anchor secure and the stance consistent; this differs from the existing half-kneeling version.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 50,
    "name": "Single-arm neutral-grip landmine row",
    "aliases": [
      "One-arm landmine handle row"
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
      "landmine-attachment",
      "landmine-row-handle"
    ],
    "patterns": [
      "horizontal-pull"
    ],
    "load": "landmine",
    "repetitions": "per-side",
    "variant": {
      "stance": "staggered hip hinge",
      "grip": "single-arm neutral handle",
      "support": "none",
      "execution": "single arm"
    },
    "instructions": "Use a landmine row attachment designed for a secure one-hand neutral grip. Hinge beside the bar, pull the handle toward the working hip, then lower without twisting. Repeat on both sides.",
    "notes": "This uses a neutral handle, unlike the overhand sleeve grip of a Meadows row. Record free-end plates only.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 51,
    "name": "Dead bug",
    "aliases": [
      "Contralateral dead-bug reach"
    ],
    "family": "dead-bug",
    "primary": [
      "rectus-abdominis",
      "obliques"
    ],
    "secondary": [
      "hip-flexors"
    ],
    "equipment": [],
    "patterns": [
      "anti-extension",
      "anti-rotation"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "supine hips and knees bent",
      "support": "back on floor",
      "execution": "opposite arm and leg reach"
    },
    "instructions": "Lie on the back with arms up and knees bent above the hips. Lower one arm and the opposite leg only as far as the trunk stays controlled, return, then repeat the other pair.",
    "notes": "Count each reach-and-return by the moving arm. Reduce range if the lower back lifts.",
    "type": "stability",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 52,
    "name": "Bird dog",
    "aliases": [
      "Quadruped opposite arm and leg reach"
    ],
    "family": "bird-dog",
    "primary": [
      "lower-back",
      "core"
    ],
    "secondary": [
      "glutes",
      "shoulders"
    ],
    "equipment": [],
    "patterns": [
      "anti-rotation",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "hands and knees",
      "execution": "opposite arm and leg reach"
    },
    "instructions": "Start on hands and knees with the trunk braced. Reach one arm forward and the opposite leg backward without rotating the hips, then return and repeat the other pair.",
    "notes": "Count by the reaching arm; keep the pelvis level rather than lifting the leg higher.",
    "type": "stability",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 53,
    "name": "Side plank",
    "aliases": [
      "Forearm side bridge"
    ],
    "family": "side-plank",
    "primary": [
      "obliques"
    ],
    "secondary": [
      "abductors",
      "shoulders"
    ],
    "equipment": [],
    "patterns": [
      "lateral-stability"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "side lying lifted",
      "support": "one forearm and stacked feet",
      "execution": "timed lateral hold"
    },
    "instructions": "Set one elbow beneath the shoulder with legs stacked. Lift the hips into a straight line and hold without rotating, then lower and repeat on the other side.",
    "notes": "Record seconds per side and log unequal holds separately with side notes.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 54,
    "name": "Reverse crunch",
    "aliases": [
      "Supine pelvic curl"
    ],
    "family": "reverse-crunch",
    "primary": [
      "rectus-abdominis"
    ],
    "secondary": [
      "obliques",
      "hip-flexors"
    ],
    "equipment": [],
    "patterns": [
      "trunk-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "supine knees bent",
      "support": "back on floor",
      "execution": "pelvis curls upward"
    },
    "instructions": "Lie on the back with knees bent above the hips. Curl the pelvis so the tailbone lifts a short distance, then lower it slowly without swinging the legs.",
    "notes": "The pelvis moves rather than just the thighs; avoid using momentum to gain range.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 55,
    "name": "Hanging knee raise",
    "aliases": [
      "Bent-knee hanging raise"
    ],
    "family": "hanging-leg-raise",
    "primary": [
      "hip-flexors",
      "rectus-abdominis"
    ],
    "secondary": [
      "obliques",
      "forearms"
    ],
    "equipment": [
      "pull-up-bar"
    ],
    "patterns": [
      "hip-flexion",
      "trunk-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "hanging",
      "grip": "pronated",
      "execution": "knees bent"
    },
    "instructions": "Hang from a secure bar and draw the bent knees upward with the pelvis controlled. Lower to a still hang before repeating rather than using a swing to start the next rep.",
    "notes": "Choose a range you can control and keep the grip secure throughout.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 56,
    "name": "Hanging straight-leg raise",
    "aliases": [
      "Straight-leg hanging raise"
    ],
    "family": "hanging-leg-raise",
    "primary": [
      "hip-flexors",
      "rectus-abdominis"
    ],
    "secondary": [
      "obliques",
      "forearms"
    ],
    "equipment": [
      "pull-up-bar"
    ],
    "patterns": [
      "hip-flexion",
      "trunk-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "hanging",
      "grip": "pronated",
      "execution": "legs nearly straight"
    },
    "instructions": "Hang from a secure bar and raise both nearly straight legs forward while controlling the pelvis. Lower slowly to a still hang without using momentum or forcing the feet to the bar.",
    "notes": "Keep a consistent knee angle and height. Use the separate bent-knee entry for bent-leg sets.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 57,
    "name": "Kneeling ab-wheel rollout",
    "aliases": [
      "Ab roller from knees"
    ],
    "family": "rollout",
    "primary": [
      "rectus-abdominis",
      "obliques"
    ],
    "secondary": [
      "lats",
      "shoulders"
    ],
    "equipment": [
      "ab-wheel"
    ],
    "patterns": [
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "kneeling",
      "support": "hands on wheel and knees",
      "execution": "forward rollout"
    },
    "instructions": "Kneel with hands on the ab wheel and ribs down. Roll forward only as far as the trunk remains braced, then draw the wheel back without folding at the hips first.",
    "notes": "Use a shorter range if the lower back arches; record the same rollout depth for comparisons.",
    "type": "stability",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 58,
    "name": "Short-lever Copenhagen plank",
    "aliases": [
      "Knee-supported Copenhagen adductor hold"
    ],
    "family": "side-plank",
    "primary": [
      "adductors"
    ],
    "secondary": [
      "obliques",
      "shoulders"
    ],
    "equipment": [
      "bench"
    ],
    "patterns": [
      "hip-adduction",
      "lateral-stability"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "side lying lifted",
      "support": "top knee on bench and forearm on floor",
      "execution": "timed short-lever hold"
    },
    "instructions": "Support the top knee on a stable bench and place the lower elbow under the shoulder. Lift the hips into a straight line and hold with the lower leg clear, then lower and switch sides.",
    "notes": "Time is per side. Support the knee rather than the ankle for this shorter-lever version.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 59,
    "name": "Hollow body hold",
    "aliases": [
      "Gymnastics hollow hold"
    ],
    "family": "hollow-hold",
    "primary": [
      "rectus-abdominis",
      "obliques"
    ],
    "secondary": [
      "hip-flexors"
    ],
    "equipment": [],
    "patterns": [
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "supine arms overhead legs extended",
      "support": "lower back on floor",
      "execution": "timed hollow position"
    },
    "instructions": "Lie on the back and lift the shoulders and legs slightly while maintaining lower-back contact with the floor. Reach the arms overhead only as far as the trunk stays controlled, then hold.",
    "notes": "Raise the legs or shorten the arm reach to maintain control; note position when comparing times.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 60,
    "name": "Superman hold",
    "aliases": [
      "Prone back extension hold"
    ],
    "family": "back-extension",
    "primary": [
      "lower-back",
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "shoulders"
    ],
    "equipment": [],
    "patterns": [
      "trunk-extension",
      "hip-extension"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "prone",
      "support": "abdomen on floor",
      "execution": "timed small arm and leg lift"
    },
    "instructions": "Lie face down with arms reaching forward. Lift the arms and legs a small distance while keeping the neck long, hold the controlled position, then lower slowly.",
    "notes": "Use a small comfortable range rather than forcing a high arch or holding your breath.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 61,
    "name": "45-degree back extension",
    "aliases": [
      "Bodyweight Roman-chair back extension"
    ],
    "family": "back-extension",
    "primary": [
      "glutes",
      "hamstrings"
    ],
    "secondary": [
      "lower-back"
    ],
    "equipment": [
      "back-extension-bench"
    ],
    "patterns": [
      "hinge",
      "hip-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "inclined prone",
      "support": "45-degree hip pad",
      "execution": "bodyweight hip hinge"
    },
    "instructions": "Set the pad below the hip crease and secure the feet. Hinge down from the hips with a controlled trunk, then raise the torso to align with the legs.",
    "notes": "Finish at body alignment rather than arching above it; keep pad position consistent.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 62,
    "name": "Weighted 45-degree back extension",
    "aliases": [
      "Plate-loaded Roman-chair back extension"
    ],
    "family": "back-extension",
    "primary": [
      "glutes",
      "hamstrings"
    ],
    "secondary": [
      "lower-back"
    ],
    "equipment": [
      "back-extension-bench",
      "weight-plate"
    ],
    "patterns": [
      "hinge",
      "hip-extension"
    ],
    "load": "added",
    "repetitions": "total",
    "variant": {
      "stance": "inclined prone",
      "support": "45-degree hip pad",
      "grip": "plate held against chest",
      "execution": "loaded hip hinge"
    },
    "instructions": "Secure the feet and position the hip pad below the hip crease. Hold a plate close to the chest, hinge from the hips, then rise until the torso aligns with the legs.",
    "notes": "Record only the added plate separately from bodyweight. Do not throw the torso above alignment.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 63,
    "name": "Reverse hyperextension machine",
    "aliases": [
      "Plate-loaded reverse hyper"
    ],
    "family": "reverse-hyperextension",
    "primary": [
      "glutes",
      "hamstrings"
    ],
    "secondary": [
      "lower-back"
    ],
    "equipment": [
      "reverse-hyperextension-machine"
    ],
    "patterns": [
      "hip-extension"
    ],
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "prone hips at pad edge",
      "support": "machine torso pad and ankle restraint",
      "execution": "bilateral leg lift"
    },
    "instructions": "Lie face down with hips at the pad edge and secure the legs to the machine as directed. Raise both legs by extending the hips, then lower without swinging the lever.",
    "notes": "Use a controlled range and exclude the empty lever from recorded load.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 64,
    "name": "Single-leg bodyweight calf raise",
    "aliases": [
      "Unloaded straight-knee single-leg calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "rack",
      "calf-block"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "one forefoot elevated knee nearly straight",
      "support": "hand on rack"
    },
    "instructions": "Stand on one forefoot on a stable calf block with a hand on a secure support. Lift the heel without knee drive, then lower slowly through a comfortable range. Repeat on both sides.",
    "notes": "Use the hand for balance and note block height; do not pull upward with the arm.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 65,
    "name": "Bent-knee single-leg bodyweight calf raise",
    "aliases": [
      "Unloaded single-leg bent-knee calf raise"
    ],
    "family": "calf-raise",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipment": [
      "rack",
      "calf-block"
    ],
    "patterns": [
      "plantar-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "one forefoot elevated knee bent",
      "support": "hand on rack"
    },
    "instructions": "Balance on one forefoot on a stable block while holding a secure support. Keep the working knee bent at a steady angle, raise the heel, then lower slowly. Repeat on the other side.",
    "notes": "Maintain the knee bend without bobbing up through the thigh; note the same block height.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 66,
    "name": "Wall-supported tibialis raise",
    "aliases": [
      "Bodyweight wall dorsiflexion"
    ],
    "family": "tibialis-raise",
    "primary": [
      "tibialis-anterior"
    ],
    "secondary": [],
    "equipment": [
      "wall"
    ],
    "patterns": [
      "dorsiflexion"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing heels grounded",
      "support": "back against wall",
      "execution": "bilateral toes upward"
    },
    "instructions": "Lean the back against a suitable wall with the heels a short distance forward. Keep the heels planted, lift both forefeet toward the shins, then lower smoothly.",
    "notes": "Note foot distance from the wall because it changes difficulty without adding weight.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 67,
    "name": "Side-lying hip abduction",
    "aliases": [
      "Side-lying outer-leg raise"
    ],
    "family": "hip-abduction",
    "primary": [
      "abductors"
    ],
    "secondary": [
      "glutes"
    ],
    "equipment": [],
    "patterns": [
      "hip-abduction"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "side lying top leg straight",
      "support": "floor",
      "execution": "top leg raises"
    },
    "instructions": "Lie on one side with hips stacked and the top leg straight. Raise the top leg outward without rolling the pelvis back, then lower slowly. Repeat on the other side.",
    "notes": "Keep the toes mostly forward rather than turning the leg upward to gain height.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 68,
    "name": "Side-lying hip adduction",
    "aliases": [
      "Side-lying inner-leg raise"
    ],
    "family": "hip-adduction",
    "primary": [
      "adductors"
    ],
    "secondary": [],
    "equipment": [],
    "patterns": [
      "hip-adduction"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "side lying bottom leg straight",
      "support": "floor top foot planted",
      "execution": "bottom leg raises"
    },
    "instructions": "Lie on one side with the bottom leg straight and the top foot planted in front. Lift the bottom leg a short distance without rolling the hips, then lower. Repeat on both sides.",
    "notes": "Keep the pelvis stacked and use a controlled range rather than swinging the leg.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 69,
    "name": "Bodyweight clamshell",
    "aliases": [
      "Side-lying bent-knee clamshell"
    ],
    "family": "clamshell",
    "primary": [
      "abductors"
    ],
    "secondary": [
      "glutes"
    ],
    "equipment": [],
    "patterns": [
      "hip-abduction",
      "hip-external-rotation"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "side lying knees bent",
      "support": "floor",
      "execution": "knees open feet together"
    },
    "instructions": "Lie on one side with knees bent and feet together. Lift the top knee while keeping the pelvis stacked and feet touching, then close slowly. Repeat on the other side.",
    "notes": "Avoid rolling the hips backward to increase range; this version uses no band.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 70,
    "name": "Hand-resisted neck flexion hold",
    "aliases": [
      "Forward neck isometric"
    ],
    "family": "neck-isometric",
    "primary": [
      "neck"
    ],
    "secondary": [],
    "equipment": [],
    "patterns": [
      "neck-flexion",
      "neck-stability"
    ],
    "load": "unloaded",
    "repetitions": "unspecified",
    "variant": {
      "stance": "seated upright",
      "support": "palm on forehead",
      "execution": "gentle forward isometric"
    },
    "instructions": "Sit upright with the head neutral and a palm against the forehead. Gently attempt to nod forward while the hand keeps the head still, then release the pressure smoothly.",
    "notes": "Time the gentle hold. Hand pressure is not a measurable external load; keep breathing normally.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 71,
    "name": "Hand-resisted neck extension hold",
    "aliases": [
      "Backward neck isometric"
    ],
    "family": "neck-isometric",
    "primary": [
      "neck"
    ],
    "secondary": [],
    "equipment": [],
    "patterns": [
      "neck-extension",
      "neck-stability"
    ],
    "load": "unloaded",
    "repetitions": "unspecified",
    "variant": {
      "stance": "seated upright",
      "support": "hands on back of head",
      "execution": "gentle backward isometric"
    },
    "instructions": "Sit tall with hands supporting the back of the head. Gently press backward into the hands without moving the head or tipping the chin up, then release under control.",
    "notes": "Use gentle pressure rather than pushing into a large neck range.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 72,
    "name": "Hand-resisted lateral neck hold",
    "aliases": [
      "Side-bend neck isometric"
    ],
    "family": "neck-isometric",
    "primary": [
      "neck"
    ],
    "secondary": [],
    "equipment": [],
    "patterns": [
      "neck-lateral-flexion",
      "neck-stability"
    ],
    "load": "unloaded",
    "repetitions": "unspecified",
    "variant": {
      "stance": "seated upright",
      "support": "palm at side of head",
      "execution": "gentle lateral isometric"
    },
    "instructions": "Sit tall with a palm against the side of the head. Gently attempt to tilt toward the hand while keeping the head upright, then release. Repeat on the other side.",
    "notes": "Duration is per side; avoid raising the shoulder or leaning the trunk.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 73,
    "name": "Hand-resisted neck rotation hold",
    "aliases": [
      "Rotational neck isometric"
    ],
    "family": "neck-isometric",
    "primary": [
      "neck"
    ],
    "secondary": [],
    "equipment": [],
    "patterns": [
      "neck-rotation",
      "neck-stability"
    ],
    "load": "unloaded",
    "repetitions": "unspecified",
    "variant": {
      "stance": "seated upright",
      "support": "palm at temple",
      "execution": "gentle rotation isometric"
    },
    "instructions": "Sit with the head neutral and a palm against one temple. Gently attempt to turn the face toward that hand while preventing movement, then release. Repeat in the other direction.",
    "notes": "Duration is per direction. Keep pressure gentle and avoid pushing on the jaw.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 74,
    "name": "Supine neck nod",
    "aliases": [
      "Lying chin-tuck nod"
    ],
    "family": "neck-nod",
    "primary": [
      "neck"
    ],
    "secondary": [],
    "equipment": [],
    "patterns": [
      "neck-flexion"
    ],
    "load": "unloaded",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "head resting on floor",
      "execution": "small controlled nod"
    },
    "instructions": "Lie on the back with the head supported in a neutral position. Make a small nod by gently drawing the chin toward the throat without lifting the head, then return.",
    "notes": "Use a small slow motion; this is a nod rather than a loaded head lift.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 75,
    "name": "Reverse plank hold",
    "aliases": [
      "Straight-leg reverse bridge hold"
    ],
    "family": "reverse-plank",
    "primary": [
      "glutes",
      "hamstrings"
    ],
    "secondary": [
      "shoulders",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "hip-extension",
      "anti-rotation"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "supine-facing lift legs straight",
      "support": "hands and heels",
      "execution": "timed reverse support"
    },
    "instructions": "Sit with legs extended and hands behind the hips. Press through the hands and heels to lift the hips into a controlled line, hold, then lower without forcing shoulder extension.",
    "notes": "Keep the neck neutral and use a hand position that stays comfortable.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 76,
    "name": "Trap-bar jump",
    "aliases": [
      "Hex-bar jump squat"
    ],
    "family": "jump",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "calves",
      "core"
    ],
    "equipment": [
      "trap-bar"
    ],
    "patterns": [
      "jump-power",
      "squat"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "inside trap bar",
      "grip": "neutral handles",
      "execution": "loaded vertical jump"
    },
    "instructions": "Stand inside a lightly loaded trap bar with a secure grip. Make a short dip, jump vertically and land with both feet under control. Reset your stance before the next jump.",
    "notes": "Use a load and space that allow quiet, balanced landings; record the actual bar plus plates. Jump height is not recorded.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 77,
    "name": "Box jump",
    "aliases": [
      "Two-foot jump onto box"
    ],
    "family": "jump",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "calves",
      "hamstrings"
    ],
    "equipment": [
      "jump-box"
    ],
    "patterns": [
      "jump-power"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing box",
      "execution": "bilateral jump onto box"
    },
    "instructions": "Face a stable low jump box, make a small countermovement and jump onto it with both feet. Land softly with the whole feet supported, stand tall, then step down and reset.",
    "notes": "Choose a height you can land on comfortably and step down rather than rebounding off the box.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 78,
    "name": "Standing broad jump",
    "aliases": [
      "Standing long jump"
    ],
    "family": "jump",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "calves"
    ],
    "equipment": [],
    "patterns": [
      "jump-power"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "execution": "bilateral forward jump"
    },
    "instructions": "Start with feet planted and clear space ahead. Swing the arms and drive through both legs to jump forward, land softly on both feet, then reset before repeating.",
    "notes": "Log successful jumps as reps. Distance is not measured by the logger; note it separately if needed.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 79,
    "name": "Paused squat jump",
    "aliases": [
      "Static-start vertical squat jump"
    ],
    "family": "jump",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "calves"
    ],
    "equipment": [],
    "patterns": [
      "jump-power",
      "squat"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "execution": "paused squat to vertical jump"
    },
    "instructions": "Lower into a comfortable partial squat and pause briefly. Jump straight up without an extra dip, land softly through both feet, then reset into the next paused start.",
    "notes": "Use a controlled landing and keep the pause consistent; height is not recorded.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 80,
    "name": "Alternating lunge jump",
    "aliases": [
      "Jumping split lunge"
    ],
    "family": "jump",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "calves",
      "hamstrings",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "jump-power",
      "lunge-step"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "split stance",
      "execution": "airborne leg switch"
    },
    "instructions": "Start in a shallow lunge, jump and switch the legs in the air. Land softly in the opposite split stance with the front foot stable, then reset or repeat under control.",
    "notes": "Count each landing for the front leg. Use enough space and stop if the landings become uncontrolled.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 81,
    "name": "Skater jump",
    "aliases": [
      "Lateral single-leg bound"
    ],
    "family": "jump",
    "primary": [
      "glutes",
      "abductors",
      "quadriceps"
    ],
    "secondary": [
      "calves",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "jump-power",
      "lateral-stability"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg",
      "execution": "lateral bound to opposite leg"
    },
    "instructions": "Balance on one leg and push sideways to land on the other. Absorb the landing through the hip and knee, stabilise, then bound back in the opposite direction.",
    "notes": "Count landings per side. Keep the distance within a range you can control.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 82,
    "name": "Plyometric push-up",
    "aliases": [
      "Explosive push-up"
    ],
    "family": "plyometric-push-up",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "horizontal-push",
      "jump-power"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank",
      "support": "hands and toes",
      "execution": "hands briefly leave floor"
    },
    "instructions": "Start in a firm push-up position, lower under control, then press fast enough for both hands to leave the floor briefly. Land with soft elbows and regain control before repeating.",
    "notes": "A clap is not required; choose a range and effort that allow a controlled landing.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 83,
    "name": "Medicine-ball chest pass",
    "aliases": [
      "Two-hand medicine-ball wall pass"
    ],
    "family": "ball-pass",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [
      "medicine-ball",
      "throwing-wall"
    ],
    "patterns": [
      "horizontal-push",
      "jump-power"
    ],
    "load": "implement",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing wall",
      "grip": "two hands at chest",
      "execution": "chest-level throw"
    },
    "instructions": "Face a wall suitable for throwing with a medicine ball at chest height. Brace and throw it forward with both hands, then regain control of the ball before the next pass.",
    "notes": "Use a ball and wall intended for the drill. Count throws, not rebound distance or speed.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 84,
    "name": "Medicine-ball slam",
    "aliases": [
      "Non-bouncing overhead ball slam"
    ],
    "family": "ball-slam",
    "primary": [
      "lats",
      "rectus-abdominis",
      "glutes"
    ],
    "secondary": [
      "shoulders",
      "triceps"
    ],
    "equipment": [
      "slam-ball"
    ],
    "patterns": [
      "trunk-flexion",
      "shoulder-extension",
      "jump-power"
    ],
    "load": "implement",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "two hands",
      "execution": "overhead throw down"
    },
    "instructions": "Raise a non-bouncing slam ball overhead in clear space. Drive it down in front using the arms and trunk, then hinge and bend the knees to retrieve it under control.",
    "notes": "Use a ball made for slams and keep the landing area clear. One throw is one rep.",
    "type": "conditioning",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 85,
    "name": "Rotational medicine-ball wall throw",
    "aliases": [
      "Side-on medicine-ball scoop toss"
    ],
    "family": "ball-throw",
    "primary": [
      "obliques",
      "glutes"
    ],
    "secondary": [
      "shoulders",
      "rectus-abdominis"
    ],
    "equipment": [
      "medicine-ball",
      "throwing-wall"
    ],
    "patterns": [
      "trunk-rotation",
      "jump-power"
    ],
    "load": "implement",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on to wall",
      "grip": "two hands",
      "execution": "rotational scoop throw"
    },
    "instructions": "Stand side-on to a suitable wall holding a medicine ball near the far hip. Pivot through the feet and rotate to throw toward the wall, then reset with control. Repeat on both sides.",
    "notes": "Count throws by direction. Use a suitable ball and allow the feet to pivot rather than twisting through planted knees.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 86,
    "name": "Hand-assisted Nordic hamstring curl",
    "aliases": [
      "Nordic curl with hand-assisted return"
    ],
    "family": "nordic-curl",
    "primary": [
      "hamstrings"
    ],
    "secondary": [
      "glutes",
      "core"
    ],
    "equipment": [
      "nordic-anchor"
    ],
    "patterns": [
      "knee-flexion"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "kneeling",
      "support": "ankles restrained",
      "execution": "controlled lowering hand-assisted return"
    },
    "instructions": "Kneel with the ankles securely restrained and keep the torso aligned with the thighs. Lower forward slowly using the hamstrings, catch with the hands, then use a gentle push to return.",
    "notes": "Use a padded setup and note hand support; the logger does not estimate assistance weight.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 87,
    "name": "Alternating battle-rope waves",
    "aliases": [
      "Battle ropes single-arm alternating waves"
    ],
    "family": "battle-ropes",
    "primary": [
      "shoulders",
      "forearms"
    ],
    "secondary": [
      "core",
      "quadriceps"
    ],
    "equipment": [
      "battle-ropes",
      "rope-anchor"
    ],
    "patterns": [
      "shoulder-raise",
      "anti-rotation"
    ],
    "load": "unloaded",
    "repetitions": "unspecified",
    "variant": {
      "stance": "shallow squat facing anchor",
      "grip": "one rope end each hand",
      "execution": "timed alternating waves"
    },
    "instructions": "Face a secure rope anchor and take one end in each hand. Hold a braced shallow squat and move the arms alternately to send waves along the ropes for the planned time.",
    "notes": "Record working seconds. Note rope length and stance rather than guessing an equivalent load.",
    "type": "conditioning",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 88,
    "name": "Double-arm battle-rope slams",
    "aliases": [
      "Simultaneous battle-rope slams"
    ],
    "family": "battle-ropes",
    "primary": [
      "shoulders",
      "lats",
      "forearms"
    ],
    "secondary": [
      "core",
      "glutes"
    ],
    "equipment": [
      "battle-ropes",
      "rope-anchor"
    ],
    "patterns": [
      "shoulder-extension",
      "hinge"
    ],
    "load": "unloaded",
    "repetitions": "unspecified",
    "variant": {
      "stance": "standing facing anchor",
      "grip": "one rope end each hand",
      "execution": "timed simultaneous slams"
    },
    "instructions": "Hold both rope ends facing a secure anchor. Raise both hands together, then drive them down with a controlled hip bend to send a slam toward the anchor. Continue for the planned time.",
    "notes": "Record working seconds and keep foot position consistent; do not turn the set into uncontrolled back movement.",
    "type": "conditioning",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 89,
    "name": "Burpee",
    "aliases": [
      "Chest-to-floor burpee"
    ],
    "family": "burpee",
    "primary": [
      "chest",
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "triceps",
      "core",
      "calves"
    ],
    "equipment": [],
    "patterns": [
      "horizontal-push",
      "squat",
      "jump-power"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing to floor and back",
      "execution": "chest to floor then jump"
    },
    "instructions": "From standing, place the hands down and move the feet back into a plank. Lower the chest, press up, bring the feet back under the body and finish with a small jump before resetting.",
    "notes": "Count one complete floor-to-jump cycle. Keep the landing and plank transitions controlled.",
    "type": "conditioning",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 90,
    "name": "Mountain climber",
    "aliases": [
      "Alternating plank knee drive"
    ],
    "family": "mountain-climber",
    "primary": [
      "hip-flexors",
      "rectus-abdominis"
    ],
    "secondary": [
      "shoulders",
      "obliques"
    ],
    "equipment": [],
    "patterns": [
      "hip-flexion",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "plank",
      "support": "hands and toes",
      "execution": "alternating knee drive"
    },
    "instructions": "Hold a hand-supported plank and draw one knee toward the chest. Return that foot, then alternate sides while keeping the trunk controlled and shoulders over the hands.",
    "notes": "Count drives per leg, not combined alternating steps. Pace can be noted separately.",
    "type": "conditioning",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 91,
    "name": "Jumping jack",
    "aliases": [
      "Side-straddle hop"
    ],
    "family": "jump",
    "primary": [
      "calves",
      "abductors",
      "shoulders"
    ],
    "secondary": [
      "adductors",
      "quadriceps"
    ],
    "equipment": [],
    "patterns": [
      "jump-power",
      "hip-abduction",
      "shoulder-raise"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "execution": "jump feet out and in with arm raise"
    },
    "instructions": "Start standing with arms at the sides. Jump the feet apart while raising the arms, then jump back to the start with soft landings and controlled arm motion.",
    "notes": "Count one out-and-back cycle. Keep the movement within a comfortable arm range.",
    "type": "conditioning",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 92,
    "name": "Jump rope",
    "aliases": [
      "Timed skipping rope"
    ],
    "family": "jump-rope",
    "primary": [
      "calves"
    ],
    "secondary": [
      "forearms",
      "shoulders",
      "quadriceps"
    ],
    "equipment": [
      "jump-rope"
    ],
    "patterns": [
      "jump-power",
      "locomotion"
    ],
    "load": "unloaded",
    "repetitions": "unspecified",
    "variant": {
      "stance": "standing",
      "execution": "timed basic two-foot skipping"
    },
    "instructions": "Hold a skipping rope with elbows near the sides. Turn it using small wrist movements and make low controlled jumps to clear it for the planned working time.",
    "notes": "Record seconds, not estimated jump count, cadence or calories. Use a clear area and an appropriate rope length.",
    "type": "conditioning",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 93,
    "name": "Sandbag shouldering",
    "aliases": [
      "Alternating sandbag to shoulder"
    ],
    "family": "sandbag-shoulder",
    "primary": [
      "glutes",
      "hamstrings",
      "quadriceps"
    ],
    "secondary": [
      "core",
      "upper-back",
      "forearms"
    ],
    "equipment": [
      "sandbag"
    ],
    "patterns": [
      "hinge",
      "squat"
    ],
    "load": "implement",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing over sandbag",
      "grip": "two hands",
      "execution": "floor to one shoulder and reset"
    },
    "instructions": "Set the sandbag between the feet, hinge and squat to grip it, then bring it to the lap. Stand and guide it to one shoulder, then lower to the floor under control. Repeat to the other side.",
    "notes": "Count lifts per receiving shoulder and record the total filled bag mass.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 94,
    "name": "Sandbag bear-hug squat",
    "aliases": [
      "Front-held sandbag squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "core",
      "upper-back"
    ],
    "equipment": [
      "sandbag"
    ],
    "patterns": [
      "squat"
    ],
    "load": "implement",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "sandbag hugged to torso"
    },
    "instructions": "Hold a filled sandbag close against the front of the torso. Brace, squat through a controlled depth, then stand while keeping the bag secure and the feet supported.",
    "notes": "Record the total bag mass and avoid letting the bag slide away from the body.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 95,
    "name": "Timed dumbbell farmer carry",
    "aliases": [
      "Dumbbell farmers walk by time"
    ],
    "family": "loaded-carry",
    "primary": [
      "forearms",
      "traps",
      "core"
    ],
    "secondary": [
      "glutes",
      "quadriceps",
      "calves"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "carry",
      "locomotion"
    ],
    "load": "dumbbells",
    "repetitions": "unspecified",
    "variant": {
      "stance": "walking",
      "grip": "neutral at sides",
      "execution": "timed bilateral carry"
    },
    "instructions": "Hold equal dumbbells at the sides and walk along a clear route with shoulders level and the trunk braced. Turn under control if needed, then set the weights down safely.",
    "notes": "Record one dumbbell weight and working seconds. Use a consistent route; distance and pace are not tracked.",
    "type": "conditioning",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 96,
    "name": "Timed sled push",
    "aliases": [
      "Prowler push by time"
    ],
    "family": "sled-push",
    "primary": [
      "quadriceps",
      "glutes",
      "calves"
    ],
    "secondary": [
      "hamstrings",
      "core",
      "shoulders"
    ],
    "equipment": [
      "sled"
    ],
    "patterns": [
      "locomotion"
    ],
    "load": "sled",
    "repetitions": "unspecified",
    "variant": {
      "stance": "forward lean",
      "support": "hands on sled handles",
      "execution": "timed forward push"
    },
    "instructions": "Set a push sled on a suitable clear surface and grip its handles. Brace in a forward lean and drive it ahead with controlled steps for the planned working time.",
    "notes": "Record load and seconds only. Keep handle height and surface consistent; distance is not measured.",
    "type": "conditioning",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 97,
    "name": "Timed backward sled drag",
    "aliases": [
      "Reverse sled pull by time"
    ],
    "family": "sled-drag",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "glutes",
      "calves",
      "forearms"
    ],
    "equipment": [
      "sled",
      "sled-straps"
    ],
    "patterns": [
      "locomotion"
    ],
    "load": "sled",
    "repetitions": "unspecified",
    "variant": {
      "stance": "walking backward facing sled",
      "grip": "two pulling straps",
      "execution": "timed backward drag"
    },
    "instructions": "Secure suitable straps to a sled and face it with the straps taut. Walk backward with short controlled steps along a clear route, then stop the sled under control.",
    "notes": "Check the path behind you before starting. Record load and seconds, not distance or estimated resistance.",
    "type": "conditioning",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 98,
    "name": "Multi-grip bar bench press",
    "aliases": [
      "Swiss-bar neutral-grip bench press"
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
      "multi-grip-bar",
      "rack",
      "bench"
    ],
    "patterns": [
      "horizontal-push"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "grip": "neutral specialty bar"
    },
    "instructions": "Set a multi-grip bar in a rack over a flat bench and take a comfortable neutral grip. Unrack, lower toward the chest under control, then press upward without bouncing.",
    "notes": "Use safeties or a spotter and record the actual specialty-bar mass plus plates; note handle spacing.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 99,
    "name": "Trap-bar Romanian deadlift",
    "aliases": [
      "Hex-bar RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "forearms",
      "core"
    ],
    "equipment": [
      "trap-bar"
    ],
    "patterns": [
      "hinge"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "inside trap bar",
      "grip": "neutral handles",
      "execution": "Romanian top start"
    },
    "instructions": "Start standing inside a trap bar with a neutral grip. Soften the knees and hinge the hips back, then return to standing from a controlled hamstring stretch.",
    "notes": "Keep knee bend nearly constant. This top-start hinge does not reset on the floor each rep; record actual bar mass.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 100,
    "name": "Standing cable hip flexion",
    "aliases": [
      "Ankle-cuff cable knee drive"
    ],
    "family": "hip-flexion",
    "primary": [
      "hip-flexors"
    ],
    "secondary": [
      "core",
      "abductors"
    ],
    "equipment": [
      "cable",
      "ankle-strap",
      "rack"
    ],
    "patterns": [
      "hip-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing away from low pulley",
      "support": "hand on rack",
      "execution": "single-leg knee lift"
    },
    "instructions": "Face away from a low pulley with a cuff on the working ankle and a hand on a secure support. Lift that knee forward from the hip, then lower without leaning back. Repeat on both sides.",
    "notes": "Keep the pelvis level and use a controlled range rather than swinging the leg.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  }
]
export const COMBINED_BATCH_EXERCISES = entries.map(defineCombinedBatches)
