// Node 24+; writes synthetic test data only. These backups REPLACE workouts when restored.
import { mkdir, open, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { MAX_BACKUP_BYTES } from '../src/data/backup/limits.ts'
const directory=resolve(process.argv[2]??'.tools/backup-size-tests')
await mkdir(directory,{recursive:true})
const date='2026-01-01T00:00:00.000Z'
const row=index=>JSON.stringify({id:`10000000-0000-4000-8000-${String(index).padStart(12,'0')}`,text:'Synthetic backup-size test record. '+ 'x'.repeat(9400),createdAt:date,updatedAt:date})
const prefix=`{"format":"athletic-tracker-backup","formatVersion":4,"exportedAt":"${date}","appVersion":"size-test","data":{"metadata":[{"key":"createdAt","value":"${date}"}],"foundationRecords":[`
const suffix='],"exercises":[],"sessions":[],"sessionActivities":[],"sessionExercises":[],"strengthSets":[],"supersetGroups":[],"restTimers":[],"editorDrafts":[],"exercisePreferences":[],"catalogueState":[]}}'
async function generate(name,target,pad=false){
 const path=resolve(directory,name),handle=await open(path,'w')
 const count=Math.max(1,Math.floor((Math.min(target,MAX_BACKUP_BYTES)-8192-prefix.length-suffix.length)/(row(0).length+1)))
 try{
  await handle.write(prefix)
  for(let i=0;i<count;i++)await handle.write((i?',':'')+row(i))
  await handle.write(suffix)
  if(pad){let bytes=(await handle.stat()).size;const spaces=' '.repeat(32768);while(bytes<target){const part=spaces.slice(0,Math.min(spaces.length,target-bytes));await handle.write(part);bytes+=part.length}}
 }finally{await handle.close()}
 console.log(`${name}: ${(await stat(path)).size} bytes, ${count} synthetic records`)
}
await generate('small-valid.json',1024*1024)
await generate('near-limit-valid.json',MAX_BACKUP_BYTES)
await generate('over-limit-valid.json',MAX_BACKUP_BYTES+1,true)
console.log('Use disposable app data or keep a real backup first. Restoring these files replaces live records.')
