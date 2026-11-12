import { PUSHUP_GOAL, PUSHUP_MILESTONES } from './pushups'

export const REP_TRACKS = {
  pushups: {
    title: '100 Push-ups',
    goal: PUSHUP_GOAL,
    milestones: PUSHUP_MILESTONES,
    heading: '100 clean push-ups in one go',
    technique: 'Log standard push-ups with consistent depth, full elbow extension, and a straight body.',
  },
  pullups: {
    title: '30 Pull-ups',
    goal: 30,
    milestones: [3, 8, 15, 23, 30],
    heading: '30 clean pull-ups in a row',
    technique: 'Use an overhand grip. Start each rep with straight arms, pull until your chin clears the bar, and lower under control. Keep the reps strict and avoid swinging or kicking.',
  },
} as const

export type RepTrack = keyof typeof REP_TRACKS
