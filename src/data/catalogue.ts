import type { Exercise } from '../domain/strength/models'
import { STARTER_EXERCISES, LEGACY_STARTER_EXERCISES, EXERCISE_FAMILIES } from '../domain/strength/catalog'
import { exerciseFingerprint } from '../domain/strength/exerciseMetadata'
import { validateExercise } from '../domain/strength/validation'
import { EQUIPMENT, EXERCISE_TYPES, MOVEMENT_PATTERNS, MUSCLES } from '../domain/strength/taxonomy'
import { db, type AthleticDatabase } from './db/database'
export function validateCatalogue(definitions: readonly Exercise[]): void {
  const ids=new Set<string>()
  const names=new Set<string>()
  const variants=new Set<string>()
  for(const definition of definitions) {
    validateExercise(definition)
    if(definition.origin!=='bundled' || !definition.metadata || definition.defaultRestSeconds!==null) throw new Error('Catalogue entries must be versioned built-in definitions without personal rest settings.')
    const name=definition.name.trim().toLocaleLowerCase()
    if(ids.has(definition.id) || names.has(name)) throw new Error('Duplicate catalogue ID or name.')
    ids.add(definition.id); names.add(name)
    const signature=JSON.stringify([definition.metadata.familyId,[...definition.equipmentIds].sort(),definition.metadata.variant.grip,definition.metadata.variant.angle,definition.metadata.variant.stance,definition.metadata.variant.support,definition.metadata.variant.execution,definition.tracking.load,definition.tracking.measurement,definition.tracking.weightConvention,definition.metadata.repetitionConvention])
    if(variants.has(signature)) throw new Error('Duplicate catalogue variation. Use aliases for synonyms.')
    variants.add(signature)
    if(!definition.metadata.familyId || !Object.hasOwn(EXERCISE_FAMILIES,definition.metadata.familyId)) throw new Error('Unknown catalogue exercise family.')
    if(!definition.primaryMuscleGroupIds.length) throw new Error('Catalogue exercise needs a primary muscle.')
    for(const id of [...definition.primaryMuscleGroupIds,...definition.secondaryMuscleGroupIds]) if(!Object.hasOwn(MUSCLES,id)) throw new Error('Unknown catalogue muscle.')
    for(const id of [...definition.equipmentIds,...definition.metadata.optionalEquipmentIds]) if(!Object.hasOwn(EQUIPMENT,id)) throw new Error('Unknown catalogue equipment.')
    if(definition.metadata.optionalEquipmentIds.some(id=>definition.equipmentIds.includes(id))) throw new Error('Equipment cannot be both required and optional.')
    for(const id of definition.metadata.movementPatternIds) if(!Object.hasOwn(MOVEMENT_PATTERNS,id)) throw new Error('Unknown catalogue movement pattern.')
    if(!Object.hasOwn(EXERCISE_TYPES,definition.category) || definition.category!==definition.metadata.exerciseType) throw new Error('Catalogue category must match its exercise type.')
  }
}
/** Explicit revisions, transactional changes, no deletes, no writes to user preferences or history. */
export async function installCatalogue(definitions: readonly Exercise[] = STARTER_EXERCISES, database: AthleticDatabase = db) {
  validateCatalogue(definitions)
  return database.transaction('rw',database.exercises,database.catalogueState,async()=>{
    const result={ added:0, updated:0, preserved:[] as string[] }
    for(const incoming of definitions) {
      const current=await database.exercises.get(incoming.id)
      const state=await database.catalogueState.get(incoming.id)
      if(current?.origin==='custom') { result.preserved.push(current.id); continue }
      if(state && state.appliedRevision>=incoming.revision) continue // Never downgrade a restored/newer catalogue.
      if(current) {
        const legacy=LEGACY_STARTER_EXERCISES.find(row=>row.id===current.id)
        const baseline=state?.fingerprint ?? (legacy ? exerciseFingerprint(legacy) : undefined)
        if(state?.status==='preserved' || baseline!==exerciseFingerprint(current) || current.tracking.load!==incoming.tracking.load || current.tracking.measurement!==incoming.tracking.measurement || current.tracking.weightConvention!==incoming.tracking.weightConvention) {
          result.preserved.push(current.id)
          await database.catalogueState.put({ exerciseId:current.id, appliedRevision:state?.appliedRevision ?? 0, fingerprint:state?.fingerprint ?? exerciseFingerprint(current), status:'preserved' })
          continue
        }
      }
      const saved={ ...structuredClone(incoming), createdAt:current?.createdAt ?? incoming.createdAt, updatedAt:new Date(Math.max(Date.parse(incoming.updatedAt),Date.parse(current?.updatedAt ?? incoming.updatedAt))).toISOString() }
      await database.exercises.put(saved)
      await database.catalogueState.put({ exerciseId:saved.id, appliedRevision:saved.revision, fingerprint:exerciseFingerprint(saved), status:'managed' })
      if(current) result.updated++; else result.added++
    }
    return result
  })
}
