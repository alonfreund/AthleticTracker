// Batch 2: explicit permanent reservations, individually authored definitions. Never renumber.
import { defineBatchTwo, type Entry } from './define'
const entries: readonly Entry[] = [
  {
    "number": 1,
    "name": "Barbell front squat",
    "aliases": [
      "Front-rack barbell squat",
      "BB front squat"
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "front rack",
      "stance": "standing",
      "execution": "front loaded"
    },
    "instructions": "Rest the bar on the front of the shoulders inside a rack. Brace with elbows lifted, sit down between the hips, then stand while keeping the bar over the midfoot.",
    "notes": "Choose a secure front-rack grip and set the safeties before loading."
  },
  {
    "number": 2,
    "name": "Paused barbell back squat",
    "aliases": [
      "Pause back squat",
      "Paused BB squat"
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "upper back",
      "stance": "standing",
      "execution": "deliberate bottom pause"
    },
    "instructions": "Unrack the bar across the upper back and brace. Squat to a controlled depth, pause without relaxing the trunk, then stand through both feet.",
    "notes": "Keep pause length consistent between sessions; do not bounce out of the bottom."
  },
  {
    "number": 3,
    "name": "Barbell box squat",
    "aliases": [
      "BB box squat"
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
      "barbell",
      "rack",
      "squat-box"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "upper back and box",
      "stance": "standing",
      "execution": "controlled box contact"
    },
    "instructions": "Set a stable squat box behind you inside the rack. With the bar on the upper back, sit back and down to controlled contact, then stand without rocking or collapsing onto the box.",
    "notes": "Choose a repeatable box height. Keep the trunk braced on contact."
  },
  {
    "number": 4,
    "name": "Barbell pin squat",
    "aliases": [
      "Dead-start pin squat",
      "Anderson squat"
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "upper back",
      "stance": "standing",
      "execution": "dead start on pins"
    },
    "instructions": "Set the bar on rack pins at the intended squat depth. Get underneath it, brace and stand the bar up, then lower gently onto both pins and reset before the next rep.",
    "notes": "Use a conservative load and a rack that allows a secure starting position. This entry starts from the pins each rep."
  },
  {
    "number": 5,
    "name": "Safety-bar squat",
    "aliases": [
      "Safety squat bar squat",
      "SSB squat"
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
      "safety-squat-bar",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "padded safety bar",
      "stance": "standing",
      "grip": "front handles"
    },
    "instructions": "Set the safety bar pads over the shoulders and hold the front handles. Unrack, brace and squat between the hips, then stand without pulling the handles down to force the chest up.",
    "notes": "Include the actual specialty-bar mass in the recorded total; these bars vary in weight."
  },
  {
    "number": 6,
    "name": "Zercher squat",
    "aliases": [
      "Barbell Zercher squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "core",
      "biceps"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "elbow crooks",
      "stance": "standing",
      "execution": "front loaded"
    },
    "instructions": "Set the bar in a rack near waist height and cradle it in the elbow crooks. Brace, step clear and squat while keeping the load close, then stand and re-rack under control.",
    "notes": "Use a comfortable elbow position and a modest starting load. Do not lift the bar from the floor for this entry."
  },
  {
    "number": 7,
    "name": "Barbell hack squat",
    "aliases": [
      "Behind-the-legs deadlift"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "lower-back",
      "forearms"
    ],
    "equipment": [
      "barbell"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat",
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "none",
      "stance": "standing",
      "grip": "pronated behind legs",
      "execution": "floor reset"
    },
    "instructions": "Stand with a bar behind the legs and take an overhand grip. Bend the knees and hips, brace, then stand while guiding the bar close behind the legs. Lower to the floor and reset.",
    "notes": "This is the free-bar movement, not a hack squat machine. Use a range that does not force the shoulders or bar around the knees."
  },
  {
    "number": 8,
    "name": "Dumbbell goblet squat",
    "aliases": [
      "DB goblet squat"
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
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "total",
    "variant": {
      "support": "goblet at chest",
      "stance": "standing"
    },
    "instructions": "Hold one dumbbell upright close to the chest. Brace, squat between the hips with heels grounded, then stand without letting the weight drift away from the torso.",
    "notes": "Keep the dumbbell secure with both hands; record its single weight."
  },
  {
    "number": 9,
    "name": "Double-dumbbell front squat",
    "aliases": [
      "DB front squat",
      "Two-dumbbell front squat"
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
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "support": "two dumbbells at shoulders",
      "stance": "standing"
    },
    "instructions": "Hold two equal dumbbells at the shoulders with elbows forward. Brace, squat down between the hips, then stand while keeping both weights supported near the shoulders.",
    "notes": "Use a consistent shoulder-rack position rather than holding the weights at the sides."
  },
  {
    "number": 10,
    "name": "Dumbbell suitcase squat",
    "aliases": [
      "DB side-loaded squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "support": "none",
      "stance": "standing",
      "grip": "neutral at sides"
    },
    "instructions": "Stand with equal dumbbells beside the thighs. Bend the knees and hips to squat while keeping the weights beside the body, then stand without shrugging or swinging them.",
    "notes": "This is a knee-bending squat, not a Romanian deadlift. Keep the handles clear of the legs."
  },
  {
    "number": 11,
    "name": "Heels-elevated dumbbell goblet squat",
    "aliases": [
      "Heel-raised DB goblet squat"
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
      "dumbbells",
      "heel-wedge"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "total",
    "variant": {
      "support": "goblet at chest",
      "stance": "heels elevated"
    },
    "instructions": "Place both heels on a stable wedge and hold a dumbbell at the chest. Squat with knees following the toes and the torso controlled, then stand while maintaining foot contact.",
    "notes": "Use a secure wedge, not loose objects. Keep the elevation consistent for comparison."
  },
  {
    "number": 12,
    "name": "Dumbbell sumo squat",
    "aliases": [
      "Wide-stance DB squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes",
      "adductors"
    ],
    "secondary": [
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "total",
    "variant": {
      "grip": "both hands on one dumbbell",
      "stance": "wide toes turned out",
      "support": "none"
    },
    "instructions": "Take a comfortable wide stance with toes turned out and hold one dumbbell between the legs. Bend the hips and knees, lower between the thighs, then stand without rounding the back.",
    "notes": "Choose stance width from your comfortable range rather than forcing an extreme turnout."
  },
  {
    "number": 13,
    "name": "Bodyweight squat",
    "aliases": [
      "Air squat",
      "Unloaded squat"
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
    "equipment": [],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "support": "none",
      "stance": "standing",
      "execution": "unloaded"
    },
    "instructions": "Stand with feet in a comfortable squat stance. Brace lightly, sit down between the hips with heels supported, then return to standing under control.",
    "notes": "Use a depth you can control; no external load is required."
  },
  {
    "number": 14,
    "name": "Bodyweight box squat",
    "aliases": [
      "Sit-to-stand squat",
      "Unloaded box squat"
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
      "squat-box"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "support": "box",
      "stance": "standing",
      "execution": "controlled sit to stand"
    },
    "instructions": "Stand in front of a stable box or seat. Lower to a controlled seated contact, then stand through both feet without pushing off with the hands.",
    "notes": "Use a box height that permits control and keep that height consistent."
  },
  {
    "number": 15,
    "name": "Smith machine squat",
    "aliases": [
      "Smith back squat"
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
      "smith-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "support": "Smith bar upper back",
      "stance": "standing"
    },
    "instructions": "Set Smith stops and position the bar across the upper back. Choose a foot position that follows the rail path comfortably, unlock, squat and stand before re-locking the bar.",
    "notes": "Check the path unloaded first; rail angles and carriage resistance differ between machines."
  },
  {
    "number": 16,
    "name": "Smith machine front squat",
    "aliases": [
      "Smith front squat"
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
      "smith-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "support": "Smith bar front rack",
      "stance": "standing"
    },
    "instructions": "Position the Smith bar on the fronts of the shoulders with a secure front rack. Set stops, test the rail path, then unlock, squat and press through the feet to stand.",
    "notes": "Do not force the wrists or shoulders to fit an unsuitable rail path."
  },
  {
    "number": 17,
    "name": "45-degree leg press",
    "aliases": [
      "Incline sled leg press",
      "Plate-loaded incline leg press"
    ],
    "family": "leg-press",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors"
    ],
    "equipment": [
      "incline-leg-press-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "angle": "45 degrees",
      "support": "back pad",
      "stance": "bilateral footplate"
    },
    "instructions": "Sit against the back pad and place both feet on the sled plate. Release the safeties, lower until you can keep the pelvis supported, then press the sled away without snapping the knees straight.",
    "notes": "Record added plates only, excluding the sled. Re-engage the machine safeties before leaving."
  },
  {
    "number": 18,
    "name": "Horizontal leg press machine",
    "aliases": [
      "Seated selectorized leg press"
    ],
    "family": "leg-press",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors"
    ],
    "equipment": [
      "horizontal-leg-press-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "angle": "horizontal",
      "support": "back pad",
      "stance": "bilateral footplate"
    },
    "instructions": "Adjust the seat on a horizontal selectorized leg press. Keep the back and pelvis against the pad, press through both feet, then bend the knees to return the stack slowly.",
    "notes": "Use the displayed stack setting and keep seat and foot positions consistent."
  },
  {
    "number": 19,
    "name": "Single-leg 45-degree leg press",
    "aliases": [
      "Unilateral incline leg press"
    ],
    "family": "leg-press",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors"
    ],
    "equipment": [
      "incline-leg-press-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "per-side",
    "variant": {
      "angle": "45 degrees",
      "support": "back pad",
      "stance": "single leg footplate",
      "execution": "single leg"
    },
    "instructions": "Set a conservative sled load and place one foot securely on the plate. Keep the pelvis square against the pad, lower under control and press away, then repeat with the other leg.",
    "notes": "Use the same plate load for each leg and record all added plates, not half the sled load. Use both legs to secure or release safeties as needed."
  },
  {
    "number": 20,
    "name": "Hack squat machine",
    "aliases": [
      "Plate-loaded hack squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors"
    ],
    "equipment": [
      "hack-squat-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "support": "back and shoulder pads",
      "stance": "machine footplate",
      "execution": "sled guided"
    },
    "instructions": "Set the shoulder pads and feet on a hack squat machine. Release the stops, bend the knees while keeping the back supported, then stand along the sled path and re-engage the stops.",
    "notes": "Choose a controlled depth without the pelvis peeling off the pad; exclude sled mass from the recorded plates."
  },
  {
    "number": 21,
    "name": "Pendulum squat machine",
    "aliases": [
      "Plate-loaded pendulum squat"
    ],
    "family": "squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors"
    ],
    "equipment": [
      "pendulum-squat-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "support": "back and shoulder pads",
      "stance": "machine footplate",
      "execution": "pendulum arc"
    },
    "instructions": "Fit the shoulder and back pads on a pendulum squat machine and place the feet securely. Release its catch, squat along the arc, then stand while staying against the pads.",
    "notes": "Follow the machine setup and catch instructions. Its lever arc differs from a linear hack squat sled."
  },
  {
    "number": 22,
    "name": "Belt squat machine",
    "aliases": [
      "Plate-loaded belt squat"
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
      "belt-squat-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "support": "hip belt",
      "stance": "machine platform",
      "execution": "belt loaded"
    },
    "instructions": "Fasten the machine belt around the hips and attach it as directed. Stand to release the support, squat while keeping the belt load centred, then stand and secure the support before unclipping.",
    "notes": "This entry is for a plate-loaded machine with its own belt; count the added plates, not your bodyweight."
  },
  {
    "number": 23,
    "name": "Landmine squat",
    "aliases": [
      "Landmine goblet squat"
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
      "barbell",
      "landmine-attachment"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "landmine",
    "repetitions": "total",
    "variant": {
      "support": "bar sleeve at chest",
      "stance": "facing anchor"
    },
    "instructions": "Hold the free end of an anchored bar at the chest with both hands. Squat while allowing the bar to follow its arc, then stand without leaning back to finish.",
    "notes": "Use a secure landmine attachment and leave room for the plate arc."
  },
  {
    "number": 24,
    "name": "Barbell cyclist squat",
    "aliases": [
      "Heel-elevated narrow-stance barbell squat"
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
      "barbell",
      "rack",
      "heel-wedge"
    ],
    "optionalEquipment": [],
    "patterns": [
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "upper back",
      "stance": "narrow heels elevated"
    },
    "instructions": "Set both heels on a stable wedge inside the rack and place the bar on the upper back. Squat with a comfortably narrow stance and controlled knee travel, then stand without shifting off the wedge.",
    "notes": "Do not force feet together. Keep wedge height and stance consistent; use safeties."
  },
  {
    "number": 25,
    "name": "Conventional barbell deadlift",
    "aliases": [
      "Conventional deadlift",
      "BB deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "hamstrings",
      "quadriceps"
    ],
    "secondary": [
      "lower-back",
      "lats",
      "forearms",
      "core"
    ],
    "equipment": [
      "barbell"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "hip width",
      "support": "none",
      "execution": "conventional floor reset"
    },
    "instructions": "Stand with the bar over the midfoot and grip just outside the legs. Brace, take tension out of the bar and push through the floor to stand. Lower close to the legs and reset on the floor.",
    "notes": "Finish tall without leaning back. This entry starts from the floor, unlike the existing Romanian deadlift."
  },
  {
    "number": 26,
    "name": "Sumo barbell deadlift",
    "aliases": [
      "Sumo deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "quadriceps",
      "adductors"
    ],
    "secondary": [
      "hamstrings",
      "lower-back",
      "forearms",
      "core"
    ],
    "equipment": [
      "barbell"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "wide toes turned out",
      "grip": "inside legs",
      "execution": "floor reset"
    },
    "instructions": "Stand wide with toes comfortably turned out and grip the bar inside the legs. Brace and drive the feet into the floor to stand, then lower the bar close to the shins and reset.",
    "notes": "Keep the knees following the toes; avoid forcing a wider stance than you can control."
  },
  {
    "number": 27,
    "name": "High-handle trap-bar deadlift",
    "aliases": [
      "High-handle hex-bar deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "quadriceps"
    ],
    "secondary": [
      "hamstrings",
      "lower-back",
      "forearms",
      "core"
    ],
    "equipment": [
      "trap-bar"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "inside trap bar",
      "grip": "high neutral handles",
      "execution": "floor reset"
    },
    "instructions": "Stand centred inside a trap bar with raised handles. Bend knees and hips, brace and grip both high handles, then stand evenly. Lower both sides to the floor together and reset.",
    "notes": "Record the actual trap-bar mass plus plates. High handles shorten the range compared with low handles."
  },
  {
    "number": 28,
    "name": "Low-handle trap-bar deadlift",
    "aliases": [
      "Low-handle hex-bar deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "quadriceps"
    ],
    "secondary": [
      "hamstrings",
      "lower-back",
      "forearms",
      "core"
    ],
    "equipment": [
      "trap-bar"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "squat"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "inside trap bar",
      "grip": "low neutral handles",
      "execution": "floor reset"
    },
    "instructions": "Stand centred inside a trap bar and use the low handles. Brace before lifting, extend hips and knees to stand, then lower both sides evenly to the floor and reset.",
    "notes": "Use a load appropriate to the deeper starting position. Record the actual bar mass plus plates."
  },
  {
    "number": 29,
    "name": "Barbell rack pull",
    "aliases": [
      "Rack deadlift",
      "Partial deadlift from pins"
    ],
    "family": "deadlift",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "lower-back",
      "traps",
      "forearms",
      "core"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "rack pins at start",
      "stance": "hip width",
      "execution": "elevated dead start"
    },
    "instructions": "Set the bar on rack pins at a repeatable height. Grip and brace with the bar near the legs, extend the hips to stand, then return gently to the pins and reset.",
    "notes": "Record pin height in notes. Avoid pulling backward into an exaggerated lumbar extension."
  },
  {
    "number": 30,
    "name": "Deficit barbell deadlift",
    "aliases": [
      "Conventional deficit deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "hamstrings",
      "quadriceps"
    ],
    "secondary": [
      "lower-back",
      "lats",
      "forearms",
      "core"
    ],
    "equipment": [
      "barbell",
      "platform"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "hip width on low platform",
      "execution": "conventional floor reset"
    },
    "instructions": "Stand on a low stable platform with the bar on the floor. Grip outside the legs, brace and stand while keeping the bar close, then lower and reset without losing the longer starting position.",
    "notes": "Use only a modest deficit that lets you maintain control; do not stack unstable plates beneath the feet."
  },
  {
    "number": 31,
    "name": "Paused barbell deadlift",
    "aliases": [
      "Pause conventional deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "hamstrings",
      "quadriceps"
    ],
    "secondary": [
      "lower-back",
      "lats",
      "forearms",
      "core"
    ],
    "equipment": [
      "barbell"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "hip width",
      "execution": "pause below knee"
    },
    "instructions": "Start a conventional deadlift and pause briefly with the bar below the knees. Keep the trunk braced and bar close, finish standing, then lower to the floor and reset.",
    "notes": "Keep the pause position and duration consistent; do not rest the bar on the legs during the pause."
  },
  {
    "number": 32,
    "name": "Dumbbell deadlift",
    "aliases": [
      "DB floor deadlift"
    ],
    "family": "deadlift",
    "primary": [
      "glutes",
      "quadriceps",
      "hamstrings"
    ],
    "secondary": [
      "lower-back",
      "forearms",
      "core"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "squat"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "neutral at sides",
      "execution": "floor reset"
    },
    "instructions": "Place equal dumbbells beside the feet. Bend knees and hips to grip them, brace and stand through the floor, then lower both weights to the starting position and reset.",
    "notes": "Small dumbbells require a deep start. Use suitable fixed-height supports if needed and note the starting height; do not round the back to reach the floor."
  },
  {
    "number": 33,
    "name": "Dumbbell Romanian deadlift",
    "aliases": [
      "DB RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "dumbbells in front",
      "execution": "Romanian top start"
    },
    "instructions": "Start standing with equal dumbbells in front of the thighs. Soften the knees and send the hips back, keeping the weights close. Stop at a controlled hamstring stretch and stand by bringing the hips forward.",
    "notes": "Maintain a small knee bend; touching the floor is not required."
  },
  {
    "number": 34,
    "name": "Single-leg dumbbell Romanian deadlift",
    "aliases": [
      "Single-leg DB RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core",
      "abductors"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "lateral-stability"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg",
      "grip": "two dumbbells",
      "execution": "Romanian top start"
    },
    "instructions": "Hold equal dumbbells and balance on one leg with a soft knee. Hinge at that hip as the other leg extends behind, then return to standing without opening the pelvis sideways. Repeat on the other side.",
    "notes": "This entry uses two dumbbells. Record one dumbbell weight and reps per working leg."
  },
  {
    "number": 35,
    "name": "Kickstand dumbbell Romanian deadlift",
    "aliases": [
      "B-stance DB RDL",
      "Staggered-stance DB RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "kickstand",
      "grip": "two dumbbells",
      "execution": "Romanian top start"
    },
    "instructions": "Hold equal dumbbells with one foot forward and the other toes lightly behind. Keep most weight on the front leg, hinge the hips back, then stand through that leg. Switch the stance for the other side.",
    "notes": "The rear toes provide balance rather than a second equally loaded working leg."
  },
  {
    "number": 36,
    "name": "Single-leg barbell Romanian deadlift",
    "aliases": [
      "Single-leg barbell RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core",
      "abductors"
    ],
    "equipment": [
      "barbell"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "lateral-stability"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg",
      "grip": "pronated",
      "execution": "Romanian top start"
    },
    "instructions": "Start standing with a barbell and shift onto one leg. Hinge while letting the free leg travel behind, keep the bar close, then return without twisting the pelvis. Repeat on the other leg.",
    "notes": "Use a light load until balance is controlled. Start and finish with the bar securely supported when changing position."
  },
  {
    "number": 37,
    "name": "Barbell good morning",
    "aliases": [
      "Standing good morning",
      "BB good morning"
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "upper back",
      "stance": "standing"
    },
    "instructions": "Unrack a bar onto the upper back and soften the knees. Brace and push the hips back as the torso inclines, then extend the hips to return upright while keeping the bar secure.",
    "notes": "Use rack safeties and a conservative range; do not turn the return into a back hyperextension."
  },
  {
    "number": 38,
    "name": "Seated barbell good morning",
    "aliases": [
      "Seated good morning"
    ],
    "family": "good-morning",
    "primary": [
      "glutes",
      "lower-back"
    ],
    "secondary": [
      "adductors",
      "core"
    ],
    "equipment": [
      "barbell",
      "rack",
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "upper back and bench",
      "stance": "seated feet wide"
    },
    "instructions": "Sit on a stable bench inside the rack with a light bar on the upper back. Brace and hinge forward from the hips with feet planted, then bring the torso upright without bouncing.",
    "notes": "Use a short controlled range and set safeties. Bent knees reduce hamstring stretch compared with the standing version."
  },
  {
    "number": 39,
    "name": "Safety-bar good morning",
    "aliases": [
      "SSB good morning"
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
      "safety-squat-bar",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "support": "padded safety bar",
      "stance": "standing",
      "grip": "front handles"
    },
    "instructions": "Set the safety bar pads on the shoulders and hold its handles. Soften the knees, hinge the hips backward while braced, then stand without yanking the handles down.",
    "notes": "Use rack safeties and include the actual safety-bar mass in the total load."
  },
  {
    "number": 40,
    "name": "Smith machine Romanian deadlift",
    "aliases": [
      "Smith RDL"
    ],
    "family": "deadlift",
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
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "support": "Smith rails",
      "execution": "Romanian top start"
    },
    "instructions": "Set the Smith bar near thigh height and test the rail path. Unlock, soften the knees and hinge the hips back while keeping the bar near the legs, then stand and re-lock under control.",
    "notes": "Choose foot position to suit the rails and use stops; a floor touch is not the goal."
  },
  {
    "number": 41,
    "name": "Cable pull-through",
    "aliases": [
      "Rope hip pull-through"
    ],
    "family": "pull-through",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core"
    ],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "facing away from low pulley",
      "grip": "rope between legs"
    },
    "instructions": "Face away from a low pulley and hold the rope between the legs. Step clear, hinge backward through the hips, then stand by driving the hips forward while keeping the arms long.",
    "notes": "Move through the hips rather than squatting or pulling the rope with the arms. Avoid leaning back at the finish."
  },
  {
    "number": 42,
    "name": "Cable Romanian deadlift",
    "aliases": [
      "Cable RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core"
    ],
    "equipment": [
      "cable",
      "cable-bar"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "facing low pulley",
      "grip": "pronated cable bar",
      "execution": "Romanian top start"
    },
    "instructions": "Face a low pulley holding a bar attachment in front of the thighs. Keep the knees softly bent and arms long as the hips hinge back, then extend the hips to stand.",
    "notes": "Maintain enough distance for cable tension without being pulled off balance; do not row the handle."
  },
  {
    "number": 43,
    "name": "Single-leg cable Romanian deadlift",
    "aliases": [
      "Single-leg cable RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core",
      "abductors"
    ],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "anti-rotation"
    ],
    "type": "compound",
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg facing low pulley",
      "grip": "opposite hand",
      "execution": "Romanian top start"
    },
    "instructions": "Face a low pulley with the handle in the hand opposite the working leg. Hinge on that leg as the free leg moves behind, then stand without rotating the hips. Repeat on the other side.",
    "notes": "Keep the cable line clear of the legs and use a load that does not pull you forward."
  },
  {
    "number": 44,
    "name": "Landmine Romanian deadlift",
    "aliases": [
      "Landmine RDL"
    ],
    "family": "deadlift",
    "primary": [
      "hamstrings",
      "glutes"
    ],
    "secondary": [
      "lower-back",
      "core"
    ],
    "equipment": [
      "barbell",
      "landmine-attachment"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "landmine",
    "repetitions": "total",
    "variant": {
      "stance": "facing anchor",
      "grip": "both hands on sleeve",
      "execution": "Romanian top start"
    },
    "instructions": "Hold the free end of an anchored bar in front of the thighs. Soften the knees, hinge back while following the bar arc, then extend the hips to stand with the arms long.",
    "notes": "Keep the attachment secured; do not add a squat or arm pull to move a heavy load."
  },
  {
    "number": 45,
    "name": "Barbell forward lunge",
    "aliases": [
      "BB forward lunge"
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "per-side",
    "variant": {
      "support": "upper back",
      "stance": "forward step",
      "execution": "return to start"
    },
    "instructions": "Unrack a bar onto the upper back. Step forward, lower by bending both knees, then push through the front foot to return to the starting stance. Complete equal reps on both sides.",
    "notes": "Allow room to step and recover balance. Count repetitions for each leading leg, not combined steps."
  },
  {
    "number": 46,
    "name": "Barbell reverse lunge",
    "aliases": [
      "BB reverse lunge",
      "Barbell backward lunge"
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "per-side",
    "variant": {
      "support": "upper back",
      "stance": "backward step",
      "execution": "return to start"
    },
    "instructions": "Hold a racked bar on the upper back and brace. Step one foot backward, lower both knees under control, then drive through the front foot to return. Repeat for the other side.",
    "notes": "Keep the front foot grounded and leave enough room behind the rack."
  },
  {
    "number": 47,
    "name": "Barbell walking lunge",
    "aliases": [
      "BB walking lunge"
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step",
      "locomotion"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "per-side",
    "variant": {
      "support": "upper back",
      "stance": "forward travel",
      "execution": "walking"
    },
    "instructions": "Unrack the bar with space to walk. Step into a lunge, lower under control, then rise and bring the rear leg through into the next step. Maintain balance before each descent.",
    "notes": "Count working steps per leg rather than distance. Use an unobstructed path and a safe way to re-rack."
  },
  {
    "number": 48,
    "name": "Dumbbell forward lunge",
    "aliases": [
      "DB forward lunge"
    ],
    "family": "lunge",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors",
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral at sides",
      "stance": "forward step",
      "execution": "return to start"
    },
    "instructions": "Hold equal dumbbells at the sides. Step forward and lower with both knees bending, then press through the front foot to return to standing. Repeat on the other leg without swinging the weights.",
    "notes": "Keep a comfortable step length and enough width between the feet for balance."
  },
  {
    "number": 49,
    "name": "Dumbbell reverse lunge",
    "aliases": [
      "DB reverse lunge",
      "Dumbbell backward lunge"
    ],
    "family": "lunge",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors",
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral at sides",
      "stance": "backward step",
      "execution": "return to start"
    },
    "instructions": "Hold equal dumbbells beside the thighs. Step one foot backward, lower both knees, then stand through the front foot and return the rear foot to the start. Repeat on the other side.",
    "notes": "Control the backward step; do not push forcefully off the rear toes to finish."
  },
  {
    "number": 50,
    "name": "Dumbbell walking lunge",
    "aliases": [
      "DB walking lunge"
    ],
    "family": "lunge",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors",
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step",
      "locomotion"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "grip": "neutral at sides",
      "stance": "forward travel",
      "execution": "walking"
    },
    "instructions": "Carry equal dumbbells at the sides along a clear path. Step into a lunge, lower with control, then rise and step through into the next lunge without letting the weights swing.",
    "notes": "Log repetitions per leg. Distance is not measured by the current workout logger."
  },
  {
    "number": 51,
    "name": "Dumbbell lateral lunge",
    "aliases": [
      "DB side lunge"
    ],
    "family": "lunge",
    "primary": [
      "quadriceps",
      "glutes",
      "adductors"
    ],
    "secondary": [
      "abductors",
      "core"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "grip": "two dumbbells",
      "stance": "lateral step",
      "execution": "return to start"
    },
    "instructions": "Hold equal dumbbells and step to one side. Sit into the stepping hip as that knee bends and the other leg stays relatively straight, then push back to the start. Repeat on the other side.",
    "notes": "Keep the working foot grounded and use a side-step distance you can control."
  },
  {
    "number": 52,
    "name": "Bodyweight reverse lunge",
    "aliases": [
      "Unloaded reverse lunge",
      "Backward lunge"
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
    "equipment": [],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "backward step",
      "execution": "unloaded return to start"
    },
    "instructions": "Stand tall, step one foot backward and lower by bending both knees. Push through the front foot to return to standing, keeping the torso controlled. Repeat on the other leg.",
    "notes": "Choose a step width that allows balance; the rear knee does not need to strike the floor."
  },
  {
    "number": 53,
    "name": "Bodyweight walking lunge",
    "aliases": [
      "Unloaded walking lunge"
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
    "equipment": [],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step",
      "locomotion"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "forward travel",
      "execution": "unloaded walking"
    },
    "instructions": "Step forward into a lunge and lower with control. Rise through the front leg and bring the rear leg forward for the next lunge. Continue along a clear path without rushing the steps.",
    "notes": "Count repetitions per leg, not total distance or combined alternating steps."
  },
  {
    "number": 54,
    "name": "Bodyweight lateral lunge",
    "aliases": [
      "Unloaded side lunge"
    ],
    "family": "lunge",
    "primary": [
      "quadriceps",
      "glutes",
      "adductors"
    ],
    "secondary": [
      "abductors",
      "core"
    ],
    "equipment": [],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "lateral step",
      "execution": "unloaded return to start"
    },
    "instructions": "Step sideways from standing and bend the stepping knee as the hips move back. Keep the other leg long and both feet supported, then push back to the start and repeat on the other side.",
    "notes": "Lower only as far as the foot and knee remain controlled; avoid rolling onto the inner edge of the foot."
  },
  {
    "number": 55,
    "name": "Bodyweight split squat",
    "aliases": [
      "Static bodyweight lunge",
      "Unloaded split squat"
    ],
    "family": "split-squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors",
      "core"
    ],
    "equipment": [],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "stationary split stance",
      "support": "none",
      "execution": "unloaded"
    },
    "instructions": "Set a split stance with the rear heel raised and keep both feet in place. Bend both knees to lower the torso, then stand through the front foot. Change stance after the planned repetitions.",
    "notes": "This is a stationary split squat, not a stepping lunge."
  },
  {
    "number": 56,
    "name": "Dumbbell split squat",
    "aliases": [
      "DB static lunge"
    ],
    "family": "split-squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors",
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "stationary split stance",
      "grip": "neutral at sides",
      "support": "none"
    },
    "instructions": "Hold equal dumbbells at the sides and take a split stance. Lower by bending both knees without moving the feet, then stand through the front leg. Repeat with the other leg forward.",
    "notes": "Keep enough side-to-side space between the feet to stay balanced."
  },
  {
    "number": 57,
    "name": "Barbell split squat",
    "aliases": [
      "BB static lunge"
    ],
    "family": "split-squat",
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
      "barbell",
      "rack"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "stationary split stance",
      "support": "upper back"
    },
    "instructions": "Unrack the bar onto the upper back and set a stable split stance. Bend both knees to lower, then rise through the front foot while keeping the feet fixed. Reposition safely to change sides.",
    "notes": "Use rack safeties where practical and a load that allows controlled stance changes."
  },
  {
    "number": 58,
    "name": "Dumbbell rear-foot-elevated split squat",
    "aliases": [
      "Dumbbell Bulgarian split squat",
      "DB RFESS"
    ],
    "family": "split-squat",
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
      "dumbbells",
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "split stance rear foot elevated",
      "support": "rear foot on bench",
      "grip": "neutral at sides"
    },
    "instructions": "Hold equal dumbbells with the rear foot resting on a stable bench. Lower through the front hip and knee, then stand through the front foot without driving hard into the bench. Repeat on the other side.",
    "notes": "Use a bench height and foot position that let the pelvis stay controlled; the rear foot is support, not the main driver."
  },
  {
    "number": 59,
    "name": "Barbell rear-foot-elevated split squat",
    "aliases": [
      "Barbell Bulgarian split squat",
      "BB RFESS"
    ],
    "family": "split-squat",
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
      "barbell",
      "rack",
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "split stance rear foot elevated",
      "support": "upper back and rear foot on bench"
    },
    "instructions": "Set a bench and rack for a safe starting position with the bar on the upper back. Rest the rear foot on the bench, lower through the front leg and stand, then change sides under control.",
    "notes": "Use conservative loading and a secure setup; balance and safe re-racking take priority over depth."
  },
  {
    "number": 60,
    "name": "Smith machine split squat",
    "aliases": [
      "Smith static lunge"
    ],
    "family": "split-squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors"
    ],
    "equipment": [
      "smith-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "per-side",
    "variant": {
      "stance": "stationary split stance",
      "support": "Smith bar upper back"
    },
    "instructions": "Set the Smith stops and bar across the upper back. Place the feet in a split stance suited to the rails, unlock and lower with both knees bending, then stand through the front leg.",
    "notes": "Keep both feet in place during reps. Test the rail path before loading."
  },
  {
    "number": 61,
    "name": "Smith machine rear-foot-elevated split squat",
    "aliases": [
      "Smith Bulgarian split squat",
      "Smith RFESS"
    ],
    "family": "split-squat",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "adductors",
      "abductors"
    ],
    "equipment": [
      "smith-machine",
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "per-side",
    "variant": {
      "stance": "split stance rear foot elevated",
      "support": "Smith bar and rear foot on bench"
    },
    "instructions": "Place a stable bench behind the Smith bar and set stops. With the rear foot supported and bar on the upper back, lower through the front leg, then stand along the rail path. Change sides safely.",
    "notes": "Test bench distance and the unloaded path first. Do not let the bench move as you change stance."
  },
  {
    "number": 62,
    "name": "Front-foot-elevated dumbbell split squat",
    "aliases": [
      "DB deficit split squat"
    ],
    "family": "split-squat",
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
      "dumbbells",
      "platform"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "stationary split stance front foot elevated",
      "support": "front foot on platform",
      "grip": "neutral at sides"
    },
    "instructions": "Hold equal dumbbells and place the front foot on a low stable platform with rear toes on the floor. Lower both knees through a controlled range, then stand through the front foot. Repeat on the other side.",
    "notes": "Keep the entire front foot supported; extra depth is useful only while you can control it."
  },
  {
    "number": 63,
    "name": "Dumbbell step-up",
    "aliases": [
      "DB box step-up"
    ],
    "family": "step-up",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "abductors",
      "adductors",
      "core",
      "forearms"
    ],
    "equipment": [
      "dumbbells",
      "platform"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "forward step onto platform",
      "grip": "neutral at sides"
    },
    "instructions": "Hold equal dumbbells and place one whole foot on a stable platform. Stand through that leg to bring the body up, then lower the trailing foot back to the floor with control. Repeat on each side.",
    "notes": "Minimise push-off from the floor leg. One ascent and controlled return count as one rep for the leading leg."
  },
  {
    "number": 64,
    "name": "Barbell step-up",
    "aliases": [
      "BB box step-up"
    ],
    "family": "step-up",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "abductors",
      "adductors",
      "core"
    ],
    "equipment": [
      "barbell",
      "rack",
      "platform"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "forward step onto platform",
      "support": "upper back"
    },
    "instructions": "Unrack a bar onto the upper back with a stable platform nearby. Plant one whole foot on the platform, stand through that leg, then lower carefully to the floor. Repeat on the other side.",
    "notes": "Use a modest platform height and clear route to the rack; avoid bouncing off the trailing leg."
  },
  {
    "number": 65,
    "name": "Bodyweight step-up",
    "aliases": [
      "Unloaded box step-up"
    ],
    "family": "step-up",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "abductors",
      "adductors",
      "core"
    ],
    "equipment": [
      "platform"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "forward step onto platform",
      "execution": "unloaded"
    },
    "instructions": "Place one whole foot on a stable platform. Stand through that leg, bring the other foot up gently, then lower back to the floor with control. Repeat with the other leg leading.",
    "notes": "Count one ascent and return as one rep for the leading leg; use a height you can descend from smoothly."
  },
  {
    "number": 66,
    "name": "Dumbbell lateral step-up",
    "aliases": [
      "DB side step-up"
    ],
    "family": "step-up",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "abductors",
      "adductors",
      "core"
    ],
    "equipment": [
      "dumbbells",
      "platform"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "side-on to platform",
      "grip": "neutral at sides"
    },
    "instructions": "Stand beside a stable platform holding equal dumbbells. Place the nearer foot fully on top, rise through that leg, then lower the other foot back to the floor without dropping the hip. Repeat on the other side.",
    "notes": "Keep the knee aligned with the working foot and avoid jumping off the floor leg."
  },
  {
    "number": 67,
    "name": "Bodyweight step-down",
    "aliases": [
      "Forward step-down",
      "Controlled step-down"
    ],
    "family": "step-down",
    "primary": [
      "quadriceps",
      "glutes"
    ],
    "secondary": [
      "abductors",
      "adductors",
      "core"
    ],
    "equipment": [
      "platform"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg on platform",
      "execution": "controlled lowering heel tap"
    },
    "instructions": "Stand on a low platform on one leg. Bend that knee and hip to lower the free heel toward the floor in front, tap lightly, then rise through the platform leg. Repeat on the other side.",
    "notes": "Keep weight on the platform leg rather than pushing off the tapping heel; reduce height if the pelvis drops."
  },
  {
    "number": 68,
    "name": "Dumbbell curtsy lunge",
    "aliases": [
      "DB crossover reverse lunge"
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
      "dumbbells"
    ],
    "optionalEquipment": [],
    "patterns": [
      "lunge-step"
    ],
    "type": "compound",
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "diagonal backward crossover step",
      "grip": "neutral at sides",
      "execution": "return to start"
    },
    "instructions": "Hold equal dumbbells and take a small backward diagonal step behind the standing leg. Bend both knees through a comfortable range, then return through the front foot. Repeat on the other side.",
    "notes": "Keep the pelvis controlled and the front knee tracking over the foot. Avoid a deep forced crossover or twisting through the knee."
  },
  {
    "number": 69,
    "name": "Barbell hip thrust",
    "aliases": [
      "BB hip thrust"
    ],
    "family": "hip-thrust",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "optionalEquipment": [
      "bar-pad"
    ],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "feet on floor",
      "support": "upper back on bench",
      "execution": "bilateral"
    },
    "instructions": "Secure a bench and place a bar across the hip crease with upper back supported. With feet planted, lift the hips until the torso and thighs align, then lower under control without overextending the back.",
    "notes": "Keep the bench from sliding and use a comfortable bar pad. Record the bar and plates."
  },
  {
    "number": 70,
    "name": "Dumbbell hip thrust",
    "aliases": [
      "DB hip thrust"
    ],
    "family": "hip-thrust",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "total",
    "variant": {
      "stance": "feet on floor",
      "support": "upper back on bench",
      "execution": "bilateral"
    },
    "instructions": "Rest the upper back against a secured bench and hold one dumbbell across the hip crease. Drive through both feet to raise the hips, then lower while keeping the weight stable with the hands.",
    "notes": "Use one dumbbell, not a pair. Finish with ribs down rather than arching above hip extension."
  },
  {
    "number": 71,
    "name": "Smith machine hip thrust",
    "aliases": [
      "Smith hip thrust"
    ],
    "family": "hip-thrust",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core"
    ],
    "equipment": [
      "smith-machine",
      "bench"
    ],
    "optionalEquipment": [
      "bar-pad"
    ],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "smith",
    "repetitions": "total",
    "variant": {
      "stance": "feet on floor",
      "support": "upper back on bench and Smith rails",
      "execution": "bilateral"
    },
    "instructions": "Place a secured bench so the Smith bar sits comfortably over the hips. Set stops, support the upper back and unlock the bar, then raise and lower the hips along the rails.",
    "notes": "Check the unloaded path and bench clearance. Re-lock the bar before moving out."
  },
  {
    "number": 72,
    "name": "Plate-loaded hip thrust machine",
    "aliases": [
      "Glute drive machine",
      "Lever hip thrust machine"
    ],
    "family": "hip-thrust",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings"
    ],
    "equipment": [
      "hip-thrust-machine"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "plates",
    "repetitions": "total",
    "variant": {
      "stance": "machine footplate",
      "support": "machine back pad and hip restraint",
      "execution": "bilateral"
    },
    "instructions": "Adjust the back support and secure the machine hip restraint as directed. With both feet on the plate, extend the hips to raise the lever, then lower and secure the catch before getting out.",
    "notes": "Record added plates only. Lever ratios and starting resistance differ across models."
  },
  {
    "number": 73,
    "name": "Bodyweight hip thrust",
    "aliases": [
      "Unloaded bench hip thrust"
    ],
    "family": "hip-thrust",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core"
    ],
    "equipment": [
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "feet on floor",
      "support": "upper back on bench",
      "execution": "bilateral unloaded"
    },
    "instructions": "Rest the upper back against a stable bench with feet on the floor. Lift the hips until the thighs and torso align, pause with ribs down, then lower under control.",
    "notes": "No external load is required. Secure the bench so it cannot slide during the movement."
  },
  {
    "number": 74,
    "name": "Single-leg bodyweight hip thrust",
    "aliases": [
      "Unloaded single-leg bench hip thrust"
    ],
    "family": "hip-thrust",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core",
      "abductors"
    ],
    "equipment": [
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "anti-rotation"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg foot on floor",
      "support": "upper back on bench",
      "execution": "single leg unloaded"
    },
    "instructions": "Support the upper back on a secured bench and lift one foot off the floor. Drive through the planted foot to raise the hips, keep the pelvis level and lower smoothly. Repeat on the other leg.",
    "notes": "Keep the free leg controlled; reduce range if the pelvis rotates."
  },
  {
    "number": 75,
    "name": "Single-leg dumbbell hip thrust",
    "aliases": [
      "Single-leg DB bench hip thrust"
    ],
    "family": "hip-thrust",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core",
      "abductors"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "optionalEquipment": [],
    "patterns": [
      "hinge",
      "anti-rotation"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg foot on floor",
      "support": "upper back on bench",
      "execution": "single leg"
    },
    "instructions": "Support the upper back on a stable bench and secure one dumbbell across the working hip crease. Lift the other foot, extend the planted-leg hip, then lower without rotating the pelvis. Repeat on the other leg.",
    "notes": "Keep one hand on the dumbbell to stop it rolling; use the same load on each side."
  },
  {
    "number": 76,
    "name": "Barbell glute bridge",
    "aliases": [
      "BB floor hip bridge"
    ],
    "family": "glute-bridge",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core"
    ],
    "equipment": [
      "barbell"
    ],
    "optionalEquipment": [
      "bar-pad",
      "mat"
    ],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "feet on floor",
      "support": "upper back on floor",
      "execution": "bilateral"
    },
    "instructions": "Lie on the floor with knees bent and a bar across the hip crease. Brace and press through both feet to lift the hips until torso and thighs align, then lower gently to the floor.",
    "notes": "Use a comfortable pad and a controlled way to position the bar. This floor-supported movement has less range than a bench hip thrust."
  },
  {
    "number": 77,
    "name": "Dumbbell glute bridge",
    "aliases": [
      "DB floor hip bridge"
    ],
    "family": "glute-bridge",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core"
    ],
    "equipment": [
      "dumbbells"
    ],
    "optionalEquipment": [
      "mat"
    ],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "single-dumbbell",
    "repetitions": "total",
    "variant": {
      "stance": "feet on floor",
      "support": "upper back on floor",
      "execution": "bilateral"
    },
    "instructions": "Lie on the floor with knees bent and hold one dumbbell across the hip crease. Press through both feet to lift the hips while keeping the ribs down, then lower without letting the weight roll.",
    "notes": "Record the single dumbbell weight. Keep the neck relaxed on the floor."
  },
  {
    "number": 78,
    "name": "Bodyweight glute bridge",
    "aliases": [
      "Floor bridge",
      "Unloaded hip bridge"
    ],
    "family": "glute-bridge",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core"
    ],
    "equipment": [],
    "optionalEquipment": [
      "mat"
    ],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "feet on floor",
      "support": "upper back on floor",
      "execution": "bilateral unloaded"
    },
    "instructions": "Lie on the floor with knees bent and feet planted. Brace lightly, lift the hips until the thighs line up with the torso, then lower slowly while keeping the ribs from flaring.",
    "notes": "Avoid pushing through the neck or arching the lower back to gain extra height."
  },
  {
    "number": 79,
    "name": "Single-leg bodyweight glute bridge",
    "aliases": [
      "Single-leg floor bridge"
    ],
    "family": "glute-bridge",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "hamstrings",
      "core",
      "abductors"
    ],
    "equipment": [],
    "optionalEquipment": [
      "mat"
    ],
    "patterns": [
      "hinge",
      "anti-rotation"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "per-side",
    "variant": {
      "stance": "single leg foot on floor",
      "support": "upper back on floor",
      "execution": "single leg unloaded"
    },
    "instructions": "Lie on the floor with one foot planted and the other leg lifted. Raise the hips through the planted leg while keeping the pelvis level, then lower with control. Repeat on the other side.",
    "notes": "Keep the free leg still rather than swinging it to help lift the hips."
  },
  {
    "number": 80,
    "name": "Bodyweight frog pump",
    "aliases": [
      "Frog glute bridge",
      "Unloaded frog pump"
    ],
    "family": "glute-bridge",
    "primary": [
      "glutes"
    ],
    "secondary": [
      "core"
    ],
    "equipment": [],
    "optionalEquipment": [
      "mat"
    ],
    "patterns": [
      "hinge"
    ],
    "type": "compound",
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "soles together knees out",
      "support": "upper back on floor",
      "execution": "bilateral unloaded"
    },
    "instructions": "Lie on the floor with soles together and knees comfortably opened. Keep the feet close enough for control, lift the hips a short distance through hip extension, then lower without flaring the ribs.",
    "notes": "Use a comfortable hip opening; do not force the knees toward the floor. Each lift and lower is one rep."
  }
]
export const BATCH_TWO_EXERCISES = entries.map(defineBatchTwo)
