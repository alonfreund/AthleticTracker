import Dexie from 'dexie'
import { APP_VERSION } from '../../app/version'
import { STRENGTH_TABLES, type Exercise } from '../../domain/strength/models'
import { legacyPreference, normalizeDefinition } from '../../domain/strength/exerciseMetadata'
import { validateStrengthRecord, type StrengthLookup } from '../../domain/strength/validation'
import { db, BACKUP_TABLES, INTERNAL_BACKUP_TABLES, type AthleticDatabase } from '../db/database'
import { recordBackupRequest } from './status'
import { BACKUP_VERSION, validateBackupEnvelope, validateBackupRecord } from './backup'
import { streamBackupJson, type BackupFile } from './jsonStream'
import { BACKUP_PAGE_ROWS, MAX_BACKUP_ROW_BYTES, assertBackupSize, utf8Bytes } from './limits'
import type { BackupJob, BackupRow, BackupKey } from './stagingTypes'
export type BackupTable=typeof BACKUP_TABLES[number]
export interface StagedBackup { id:string; header:NonNullable<BackupJob['header']>; counts:Record<string,number>; bytes:number }
export interface PipelineOptions { signal?:AbortSignal; onProgress?:(message:string)=>void }
const tables=(database:AthleticDatabase)=>BACKUP_TABLES.map(name=>database[name])
const internals=(database:AthleticDatabase)=>INTERNAL_BACKUP_TABLES.map(name=>database[name])
const blankCounts=()=>Object.fromEntries(BACKUP_TABLES.map(name=>[name,0]))
function abort(options:PipelineOptions){options.signal?.throwIfAborted()}
function record(table:string,value:unknown):Record<string,unknown> {
  if(!value || typeof value!=='object' || Array.isArray(value))throw new Error(`Invalid ${table} record.`)
  return value as Record<string,unknown>
}
function rowFor(jobId:string,table:string,value:unknown):BackupRow {
  const data=record(table,value)
  const key=data[table==='metadata'?'key':table==='restTimers'?'sessionId':['exercisePreferences','catalogueState'].includes(table)?'exerciseId':'id']
  if(typeof key!=='string' || !key || key.length>200)throw new Error('Invalid backup record key.')
  const json=JSON.stringify(data)
  if(utf8Bytes(json)>MAX_BACKUP_ROW_BYTES)throw new Error('A backup record exceeds the 1 MB safety limit.')
  return {jobId,table,key,json,bytes:utf8Bytes(json),parent:String(data.sessionExerciseId??data.sessionActivityId??data.sessionId??''),group:String(data.supersetGroupId??'')}
}
function extraKeys(row:BackupRow):BackupKey[] {
  const data=JSON.parse(row.json),keys:BackupKey[]=[]
  const add=(scope:string,key:unknown)=>keys.push({jobId:row.jobId,scope,key:JSON.stringify(key)})
  if(row.table==='sessions' && data.status==='active')add('active-session','one')
  if(row.table==='sessionActivities'){add('activity-session',data.sessionId);add('activity-position',[data.sessionId,data.position])}
  if(row.table==='sessionExercises')add('exercise-position',[data.sessionActivityId,data.position])
  if(row.table==='strengthSets')add('set-position',[data.sessionExerciseId,data.position])
  if(row.table==='routineExercises')add('routine-position',[data.routineId,data.position])
  if(row.table==='editorDrafts')add('draft-set',data.setId)
  return keys
}
async function begin(database:AthleticDatabase):Promise<string> {
  // Stages have no live-data authority after a crash. Expired stages are safe to discard.
  const expired=await database.backupJobs.where('touchedAt').below(Date.now()-24*60*60*1000).primaryKeys()
  for(const id of expired)await discardStage(id,database)
  const id=crypto.randomUUID()
  await database.backupJobs.add({id,touchedAt:Date.now(),validated:false})
  return id
}
export async function discardStage(id:string,database:AthleticDatabase=db):Promise<void> {
  await database.transaction('rw',internals(database),async()=>{
    await database.backupRows.where('jobId').equals(id).delete()
    await database.backupKeys.where('jobId').equals(id).delete()
    await database.backupJobs.delete(id)
  })
}
async function page(database:AthleticDatabase,id:string,name:BackupTable,after=''):Promise<BackupRow[]> {
  return database.backupRows.where('[jobId+table+key]').between([id,name,after],[id,name,Dexie.maxKey],false,true).limit(BACKUP_PAGE_ROWS).toArray()
}
async function eachPage(database:AthleticDatabase,id:string,name:BackupTable,action:(rows:BackupRow[])=>Promise<void>) {
  let after=''
  while(true){const rows=await page(database,id,name,after);if(!rows.length)return;await action(rows);after=rows.at(-1)!.key}
}
async function getRecord(database:AthleticDatabase,id:string,name:BackupTable,key:unknown) {
  if(typeof key!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key))throw new Error('Invalid strength data: invalid identifier.')
  const row=await database.backupRows.get([id,name,key])
  if(!row)throw new Error('Invalid strength data: missing parent record.')
  return JSON.parse(row.json) as Record<string,unknown>
}
/** Only a row's immediate ancestor chain is retained, never a whole workout/database graph. */
async function references(database:AthleticDatabase,id:string,name:string,row:Record<string,unknown>,read:(name:BackupTable,key:unknown)=>Promise<Record<string,unknown>>):Promise<StrengthLookup> {
  const parents=new Map<string,Record<string,unknown>>()
  async function get(table:BackupTable,key:unknown){const value=await read(table,key);parents.set(`${table}:${key}`,value);return value}
  async function exercise(key:unknown){const ex=await get('sessionExercises',key),activity=await get('sessionActivities',ex.sessionActivityId);await get('sessions',activity.sessionId);return ex}
  async function set(key:unknown){const set=await get('strengthSets',key);await exercise(set.sessionExerciseId)}
  if(name==='sessionActivities')await get('sessions',row.sessionId)
  if(name==='supersetGroups')await get('sessionActivities',row.sessionActivityId)
  if(name==='sessionExercises') {await get('sessionActivities',row.sessionActivityId);if(row.supersetGroupId!==null)await get('supersetGroups',row.supersetGroupId)}
  if(name==='strengthSets')await exercise(row.sessionExerciseId)
  if(name==='restTimers' || name==='editorDrafts') {
    await get('sessions',row.sessionId)
    if(name==='editorDrafts')await set(row.setId)
    else if(row.sourceSetId!==null)await set(row.sourceSetId)
  }
  return (table,key)=>{const value=parents.get(`${table}:${String(key)}`);if(!value)throw new Error('Invalid strength data: missing parent record.');return value}
}
async function validateStage(id:string,header:StagedBackup['header'],database:AthleticDatabase,options:PipelineOptions) {
  // A bounded LRU avoids fetching the same exercise/session for every set.
  const cache=new Map<string,{value:Record<string,unknown>;bytes:number}>()
  let cacheBytes=0
  const read=async(name:BackupTable,key:unknown)=>{
    const identity=`${name}:${String(key)}`,hit=cache.get(identity)
    if(hit){cache.delete(identity);cache.set(identity,hit);return hit.value}
    const value=await getRecord(database,id,name,key),entry={value,bytes:utf8Bytes(JSON.stringify(value))}
    cache.set(identity,entry);cacheBytes+=entry.bytes
    while(cache.size>16 || cacheBytes>2*MAX_BACKUP_ROW_BYTES){const first=cache.keys().next().value!;cacheBytes-=cache.get(first)!.bytes;cache.delete(first)}
    return value
  }
  const order=['metadata','foundationRecords','exercises','sessions','sessionActivities','supersetGroups','sessionExercises','strengthSets','restTimers','editorDrafts','exercisePreferences','catalogueState','routines','routineExercises'] as const
  for(const name of order) {
    options.onProgress?.(`Validating ${name}…`)
    await eachPage(database,id,name,async rows=>{
      abort(options)
      await database.transaction('rw',internals(database),async()=>{
        let byteChange=0
        for(const row of rows) {
          const value=JSON.parse(row.json)
          validateBackupRecord(name,value,header.formatVersion)
          const keys = extraKeys(row)
          if ((STRENGTH_TABLES as readonly string[]).includes(name)) {
            const lookup = await references(database, id, name, value, read)
            validateStrengthRecord(name as typeof STRENGTH_TABLES[number], value, lookup)
            if (name === 'strengthSets' && value.supersetRoundIndex !== undefined) {
              const exercise = lookup('sessionExercises', value.sessionExerciseId)
              keys.push({ jobId: id, scope: 'superset-round', key: JSON.stringify([
                exercise.supersetGroupId, exercise.supersetSlotId, value.supersetRoundIndex,
              ]) })
            }
          }
          if (keys.length) await database.backupKeys.bulkAdd(keys)
          if(name==='exercises' && header.formatVersion<4) {
            const preference=rowFor(id,'exercisePreferences',legacyPreference(value as Exercise)),definition=rowFor(id,name,normalizeDefinition(value as Exercise))
            await database.backupRows.add(preference)
            await database.backupRows.put(definition)
            byteChange+=preference.bytes+definition.bytes-row.bytes
          }
          if(name==='supersetGroups') {
            const slots = new Set<string>()
            const members = await database.backupRows.where('[jobId+table+group]').equals([id, 'sessionExercises', row.key])
              .filter(member => {
                const exercise = JSON.parse(member.json)
                const slot = exercise.supersetSlotId ? 'slot-' + exercise.supersetSlotId : member.key
                if (slots.has(slot)) return false
                slots.add(slot)
                return true
              }).limit(2).count()
            if(members<2)throw new Error('Invalid strength data: supersets require at least two exercises.')
          }
          if(name==='routineExercises' && !await database.backupRows.get([id,'routines',value.routineId]))throw new Error('Routine exercise has no parent routine.')
          if(name==='catalogueState' && !await database.backupRows.get([id,'exercises',String(value.exerciseId)]))throw new Error('Catalogue state refers to a missing definition.')
        }
        const state=await database.backupJobs.get(id)
        await database.backupJobs.update(id,{touchedAt:Date.now(),rowBytes:(state?.rowBytes??0)+byteChange})
      })
    })
  }
  if(!await database.backupRows.get([id,'metadata','createdAt']))throw new Error('Backup must contain the database creation date.')
  const counts=blankCounts()
  for(const name of BACKUP_TABLES)counts[name]=await database.backupRows.where('[jobId+table]').equals([id,name]).count()
  const state=await database.backupJobs.get(id)
  let canonicalBytes=utf8Bytes(JSON.stringify({...header,formatVersion:BACKUP_VERSION,data:{}}))+(BACKUP_TABLES.length-1)+(state?.rowBytes??0)
  for(const name of BACKUP_TABLES)canonicalBytes+=utf8Bytes(JSON.stringify(name))+3+Math.max(0,counts[name]-1)
  assertBackupSize(canonicalBytes)
  return counts
}
export async function stageImport(file:BackupFile,database:AthleticDatabase=db,options:PipelineOptions={}):Promise<StagedBackup> {
  assertBackupSize(file.size);abort(options);options.onProgress?.('Preparing backup import…');abort(options)
  const id=await begin(database)
  let pending:BackupRow[]=[]
  try {
    const envelope=await streamBackupJson(file,(name,value)=>{pending.push(rowFor(id,name,value))},async()=>{
      if(!pending.length)return
      abort(options)
      const batch=pending;pending=[]
      await database.transaction('rw',database.backupRows,database.backupJobs,async()=>{await database.backupRows.bulkAdd(batch);const state=await database.backupJobs.get(id);await database.backupJobs.update(id,{touchedAt:Date.now(),rowBytes:(state?.rowBytes??0)+batch.reduce((sum,row)=>sum+row.bytes,0)})})
    },options.signal,bytes=>options.onProgress?.(`Reading backup… ${Math.floor(bytes/file.size*100)}%`))
    const header=validateBackupEnvelope(envelope.header,envelope.tables)
    const counts=await validateStage(id,header,database,options)
    abort(options)
    await database.backupJobs.update(id,{header,counts,bytes:file.size,validated:true,touchedAt:Date.now()})
    return {id,header,counts,bytes:file.size}
  } catch(error) {options.onProgress?.('Removing temporary backup data…');await discardStage(id,database).catch(()=>{});throw error}
}
/** Snapshot is copied in one transaction so concurrent writes cannot produce a mixed-time export. */
export async function stageSnapshot(database:AthleticDatabase=db,options:PipelineOptions={}):Promise<StagedBackup> {
  abort(options);options.onProgress?.('Preparing backup snapshot…');abort(options)
  const id=await begin(database)
  const header={format:'athletic-tracker-backup' as const,formatVersion:BACKUP_VERSION,exportedAt:new Date().toISOString(),appVersion:APP_VERSION}
  try {
    let bytes=0
    await database.transaction('rw',[...tables(database),...internals(database)],async()=>{
      for(const name of BACKUP_TABLES) {
        options.onProgress?.(`Preparing ${name}…`)
        let after:string|undefined
        while(true) {
          abort(options)
          const source=after===undefined?database[name].orderBy(':id'):database[name].where(':id').above(after)
          const data:unknown[]=await source.limit(BACKUP_PAGE_ROWS).toArray()
          if(!data.length)break
          const rows=data.map(value=>rowFor(id,name,value))
          for(const row of rows){bytes+=row.bytes;assertBackupSize(bytes)}
          await database.backupRows.bulkAdd(rows);after=rows.at(-1)!.key
        }
      }
      await database.backupJobs.update(id,{rowBytes:bytes})
    })
    const counts=await validateStage(id,header,database,options)
    await database.backupJobs.update(id,{header,counts,bytes,validated:true,touchedAt:Date.now()})
    return {id,header,counts,bytes}
  } catch(error){options.onProgress?.('Removing temporary backup data…');await discardStage(id,database).catch(()=>{});throw error}
}
async function job(stage:StagedBackup,database:AthleticDatabase){const value=await database.backupJobs.get(stage.id);if(!value?.validated)throw new Error('Backup staging is unavailable. Select or export the backup again.');return value}
/** Blob parts are byte chunks, not one giant JSON string or an in-memory database clone. */
export async function exportStage(stage:StagedBackup,database:AthleticDatabase=db,options:PipelineOptions={}):Promise<Blob> {
  const state=await job(stage,database)
  const header={...state.header,formatVersion:BACKUP_VERSION}
  const parts:Blob[]=[]
  let bytes=0,buffer=''
  const append=(text:string)=>{bytes+=utf8Bytes(text);assertBackupSize(bytes);buffer+=text;if(buffer.length>=64*1024){parts.push(new Blob([buffer]));buffer=''}}
  append(`{"format":${JSON.stringify(header.format)},"formatVersion":${header.formatVersion},"exportedAt":${JSON.stringify(header.exportedAt)},"appVersion":${JSON.stringify(header.appVersion)},"data":{`)
  let firstTable=true
  for(const name of BACKUP_TABLES) {
    abort(options);options.onProgress?.(`Writing ${name}…`)
    append(`${firstTable?'':','}${JSON.stringify(name)}:[`);firstTable=false
    let first=true,emitted=0
    await eachPage(database,stage.id,name,async rows=>{abort(options);for(const row of rows){append(`${first?'':','}${row.json}`);first=false;emitted++}})
    append(']')
    if((state.counts?.[name]??0)!==emitted)throw new Error('Backup staging changed. Export the backup again.')
  }
  append('}}');if(buffer)parts.push(new Blob([buffer]))
  abort(options);await job(stage,database)
  return new Blob(parts,{type:'application/json'})
}
export function downloadBackupBlob(blob:Blob,exportedAt:string,prefix='athletic-tracker') {
  assertBackupSize(blob.size)
  const url=URL.createObjectURL(blob),link=document.createElement('a')
  link.href=url;link.download=`${prefix}-${exportedAt.replace(/[:.]/g,'-')}.json`
  try{document.body.append(link);link.click()}catch(error){URL.revokeObjectURL(url);throw error}finally{link.remove()}
  setTimeout(()=>URL.revokeObjectURL(url),60000)
  return recordBackupRequest()
}
export async function exportBackupFile(database:AthleticDatabase=db,options:PipelineOptions={}):Promise<{blob:Blob;snapshot:StagedBackup}> {
  const snapshot=await stageSnapshot(database,options)
  try{return {blob:await exportStage(snapshot,database,options),snapshot}}
  catch(error){await discardStage(snapshot.id,database).catch(()=>{});throw error}
}
/** Compare one record at a time under the same lock used for replacement. */
async function unchanged(snapshot:StagedBackup,database:AthleticDatabase,options:PipelineOptions) {
  const saved=await job(snapshot,database)
  for(const name of BACKUP_TABLES) {
    if(await database[name].count()!==saved.counts?.[name])throw new Error('Local data changed after the safety backup. Cancel restore and start again.')
    await eachPage(database,snapshot.id,name,async rows=>{
      abort(options)
      const live=await database[name].bulkGet(rows.map(row=>row.key))
      for(let i=0;i<rows.length;i++)if(JSON.stringify(live[i])!==rows[i].json)throw new Error('Local data changed after the safety backup. Cancel restore and start again.')
    })
  }
}
export async function restoreStagedBackup(incoming:StagedBackup,safety:StagedBackup,database:AthleticDatabase=db,options:PipelineOptions={}):Promise<void> {
  if(incoming.id===safety.id)throw new Error('Select a separate incoming backup and safety backup.')
  await database.transaction('rw',[...tables(database),...internals(database)],async()=>{
    abort(options);await job(incoming,database);await unchanged(safety,database,options)
    for(const name of BACKUP_TABLES) {
      abort(options);options.onProgress?.(`Restoring ${name}…`)
      await database[name].clear()
      await eachPage(database,incoming.id,name,async rows=>{abort(options);await database.table(name).bulkAdd(rows.map(row=>JSON.parse(row.json)))})
    }
    abort(options)
    // Commit live replacement and stage cleanup together. A failure rolls back both.
    for(const stage of [incoming,safety])await discardStage(stage.id,database)
  })
}

/** Explicit recovery after force-closing; never removes live records. Close other app copies first. */
export async function clearTemporaryBackups(database:AthleticDatabase=db):Promise<void> {
  await database.transaction('rw',internals(database),async()=>{
    await database.backupRows.clear();await database.backupKeys.clear();await database.backupJobs.clear()
  })
}
