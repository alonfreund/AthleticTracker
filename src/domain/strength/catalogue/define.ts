import type { Exercise, ExerciseMetadata, Tracking } from '../models'
import { familyId } from './families'
export type LoadProfile='barbell'|'dumbbells'|'single-dumbbell'|'stack'|'plates'|'smith'|'landmine'|'bodyweight'|'added'|'assisted'|'reps-only'|'plates-held'|'gripper'|'kettlebell'|'kettlebells'|'implement'|'sled'|'unloaded'
export interface Entry {
  number:number; name:string; aliases:string[]; family:string; primary:string[]; secondary:string[]; equipment:string[]; optionalEquipment?:string[]
  patterns:string[]; type:'compound'|'isolation'|'stability'|'conditioning'; load:LoadProfile; repetitions:'total'|'per-side'|'unspecified'; measurement?:Tracking['measurement']
  variant:Partial<ExerciseMetadata['variant']>; instructions:string; notes?:string
}
const measurementNotes:Record<LoadProfile,string>={
  kettlebell:'Record the weight of the single kettlebell used.',
  kettlebells:'Record the weight of one kettlebell; use equal bells for two-arm sets.',
  implement:'Record the total mass of the ball or sandbag used, separately from bodyweight.',
  sled:'Record added plates only, excluding the unloaded sled. Note the surface and setup; friction is not estimated.',
  unloaded:'No external load is recorded. Note effort and equipment setup in workout notes.',
  'plates-held':'Record the combined weight of the plates held by the working hand or hands, excluding bodyweight.',
  gripper:'Log full close-and-release repetitions. Record gripper model and resistance setting in workout notes; do not invent a kilogram value.',
  barbell:'Record the total barbell load, including the bar and plates.',
  dumbbells:'Record the weight of one dumbbell; use equal dumbbells for two-arm sets.',
  'single-dumbbell':'Record the weight of the single dumbbell used.',
  stack:'Record the displayed setting of the working stack. For two independent stacks, use equal settings and record ONE stack, not their sum.',
  plates:'Record the total plates added to all working levers, excluding the unloaded machine.',
  smith:'Record added plates only; exclude the Smith carriage rather than estimating its effective weight.',
  landmine:'Record plates added at the free end only; exclude the bar and attachment.',
  bodyweight:'Log repetitions; recording bodyweight is optional. Do not enter bodyweight as external load.',
  added:'Record added weight separately from optional bodyweight.',
  assisted:'Record the displayed assistance as a positive amount, separately from optional bodyweight.',
  'reps-only':'Log repetitions without a kilogram estimate. Note band type and tension in workout notes.',
}
export function defineBatchOne(entry:Entry):Exercise { return defineEntry(entry, 'ba51c100') }
export function defineBatchTwo(entry:Entry):Exercise { return defineEntry(entry, 'ba51c200') }
export function defineBatchThree(entry:Entry):Exercise { return defineEntry(entry, 'ba51c300') }
export function defineBatchFour(entry:Entry):Exercise { return defineEntry(entry, 'ba51c400') }
export function defineCombinedBatches(entry:Entry):Exercise { return defineEntry(entry, 'ba51c580') }
export function defineGripVariation(entry: Entry): Exercise { return defineEntry(entry, 'ba51c600') }
export function defineWristCurl(entry: Entry): Exercise { return defineEntry(entry, 'ba51c700') }
function defineEntry(entry:Entry, namespace:'ba51c100'|'ba51c200'|'ba51c300'|'ba51c400'|'ba51c580'|'ba51c600'|'ba51c700'):Exercise {
  const mode:Tracking['load']=entry.load==='bodyweight'?'bodyweight':entry.load==='added'?'added':entry.load==='assisted'?'assisted':entry.load==='reps-only'||entry.load==='gripper'||entry.load==='unloaded'?'none':'external'
  const convention:Tracking['weightConvention']=mode==='none'||mode==='bodyweight'?null:entry.load==='dumbbells'||entry.load==='kettlebells'?'per-hand':entry.load==='stack'||entry.load==='assisted'?'machine-display':'total'
  return {
    // Explicit reservation, NOT the entry's position. Numbers must never be reused or renumbered.
    id:`${namespace}-0000-4000-8000-${String(entry.number).padStart(12,'0')}`,
    createdAt:'2026-11-10T00:00:00.000Z',updatedAt:'2026-11-10T00:00:00.000Z',revision:1,origin:'bundled',archived:false,
    name:entry.name,primaryMuscleGroupIds:entry.primary,secondaryMuscleGroupIds:entry.secondary,equipmentIds:entry.equipment,category:entry.type,
    tracking:{measurement:entry.measurement??'reps',load:mode,weightConvention:convention},defaultRestSeconds:null,instructions:entry.instructions,
    notes:[entry.notes,entry.measurement==='duration'&&entry.load==='bodyweight'?'Recording bodyweight is optional. Do not enter bodyweight as external load.':measurementNotes[entry.load],entry.measurement==='duration'?(entry.type==='conditioning'?'Log duration in seconds; repetitions do not apply.':'Log hold duration in seconds; repetitions do not apply.'):entry.repetitions==='per-side'?'Reps are per side. Use the same reps on each side; log sides separately if they differ.':namespace==='ba51c580'?'One complete movement counts as one rep.':'One complete bilateral movement counts as one rep.'].filter(Boolean).join(' '),
    metadata:{version:1,aliases:entry.aliases,familyId:familyId(entry.family),exerciseType:entry.type,movementPatternIds:entry.patterns,optionalEquipmentIds:entry.optionalEquipment??[],repetitionConvention:entry.repetitions,
      variant:{grip:null,angle:null,stance:null,support:null,execution:null,...entry.variant}},
  }
}
