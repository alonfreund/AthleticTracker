import { defineWristCurl } from './define'

export const WRIST_CURLS = [
  defineWristCurl({
    number: 1,
    name: 'Dumbbell wrist curl',
    aliases: ['Dumbbell wrist flexion', 'Palms-up dumbbell wrist curl', 'Bilateral dumbbell wrist curl'],
    family: 'wrist-curl',
    primary: ['forearms'], secondary: [],
    equipment: ['dumbbells', 'bench'],
    patterns: ['wrist-flexion'],
    type: 'isolation', load: 'dumbbells', repetitions: 'total',
    variant: { stance: 'seated', support: 'forearms on thighs', grip: 'supinated', execution: 'bilateral' },
    instructions: 'Sit with a dumbbell in each hand, palms up and forearms supported on your thighs. Let your hands extend past your knees. Curl both wrists together, then lower slowly.',
  }),
  defineWristCurl({
    number: 2,
    name: 'Dumbbell reverse wrist curl',
    aliases: ['Reverse dumbbell wrist curl', 'Dumbbell wrist extension', 'Palms-down dumbbell wrist curl'],
    family: 'reverse-wrist-curl',
    primary: ['forearms'], secondary: [],
    equipment: ['dumbbells', 'bench'],
    patterns: ['wrist-extension'],
    type: 'isolation', load: 'dumbbells', repetitions: 'total',
    variant: { stance: 'seated', support: 'forearms on thighs', grip: 'pronated', execution: 'bilateral' },
    instructions: 'Sit with a light dumbbell in each hand, palms down and forearms supported on your thighs. Lift the backs of both hands together, then lower under control.',
  }),
]
