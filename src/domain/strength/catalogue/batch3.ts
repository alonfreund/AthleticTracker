// Batch 3: explicitly reserved IDs, individually authored entries. Never renumber or recycle.
import { defineBatchThree, type Entry } from './define'
const entries: readonly Entry[] = [
  {
    "number": 1,
    "name": "Seated dumbbell lateral raise",
    "aliases": [
      "Seated DB side raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [
      "traps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "grip": "neutral",
      "support": "bench"
    },
    "instructions": "Sit tall on a bench with dumbbells beside the thighs. Raise both arms out slightly forward of the sides with a small elbow bend, then lower without swinging the torso.",
    "notes": "Keep the seated position throughout; this is distinct from the existing standing lateral raise.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 2,
    "name": "Leaning-away dumbbell lateral raise",
    "aliases": [
      "Supported lean-away DB raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [
      "traps"
    ],
    "equipment": [
      "dumbbells",
      "rack"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing leaning away",
      "support": "free hand on rack",
      "grip": "neutral"
    },
    "instructions": "Hold a secure rack with one hand and lean slightly away while holding a dumbbell in the other. Raise the working arm out to the side, then lower without changing the lean. Repeat on the other side.",
    "notes": "Use the rack for support rather than pulling on it to move the weight.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 3,
    "name": "Side-lying incline dumbbell lateral raise",
    "aliases": [
      "Side-lying DB side raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "side lying",
      "support": "incline bench",
      "grip": "neutral"
    },
    "instructions": "Lie on your side against an incline bench with a dumbbell beside the upper hip. Raise the upper arm away from the torso through a comfortable arc, then lower slowly. Change sides.",
    "notes": "Keep the torso supported and note the bench angle for comparable sessions.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 4,
    "name": "Chest-supported dumbbell lateral raise",
    "aliases": [
      "Prone incline DB lateral raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [
      "posterior-deltoid",
      "traps"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "prone",
      "support": "incline chest pad",
      "grip": "neutral"
    },
    "instructions": "Lie chest down on a steep incline bench with the arms hanging beside the torso. Raise both dumbbells outward with elbows softly bent, then lower without lifting the chest off the pad.",
    "notes": "Use a steep incline and raise beside the torso; the flatter, rearward sweep belongs to a reverse fly.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 5,
    "name": "Behind-the-body single-arm cable lateral raise",
    "aliases": [
      "Behind-back cable side raise"
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
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "support": "none",
      "grip": "neutral",
      "execution": "cable starts behind body"
    },
    "instructions": "Stand side-on to a low pulley and take the handle in the farther hand with the cable passing behind the hips. Raise that arm outward, then return without twisting the trunk. Change sides.",
    "notes": "Use a comfortable starting position rather than forcing the arm far behind the torso.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 6,
    "name": "Lateral raise machine",
    "aliases": [
      "Selectorized side raise"
    ],
    "family": "lateral-raise",
    "primary": [
      "lateral-deltoid"
    ],
    "secondary": [
      "traps"
    ],
    "equipment": [
      "lateral-raise-machine"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine pads",
      "execution": "bilateral"
    },
    "instructions": "Adjust the seat so the shoulder area aligns with the machine pivots. Place the arms against the pads, raise them outward under control, then lower without dropping the stack.",
    "notes": "Use the same seat and pad settings when comparing sessions.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 7,
    "name": "Bilateral cable lateral raise",
    "aliases": [
      "Two-arm cable side raise"
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
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "neutral",
      "execution": "two arms crossed low cables"
    },
    "instructions": "Stand between two low pulleys holding the opposite handles with cables crossed in front. Raise both arms out to the sides with a small elbow bend, then lower smoothly.",
    "notes": "Use equal stack settings and record one working stack, not their sum.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 8,
    "name": "Barbell front raise",
    "aliases": [
      "BB anterior raise"
    ],
    "family": "front-raise",
    "primary": [
      "anterior-deltoid"
    ],
    "secondary": [],
    "equipment": [
      "barbell"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "pronated",
      "execution": "bilateral"
    },
    "instructions": "Stand holding a barbell in front of the thighs with an overhand grip. Raise it forward to around shoulder height with softly bent elbows, then lower without leaning backward.",
    "notes": "Use a load that allows the torso to stay still.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 9,
    "name": "Plate front raise",
    "aliases": [
      "Weight-plate anterior raise"
    ],
    "family": "front-raise",
    "primary": [
      "anterior-deltoid"
    ],
    "secondary": [],
    "equipment": [
      "weight-plate"
    ],
    "patterns": [
      "shoulder-raise"
    ],
    "load": "plates-held",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "both hands on plate",
      "execution": "bilateral"
    },
    "instructions": "Hold a weight plate securely at its sides in front of the thighs. Raise it forward to around shoulder height, then lower under control with a small fixed elbow bend.",
    "notes": "Record the plate weight once, not once for each hand. Keep a secure grip throughout.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 10,
    "name": "Simultaneous dumbbell front raise",
    "aliases": [
      "Two-arm DB front raise"
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
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "pronated",
      "execution": "simultaneous"
    },
    "instructions": "Stand with equal dumbbells in front of the thighs. Raise both arms forward together to around shoulder height, then lower without rocking the body or shrugging the shoulders.",
    "notes": "One simultaneous lift and lower is one rep; use the existing alternating entry for alternating arms.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 11,
    "name": "Single-arm cable front raise",
    "aliases": [
      "One-arm cable anterior raise"
    ],
    "family": "front-raise",
    "primary": [
      "anterior-deltoid"
    ],
    "secondary": [],
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
      "stance": "facing away from low pulley",
      "grip": "neutral",
      "execution": "single arm"
    },
    "instructions": "Face away from a low cable with one handle beside the working thigh. Raise the arm forward through a comfortable arc, then lower slowly without letting the cable pull the torso back. Repeat on the other side.",
    "notes": "Keep the elbow bend small and consistent.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 12,
    "name": "Cable Y raise",
    "aliases": [
      "Dual-cable Y raise"
    ],
    "family": "y-raise",
    "primary": [
      "traps"
    ],
    "secondary": [
      "rotator-cuff",
      "lateral-deltoid"
    ],
    "equipment": [
      "cable",
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "shoulder-raise",
      "scapular-movement"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing pulleys",
      "grip": "thumbs up",
      "execution": "diagonal Y"
    },
    "instructions": "Face two low pulleys holding their handles. With thumbs pointing upward, raise the arms diagonally into a Y without arching the back, then lower along the same path.",
    "notes": "Use a light load and allow the shoulder blades to move with the arms; this is not a shrug.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 13,
    "name": "Incline dumbbell Y raise",
    "aliases": [
      "Prone DB Y raise",
      "Trap-3 raise"
    ],
    "family": "y-raise",
    "primary": [
      "traps"
    ],
    "secondary": [
      "rotator-cuff",
      "lateral-deltoid"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "shoulder-raise",
      "scapular-movement"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "prone",
      "support": "incline chest pad",
      "grip": "thumbs up",
      "execution": "diagonal Y"
    },
    "instructions": "Lie chest down on an incline bench with light dumbbells. Lift both arms diagonally forward into a Y with thumbs up, then lower while keeping the ribs against the pad.",
    "notes": "Use controlled shoulder-blade movement rather than lifting the head or extending the lower back.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 14,
    "name": "Side-lying dumbbell external rotation",
    "aliases": [
      "Lying DB shoulder external rotation"
    ],
    "family": "shoulder-external-rotation",
    "primary": [
      "rotator-cuff"
    ],
    "secondary": [
      "posterior-deltoid"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "shoulder-rotation"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "side lying",
      "support": "elbow at side",
      "grip": "neutral"
    },
    "instructions": "Lie on your side with the upper elbow bent and resting against the torso. Hold a light dumbbell, rotate the forearm upward without moving the upper arm, then lower. Repeat on the other side.",
    "notes": "Keep the elbow position fixed and use a comfortable rotation range.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 15,
    "name": "Cable external rotation at side",
    "aliases": [
      "Standing cable shoulder external rotation"
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
      "stance": "standing side-on",
      "support": "elbow at side",
      "execution": "outward rotation"
    },
    "instructions": "Set the pulley near elbow height and hold the handle in the farther hand. Keep the elbow bent against the side, rotate the forearm outward, then return without turning the torso. Repeat on the other side.",
    "notes": "Use a light setting; the shoulder rotates while the upper arm stays beside the ribs.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 16,
    "name": "Cable internal rotation at side",
    "aliases": [
      "Standing cable shoulder internal rotation"
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
      "stance": "standing side-on",
      "support": "elbow at side",
      "execution": "inward rotation"
    },
    "instructions": "Set the pulley near elbow height and take the handle in the nearer hand. Hold the bent elbow against the side, rotate the forearm inward across the abdomen, then return. Repeat on the other side.",
    "notes": "Keep the torso still and avoid pulling the elbow behind the ribs.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 17,
    "name": "Dumbbell shrug",
    "aliases": [
      "DB shoulder shrug"
    ],
    "family": "shrug",
    "primary": [
      "traps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "scapular-movement"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "neutral at sides"
    },
    "instructions": "Stand holding equal dumbbells at the sides with arms long. Lift the shoulders upward without bending the elbows, pause briefly, then lower them smoothly.",
    "notes": "Do not roll the shoulders in circles or use knee drive to move the weights.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 18,
    "name": "Barbell shrug",
    "aliases": [
      "BB shoulder shrug"
    ],
    "family": "shrug",
    "primary": [
      "traps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "barbell"
    ],
    "patterns": [
      "scapular-movement"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "pronated in front"
    },
    "instructions": "Hold a barbell in front of the thighs with straight arms. Raise the shoulders upward while standing tall, then lower under control without bending the elbows.",
    "notes": "Keep the bar close and the neck neutral; avoid rolling the shoulders backward.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 19,
    "name": "Barbell curl",
    "aliases": [
      "BB biceps curl",
      "Straight-bar curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "barbell"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "supinated straight bar",
      "execution": "simultaneous"
    },
    "instructions": "Stand holding a barbell with palms forward and elbows near the ribs. Curl by bending the elbows, then lower to a controlled arm extension without leaning backward.",
    "notes": "Choose a grip width that keeps the wrists comfortable.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 20,
    "name": "EZ-bar curl",
    "aliases": [
      "EZ biceps curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "ez-bar"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "semi-supinated EZ bar",
      "execution": "simultaneous"
    },
    "instructions": "Hold an EZ bar at the angled grips and stand tall. Curl the bar while keeping the upper arms near the sides, then lower without dropping or swinging the load.",
    "notes": "Include the actual EZ-bar mass in the recorded total; bar weights vary.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 21,
    "name": "Barbell reverse curl",
    "aliases": [
      "Pronated barbell curl"
    ],
    "family": "curl",
    "primary": [
      "forearms"
    ],
    "secondary": [
      "biceps"
    ],
    "equipment": [
      "barbell"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "pronated straight bar",
      "execution": "simultaneous"
    },
    "instructions": "Stand holding a barbell with palms down and wrists straight. Bend the elbows to raise the bar without moving the upper arms forward, then lower slowly.",
    "notes": "Use a lighter load than a supinated curl and avoid letting the wrists fold.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 22,
    "name": "EZ-bar reverse curl",
    "aliases": [
      "Pronated EZ curl"
    ],
    "family": "curl",
    "primary": [
      "forearms"
    ],
    "secondary": [
      "biceps"
    ],
    "equipment": [
      "ez-bar"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "semi-pronated EZ bar",
      "execution": "simultaneous"
    },
    "instructions": "Hold the EZ bar overhand on its angled grips. Curl while keeping the upper arms steady and wrists aligned, then lower with control.",
    "notes": "Record the actual EZ-bar mass plus plates; keep the chosen grip consistent.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 23,
    "name": "Alternating dumbbell curl",
    "aliases": [
      "Alternating DB biceps curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "supinating",
      "execution": "alternating"
    },
    "instructions": "Stand with equal dumbbells at the sides. Curl one arm while turning its palm upward, lower it smoothly, then alternate arms without swinging the torso.",
    "notes": "Count reps separately for each arm, not as a combined alternating total.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 24,
    "name": "Dumbbell hammer curl",
    "aliases": [
      "DB neutral-grip curl"
    ],
    "family": "curl",
    "primary": [
      "forearms",
      "biceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "neutral",
      "execution": "simultaneous"
    },
    "instructions": "Stand holding equal dumbbells with palms facing inward. Curl both weights together while keeping that grip and the upper arms still, then lower smoothly.",
    "notes": "Keep the wrists aligned with the forearms rather than tipping the weights inward.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 25,
    "name": "Alternating dumbbell hammer curl",
    "aliases": [
      "Alternating DB neutral-grip curl"
    ],
    "family": "curl",
    "primary": [
      "forearms",
      "biceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "dumbbells",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "neutral",
      "execution": "alternating"
    },
    "instructions": "Hold equal dumbbells with palms facing each other. Curl one weight without moving the upper arm, lower it, then alternate to the other side while retaining the neutral grip.",
    "notes": "Count reps for each arm; both arms use the same dumbbell weight.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 26,
    "name": "Cross-body dumbbell hammer curl",
    "aliases": [
      "Pinwheel curl",
      "Cross-body DB curl"
    ],
    "family": "curl",
    "primary": [
      "forearms",
      "biceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "neutral",
      "execution": "single arm across torso"
    },
    "instructions": "Hold one dumbbell at the side with palm inward. Bend the elbow to bring the weight diagonally toward the opposite chest, then lower without rotating the trunk. Complete both arms.",
    "notes": "Keep the movement controlled and the wrist neutral; do not swing across the body.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 27,
    "name": "Seated dumbbell curl",
    "aliases": [
      "Seated supinated DB curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "bench",
      "grip": "supinated",
      "execution": "simultaneous"
    },
    "instructions": "Sit tall on a bench holding equal dumbbells with palms forward. Curl both weights without lifting the upper arms, then lower slowly while keeping the torso still.",
    "notes": "This entry uses simultaneous seated reps; use the alternating entry for alternating arms.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 28,
    "name": "Incline dumbbell curl",
    "aliases": [
      "Incline DB biceps curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "seated reclined",
      "support": "incline back pad",
      "grip": "supinated",
      "execution": "simultaneous"
    },
    "instructions": "Recline against an incline bench with the arms hanging beside the torso and palms forward. Curl both dumbbells without letting the elbows drift forward, then lower within a comfortable range.",
    "notes": "Keep bench angle consistent and avoid forcing the shoulders backward at the bottom.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 29,
    "name": "Incline dumbbell hammer curl",
    "aliases": [
      "Incline neutral-grip DB curl"
    ],
    "family": "curl",
    "primary": [
      "forearms",
      "biceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "seated reclined",
      "support": "incline back pad",
      "grip": "neutral",
      "execution": "simultaneous"
    },
    "instructions": "Sit against an incline backrest with palms facing inward. Curl both dumbbells while keeping the upper arms beside the torso, then lower without changing the grip or arching off the pad.",
    "notes": "Use a comfortable shoulder position and keep the bench angle consistent.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 30,
    "name": "Dumbbell concentration curl",
    "aliases": [
      "DB concentration curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated leaning forward",
      "support": "upper arm against inner thigh",
      "grip": "supinated"
    },
    "instructions": "Sit with feet apart and support the working upper arm against the inner thigh. Curl one dumbbell without moving that support point, then lower smoothly and repeat on the other arm.",
    "notes": "Do not use the thigh to bounce the weight upward.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 31,
    "name": "Single-arm dumbbell preacher curl",
    "aliases": [
      "One-arm DB preacher curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "dumbbells",
      "preacher-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "preacher pad",
      "grip": "supinated",
      "execution": "single arm"
    },
    "instructions": "Adjust a preacher bench so the upper arm rests on the pad. Curl one dumbbell with the shoulder supported, then lower without forcing the elbow into a locked position. Repeat on the other side.",
    "notes": "Keep the upper arm on the pad throughout the repetition.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 32,
    "name": "EZ-bar preacher curl",
    "aliases": [
      "EZ preacher curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "ez-bar",
      "preacher-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "preacher pad",
      "grip": "semi-supinated EZ bar",
      "execution": "simultaneous"
    },
    "instructions": "Sit at a preacher bench with both upper arms supported and take the angled EZ grips. Curl the bar, then lower slowly without lifting the elbows or dropping into the bottom range.",
    "notes": "Include EZ-bar mass in the total and re-rack before leaving the seat.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 33,
    "name": "Barbell spider curl",
    "aliases": [
      "Prone barbell curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "barbell",
      "adjustable-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "prone",
      "support": "incline chest pad",
      "grip": "supinated",
      "execution": "simultaneous"
    },
    "instructions": "Lie chest down on an incline bench with the bar hanging below the shoulders. Bend the elbows to curl without moving the upper arms, then lower while keeping the chest supported.",
    "notes": "Arrange enough clearance for the bar and a controlled way to pick it up and set it down.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 34,
    "name": "Dumbbell spider curl",
    "aliases": [
      "Prone DB curl"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "dumbbells",
      "adjustable-bench"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "prone",
      "support": "incline chest pad",
      "grip": "supinated",
      "execution": "simultaneous"
    },
    "instructions": "Lie chest down on an incline bench with equal dumbbells hanging beneath the shoulders. Curl both weights with upper arms still, then lower without lifting the chest or swinging the elbows.",
    "notes": "Keep the palms forward and leave enough clearance below the bench.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 35,
    "name": "Lying cable curl",
    "aliases": [
      "Supine low-cable curl"
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
      "cable-bar"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "supine facing low pulley",
      "support": "floor",
      "grip": "supinated"
    },
    "instructions": "Lie on your back with feet toward a low pulley and hold its bar with palms up. Keep the upper arms beside the torso, curl the handle toward the shoulders, then lower under control.",
    "notes": "Choose a distance that maintains cable tension without pulling you along the floor.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": [
      "mat"
    ]
  },
  {
    "number": 36,
    "name": "Standing cable-bar curl",
    "aliases": [
      "Low-pulley straight-bar curl"
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
      "cable-bar"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing low pulley",
      "grip": "supinated",
      "execution": "simultaneous"
    },
    "instructions": "Face a low pulley holding a straight bar with palms up. Keep elbows beside the ribs, curl the bar without leaning backward, then lower to a controlled arm extension.",
    "notes": "Keep the wrists straight rather than curling them to finish the movement.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 37,
    "name": "Rope cable hammer curl",
    "aliases": [
      "Rope neutral-grip curl"
    ],
    "family": "curl",
    "primary": [
      "forearms",
      "biceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing facing low pulley",
      "grip": "neutral rope",
      "execution": "simultaneous"
    },
    "instructions": "Hold a rope on a low pulley with palms facing inward. Bend both elbows to raise the rope ends without moving the upper arms, then lower while keeping the grip neutral.",
    "notes": "Record the single stack setting, not a separate load for each rope end.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 38,
    "name": "Single-arm cable curl",
    "aliases": [
      "One-arm low-cable curl"
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
      "cable-handle"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing low pulley",
      "grip": "supinated",
      "execution": "single arm"
    },
    "instructions": "Face a low pulley with one handle and palm forward. Keep the working elbow beside the torso, curl toward the shoulder, then lower without rotating the body. Repeat on the other side.",
    "notes": "Keep the upper arm steady rather than reaching the shoulder forward.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 39,
    "name": "Behind-the-body cable curl",
    "aliases": [
      "Bayesian curl",
      "Bayesian cable curl"
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
      "cable-handle"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "facing away from low pulley",
      "grip": "supinated",
      "execution": "single arm behind torso"
    },
    "instructions": "Face away from a low pulley and hold its handle with the upper arm slightly behind the torso. Curl by bending the elbow, then return without letting the cable pull the shoulder farther back. Repeat on both sides.",
    "notes": "Use a comfortable shoulder extension and avoid an exaggerated stretch.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 40,
    "name": "High-cable double-biceps curl",
    "aliases": [
      "Overhead cable biceps curl"
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
      "dual-cable-station",
      "cable-handle"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing between high pulleys",
      "grip": "supinated",
      "execution": "upper arms out to sides"
    },
    "instructions": "Stand between two pulleys set near head height and hold equal handles with arms out to the sides. Curl the hands toward the head while keeping the upper arms steady, then extend slowly.",
    "notes": "Use equal stack settings and record one stack. Do not turn the movement into a pulldown.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 41,
    "name": "Preacher curl machine",
    "aliases": [
      "Selectorized biceps curl machine"
    ],
    "family": "curl",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearms"
    ],
    "equipment": [
      "preacher-curl-machine"
    ],
    "patterns": [
      "elbow-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine upper-arm pad",
      "grip": "machine handles"
    },
    "instructions": "Adjust the seat so the elbows align with the machine pivots and upper arms rest on the pad. Curl the handles, then lower smoothly without lifting the arms or slamming the stack.",
    "notes": "Keep the chosen seat and grip settings consistent.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 42,
    "name": "Dumbbell Zottman curl",
    "aliases": [
      "Zottman biceps curl"
    ],
    "family": "curl",
    "primary": [
      "biceps",
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "elbow-flexion",
      "forearm-pronation",
      "forearm-supination"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "supinated up pronated down",
      "execution": "simultaneous rotating"
    },
    "instructions": "Curl both dumbbells with palms up. At the top, turn the palms downward, lower slowly with that overhand grip, then turn back at the bottom before the next curl.",
    "notes": "One up-and-down cycle is one rep; choose a load you can lower in the pronated grip.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 43,
    "name": "Rope triceps pushdown",
    "aliases": [
      "Rope pressdown"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "neutral rope",
      "execution": "pushdown"
    },
    "instructions": "Face a high pulley holding the rope ends beside the chest. Keep the upper arms near the ribs, straighten both elbows, then return without letting the shoulders swing forward.",
    "notes": "Separate the ends only as far as comfortable; record the working stack once.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 44,
    "name": "Straight-bar triceps pushdown",
    "aliases": [
      "Straight-bar pressdown"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-bar"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "pronated straight bar",
      "execution": "pushdown"
    },
    "instructions": "Take an overhand grip on a high-pulley bar. Hold the upper arms still beside the torso, extend the elbows to press down, then bend them to return under control.",
    "notes": "Keep the wrists aligned and avoid leaning bodyweight onto the bar.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 45,
    "name": "Reverse-grip triceps pushdown",
    "aliases": [
      "Underhand cable pressdown"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-bar"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "standing",
      "grip": "supinated straight bar",
      "execution": "pushdown"
    },
    "instructions": "Hold a high-pulley bar with palms up and elbows near the ribs. Straighten the elbows while keeping the grip secure, then return slowly without moving the upper arms.",
    "notes": "Use a light enough setting to keep the wrists comfortable; an underhand grip does not isolate a separate triceps head.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 46,
    "name": "Single-arm cable triceps pushdown",
    "aliases": [
      "One-arm cable pressdown"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "grip": "neutral handle",
      "execution": "single-arm pushdown"
    },
    "instructions": "Face a high pulley holding one handle with the working elbow beside the ribs. Straighten that elbow, then return with the upper arm still. Repeat on the other side.",
    "notes": "Avoid rotating the torso or pushing the shoulder down to move the stack.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 47,
    "name": "Cross-body cable triceps extension",
    "aliases": [
      "Cross-body cable press-away"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing side-on to high pulley",
      "grip": "neutral",
      "execution": "diagonal across torso"
    },
    "instructions": "Stand side-on to a high pulley with the farther hand holding the handle across the upper torso. Keep the upper arm steady and extend the elbow diagonally across and down, then return. Repeat on both sides.",
    "notes": "Choose the cable height and arm position for a comfortable elbow path; do not rotate the trunk to finish.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 48,
    "name": "Overhead rope cable triceps extension",
    "aliases": [
      "Two-arm overhead rope extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-rope"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "split stance facing away",
      "grip": "neutral rope",
      "execution": "overhead bilateral"
    },
    "instructions": "Face away from a pulley holding the rope behind the head with upper arms raised. Brace and extend both elbows, then bend them to lower the hands without flaring the ribs.",
    "notes": "Set the pulley so the cable follows a comfortable line behind the upper arms; use one stack setting.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 49,
    "name": "Single-arm overhead cable triceps extension",
    "aliases": [
      "One-arm overhead cable extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing facing away",
      "grip": "neutral",
      "execution": "overhead single arm"
    },
    "instructions": "Hold one cable handle behind the head with the upper arm raised. Keep the torso braced, straighten the working elbow, then bend it to return. Repeat on the other arm.",
    "notes": "Do not arch the lower back to gain overhead range.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 50,
    "name": "Lying cable triceps extension",
    "aliases": [
      "Cable skull crusher"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-bar",
      "bench"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "grip": "pronated cable bar",
      "execution": "lying extension"
    },
    "instructions": "Place a bench with the head toward a low pulley and lie holding its bar above the shoulders. Keep the upper arms steady, bend the elbows to bring the bar toward the head, then extend.",
    "notes": "Position the bench and cable before loading and keep the bar clear of the face.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 51,
    "name": "EZ-bar lying triceps extension",
    "aliases": [
      "EZ-bar skull crusher"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "ez-bar",
      "bench"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "grip": "semi-pronated EZ bar",
      "execution": "lying extension"
    },
    "instructions": "Lie on a bench holding an EZ bar above the shoulders. Bend the elbows to lower the bar toward or just behind the forehead, then straighten them while keeping the upper arms controlled.",
    "notes": "Use a secure grip and arrange assistance for heavy setups. Include the actual EZ-bar weight in the total.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 52,
    "name": "Barbell lying triceps extension",
    "aliases": [
      "Barbell skull crusher"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "barbell",
      "bench"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "grip": "pronated straight bar",
      "execution": "lying extension"
    },
    "instructions": "Lie on a bench with a barbell held above the shoulders. Bend the elbows to lower the bar through a comfortable path near the head, then extend without turning the movement into a press.",
    "notes": "Choose a wrist-friendly grip and use assistance when positioning or removing the bar.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 53,
    "name": "Dumbbell lying triceps extension",
    "aliases": [
      "DB skull crusher"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "grip": "neutral",
      "execution": "simultaneous lying extension"
    },
    "instructions": "Lie on a bench holding equal dumbbells above the shoulders with palms facing inward. Bend both elbows to lower the weights beside the head, then straighten them without swinging the upper arms.",
    "notes": "Keep the dumbbells clear of the face and record one dumbbell weight.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 54,
    "name": "Rolling dumbbell triceps extension",
    "aliases": [
      "Rolling DB extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "lats",
      "anterior-deltoid"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "elbow-extension",
      "shoulder-extension"
    ],
    "load": "dumbbells",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "grip": "neutral",
      "execution": "rolling extension"
    },
    "instructions": "Lie on a bench with equal dumbbells above the chest. Bend the elbows and let the upper arms roll back slightly, then reverse the arc and extend the elbows to return.",
    "notes": "This entry includes deliberate upper-arm movement, unlike a fixed-arm lying extension. Keep the rolling range controlled.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 55,
    "name": "Seated dumbbell overhead triceps extension",
    "aliases": [
      "Two-hand DB overhead extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "single-dumbbell",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "bench",
      "grip": "both hands on one dumbbell",
      "execution": "overhead bilateral"
    },
    "instructions": "Sit tall holding one dumbbell securely overhead with both hands. Bend the elbows to lower it behind the head, then straighten them while keeping the torso braced.",
    "notes": "Record the single dumbbell weight; keep a secure two-hand grip during setup and return.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 56,
    "name": "Single-arm dumbbell overhead triceps extension",
    "aliases": [
      "One-arm DB overhead extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "standing",
      "support": "none",
      "grip": "neutral",
      "execution": "overhead single arm"
    },
    "instructions": "Hold one dumbbell overhead with the upper arm controlled near the head. Bend the elbow to lower the weight behind you, then extend without arching the back. Repeat on the other arm.",
    "notes": "Use a comfortable shoulder position; the free hand may steady the working upper arm.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 57,
    "name": "Single-arm dumbbell triceps kickback",
    "aliases": [
      "DB kickback"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "hinged",
      "support": "free hand on bench",
      "grip": "neutral",
      "execution": "single-arm kickback"
    },
    "instructions": "Support the free hand on a bench and hinge with the working upper arm beside the torso. Straighten that elbow to move the dumbbell back, then bend it slowly without dropping the upper arm.",
    "notes": "Keep the shoulder still rather than swinging the entire arm.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 58,
    "name": "Single-arm cable triceps kickback",
    "aliases": [
      "Cable kickback"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-handle"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "per-side",
    "variant": {
      "stance": "hinged facing low pulley",
      "support": "none",
      "grip": "neutral",
      "execution": "single-arm kickback"
    },
    "instructions": "Face a low pulley in a hip hinge with one handle and the working upper arm beside the torso. Extend the elbow backward, then return while keeping the upper arm in place. Repeat on both sides.",
    "notes": "Keep the trunk braced and the cable clear of the legs.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 59,
    "name": "Triceps extension machine",
    "aliases": [
      "Selectorized triceps extension"
    ],
    "family": "triceps-extension",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipment": [
      "triceps-extension-machine"
    ],
    "patterns": [
      "elbow-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "machine upper-arm pad",
      "grip": "machine handles"
    },
    "instructions": "Adjust the seat and upper-arm pads so the elbows align with the machine pivots. Extend both elbows against the handles, then return slowly while keeping the arms supported.",
    "notes": "This entry is an elbow-extension machine, not a seated dip-press machine.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 60,
    "name": "Barbell JM press",
    "aliases": [
      "JM press"
    ],
    "family": "triceps-extension",
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
      "elbow-extension",
      "horizontal-push"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "supine",
      "support": "flat bench",
      "grip": "close pronated",
      "execution": "hybrid press and extension"
    },
    "instructions": "Lie on a bench with a comfortably close barbell grip. Lower toward the upper chest by bending the elbows and letting them move slightly forward, then extend and press back to the start.",
    "notes": "Use a light load and safeties while learning the hybrid path; do not lower the bar onto the neck.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 61,
    "name": "Bodyweight triceps dip",
    "aliases": [
      "Upright parallel-bar dip"
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
      "parallel-bars"
    ],
    "patterns": [
      "vertical-push",
      "elbow-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "suspended",
      "support": "parallel bars",
      "execution": "upright dip"
    },
    "instructions": "Support yourself on secure parallel bars with arms straight. Keep the torso relatively upright, bend the elbows to lower through a comfortable shoulder range, then press back up without swinging.",
    "notes": "Do not force a deep bottom position; this is not a bench dip.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 62,
    "name": "Weighted triceps dip",
    "aliases": [
      "Added-weight upright dip"
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
      "parallel-bars",
      "dip-belt"
    ],
    "patterns": [
      "vertical-push",
      "elbow-extension"
    ],
    "load": "added",
    "repetitions": "total",
    "variant": {
      "stance": "suspended",
      "support": "parallel bars",
      "execution": "upright weighted dip"
    },
    "instructions": "Secure added weight to a dip belt and support yourself on parallel bars. Lower with a relatively upright torso and controlled elbows, then press back to straight arms without swinging the weight.",
    "notes": "Record added load separately from bodyweight and keep plates clear of surrounding equipment.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 63,
    "name": "Assisted dip machine",
    "aliases": [
      "Machine-assisted triceps dip"
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
      "assisted-dip-machine"
    ],
    "patterns": [
      "vertical-push",
      "elbow-extension"
    ],
    "load": "assisted",
    "repetitions": "total",
    "variant": {
      "stance": "supported suspension",
      "support": "machine assistance pad",
      "execution": "upright assisted dip"
    },
    "instructions": "Select assistance and mount the dip machine as directed. Hold the handles with torso relatively upright, lower through a comfortable range, then press up without bouncing the support pad.",
    "notes": "Record positive assistance, not added load. More assistance makes the movement easier.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 64,
    "name": "Close-grip push-up",
    "aliases": [
      "Narrow-hand push-up"
    ],
    "family": "push-up",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "chest",
      "anterior-deltoid",
      "core"
    ],
    "equipment": [],
    "patterns": [
      "horizontal-push",
      "elbow-extension",
      "anti-extension"
    ],
    "load": "bodyweight",
    "repetitions": "total",
    "variant": {
      "stance": "plank",
      "support": "hands and toes",
      "execution": "close hands"
    },
    "instructions": "Start in a firm plank with hands comfortably closer than a standard push-up. Bend the elbows close to the torso to lower the chest, then press up while keeping the body aligned.",
    "notes": "The hands need not touch. Choose a position that keeps the wrists and elbows comfortable.",
    "type": "compound",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 65,
    "name": "Seated barbell wrist curl",
    "aliases": [
      "Palms-up barbell wrist curl"
    ],
    "family": "wrist-curl",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "barbell",
      "bench"
    ],
    "patterns": [
      "wrist-flexion"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "forearms on thighs",
      "grip": "supinated straight bar"
    },
    "instructions": "Sit with forearms supported on the thighs and palms up holding a barbell beyond the knees. Flex the wrists to raise the bar through a small arc, then lower with the forearms still.",
    "notes": "Keep the bar secure in the fingers rather than rolling it out of the hands.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 66,
    "name": "Seated barbell reverse wrist curl",
    "aliases": [
      "Palms-down barbell wrist curl"
    ],
    "family": "reverse-wrist-curl",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "barbell",
      "bench"
    ],
    "patterns": [
      "wrist-extension"
    ],
    "load": "barbell",
    "repetitions": "total",
    "variant": {
      "stance": "seated",
      "support": "forearms on thighs",
      "grip": "pronated straight bar"
    },
    "instructions": "Sit with forearms supported on the thighs and palms down holding a light barbell. Extend the wrists to lift the knuckles, then lower slowly without moving the elbows.",
    "notes": "Use a small comfortable range and keep the grip secure.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 67,
    "name": "Single-arm dumbbell wrist curl",
    "aliases": [
      "One-arm DB wrist flexion"
    ],
    "family": "wrist-curl",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "wrist-flexion"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "forearm on thigh",
      "grip": "supinated",
      "execution": "single arm"
    },
    "instructions": "Support one forearm on the thigh with palm up and wrist just beyond the knee. Curl one dumbbell using the wrist alone, then lower slowly. Repeat on the other side.",
    "notes": "Keep the forearm supported and do not roll the dumbbell out of the fingers.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 68,
    "name": "Single-arm dumbbell reverse wrist curl",
    "aliases": [
      "One-arm DB wrist extension"
    ],
    "family": "reverse-wrist-curl",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "wrist-extension"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "forearm on thigh",
      "grip": "pronated",
      "execution": "single arm"
    },
    "instructions": "Support the forearm on the thigh with palm down and a light dumbbell beyond the knee. Lift the back of the hand through wrist extension, then lower with control. Repeat on the other side.",
    "notes": "Do not lift the whole forearm to compensate for a heavy weight.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 69,
    "name": "Seated cable wrist curl",
    "aliases": [
      "Cable wrist flexion"
    ],
    "family": "wrist-curl",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-bar",
      "bench"
    ],
    "patterns": [
      "wrist-flexion"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated facing low pulley",
      "support": "forearms on thighs",
      "grip": "supinated"
    },
    "instructions": "Sit facing a low pulley holding its bar with palms up and forearms on the thighs. Flex the wrists to draw the bar upward, then return slowly while the elbows stay still.",
    "notes": "Set the seat distance to maintain cable tension without pulling the forearms off their support.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 70,
    "name": "Seated cable reverse wrist curl",
    "aliases": [
      "Cable wrist extension"
    ],
    "family": "reverse-wrist-curl",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "cable",
      "cable-bar",
      "bench"
    ],
    "patterns": [
      "wrist-extension"
    ],
    "load": "stack",
    "repetitions": "total",
    "variant": {
      "stance": "seated facing low pulley",
      "support": "forearms on thighs",
      "grip": "pronated"
    },
    "instructions": "Sit facing a low pulley holding the bar palms down with forearms supported on the thighs. Lift the knuckles through wrist extension, then lower without moving the elbows.",
    "notes": "Use a light stack setting and keep the wrists within a comfortable range.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 71,
    "name": "Dumbbell forearm pronation",
    "aliases": [
      "DB palm-down rotation"
    ],
    "family": "forearm-pronation",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "forearm-pronation"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "forearm on thigh",
      "grip": "offset near one end",
      "execution": "palm-down rotation"
    },
    "instructions": "Support the forearm with the elbow bent and hold a light dumbbell near one end. Start with the weighted end upright, rotate toward palm-down under control, then return to upright. Repeat on both sides.",
    "notes": "Record the dumbbell mass and note grip position; changing the lever length changes difficulty without changing weight.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 72,
    "name": "Dumbbell forearm supination",
    "aliases": [
      "DB palm-up rotation"
    ],
    "family": "forearm-supination",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "forearm-supination"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "forearm on thigh",
      "grip": "offset near one end",
      "execution": "palm-up rotation"
    },
    "instructions": "Support the forearm with elbow bent and hold a light dumbbell near one end. Start with the weighted end upright, rotate toward palm-up through a comfortable arc, then return. Repeat on both sides.",
    "notes": "Keep the elbow still. Record mass and grip position rather than treating different lever lengths as equal resistance.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 73,
    "name": "Dumbbell wrist radial deviation",
    "aliases": [
      "DB hammer wrist raise"
    ],
    "family": "wrist-radial-deviation",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "patterns": [
      "wrist-radial-deviation"
    ],
    "load": "single-dumbbell",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated",
      "support": "forearm on thigh",
      "grip": "thumb up offset",
      "execution": "thumb-side wrist raise"
    },
    "instructions": "Support the forearm with the thumb facing upward and hold a light dumbbell near one end. Tilt the wrist toward the thumb side to raise the weighted end, then lower without moving the forearm. Repeat on both sides.",
    "notes": "Use a short controlled range and note grip position because lever length affects difficulty.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  },
  {
    "number": 74,
    "name": "Dumbbell farmer hold",
    "aliases": [
      "Static DB farmer hold"
    ],
    "family": "grip-hold",
    "primary": [
      "forearms"
    ],
    "secondary": [
      "traps",
      "core"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "grip"
    ],
    "load": "dumbbells",
    "repetitions": "unspecified",
    "variant": {
      "stance": "standing",
      "grip": "neutral at sides",
      "execution": "bilateral timed hold"
    },
    "instructions": "Stand tall holding equal dumbbells at the sides with arms long. Keep the weights still and wrists neutral for the planned time, then set them down under control.",
    "notes": "Hold in place; this entry measures time, not carry distance. Record one dumbbell weight.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 75,
    "name": "Dumbbell suitcase hold",
    "aliases": [
      "Single-arm static DB hold"
    ],
    "family": "grip-hold",
    "primary": [
      "forearms"
    ],
    "secondary": [
      "core",
      "traps"
    ],
    "equipment": [
      "dumbbells"
    ],
    "patterns": [
      "grip",
      "lateral-stability"
    ],
    "load": "single-dumbbell",
    "repetitions": "unspecified",
    "variant": {
      "stance": "standing",
      "grip": "neutral at one side",
      "execution": "single-arm timed hold"
    },
    "instructions": "Stand with one dumbbell beside the thigh and shoulders level. Hold without leaning or letting the wrist fold, then set it down safely and repeat on the other side.",
    "notes": "Duration is per side. Use equal hold times; log sides as separate sets with side notes if they differ.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 76,
    "name": "Double-overhand barbell hold",
    "aliases": [
      "Static barbell grip hold"
    ],
    "family": "grip-hold",
    "primary": [
      "forearms"
    ],
    "secondary": [
      "traps",
      "core"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "patterns": [
      "grip"
    ],
    "load": "barbell",
    "repetitions": "unspecified",
    "variant": {
      "stance": "standing",
      "grip": "double pronated in front",
      "execution": "bilateral timed hold"
    },
    "instructions": "Set a bar on rack pins near standing hand height. Grip it with both palms down, lift just clear of the pins and hold with straight arms, then return it gently to the supports.",
    "notes": "Use a double-overhand grip without straps for consistent grip tracking. This measures hold time, not repetitions.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 77,
    "name": "Single-hand plate pinch hold",
    "aliases": [
      "Plate pinch grip hold"
    ],
    "family": "grip-hold",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "weight-plate"
    ],
    "patterns": [
      "grip"
    ],
    "load": "plates-held",
    "repetitions": "unspecified",
    "variant": {
      "stance": "standing",
      "grip": "single-hand plate pinch",
      "execution": "single-arm timed hold"
    },
    "instructions": "Pinch a suitable plate or matching smooth-sided plates between the thumb and fingers of one hand. Lift clear of the floor, hold without resting against the leg, then set down and change hands.",
    "notes": "Duration is per hand. Record the combined plate mass in the working hand and note plate thickness; keep the drop area clear.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": []
  },
  {
    "number": 78,
    "name": "Dead hang",
    "aliases": [
      "Passive bar hang"
    ],
    "family": "hang",
    "primary": [
      "forearms"
    ],
    "secondary": [
      "rotator-cuff"
    ],
    "equipment": [
      "pull-up-bar"
    ],
    "patterns": [
      "grip"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "hanging",
      "grip": "pronated",
      "execution": "straight-arm timed hang"
    },
    "instructions": "Take a secure overhand grip on a pull-up bar with room for the feet to clear. Hang with straight elbows in a comfortable shoulder position for the planned time, then step down under control.",
    "notes": "This is a timed hang, not scapular pull-up repetitions. Avoid forcing a painful passive shoulder range.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": [
      "platform"
    ]
  },
  {
    "number": 79,
    "name": "Towel hang",
    "aliases": [
      "Grip towel dead hang"
    ],
    "family": "hang",
    "primary": [
      "forearms"
    ],
    "secondary": [
      "rotator-cuff"
    ],
    "equipment": [
      "pull-up-bar",
      "towel"
    ],
    "patterns": [
      "grip"
    ],
    "load": "bodyweight",
    "repetitions": "unspecified",
    "variant": {
      "stance": "hanging",
      "grip": "towel ends",
      "execution": "straight-arm timed hang"
    },
    "instructions": "Drape a strong training towel over a secure pull-up bar and grip both hanging ends. Lift the feet to hang with straight elbows, hold without swinging, then step down safely.",
    "notes": "Check towel condition and anchoring before loading it. Duration is for the two-hand hold; do not use a damaged towel.",
    "type": "stability",
    "measurement": "duration",
    "optionalEquipment": [
      "platform"
    ]
  },
  {
    "number": 80,
    "name": "Hand-gripper close",
    "aliases": [
      "Grip trainer repetitions"
    ],
    "family": "gripper-close",
    "primary": [
      "forearms"
    ],
    "secondary": [],
    "equipment": [
      "hand-gripper"
    ],
    "patterns": [
      "grip"
    ],
    "load": "gripper",
    "repetitions": "per-side",
    "variant": {
      "stance": "seated or standing",
      "grip": "one-hand gripper",
      "execution": "full close and release"
    },
    "instructions": "Place a hand gripper securely in one hand. Squeeze through its controlled closing range, then reopen slowly without dropping it. Complete the planned repetitions and repeat with the other hand.",
    "notes": "Count full closes consistently; keep model and resistance setting in notes rather than comparing nominal ratings as equivalent loads.",
    "type": "isolation",
    "measurement": "reps",
    "optionalEquipment": []
  }
]
export const BATCH_THREE_EXERCISES = entries.map(defineBatchThree)
