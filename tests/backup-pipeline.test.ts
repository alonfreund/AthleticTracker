import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AthleticDatabase, verifyLocalStorage, INTERNAL_BACKUP_TABLES } from '../src/data/db/database'
import { createBackup, restoreBackup, validateBackup } from '../src/data/backup/backup'
import { stageImport, stageSnapshot, exportStage, restoreStagedBackup, discardStage, exportBackupFile } from '../src/data/backup/pipeline'
import { MAX_BACKUP_BYTES, MAX_BACKUP_ROW_BYTES, utf8Bytes } from '../src/data/backup/limits'
import { streamBackupJson } from '../src/data/backup/jsonStream'
import { saveRecord } from '../src/data/repositories/foundation'
import old from './fixtures/backup-v1-app-0.0.0.json'
import strength from './fixtures/backup-v2-strength-0.2.0.json'
import previous from './fixtures/backup-v3-rest-0.7.0.json'
const databases:AthleticDatabase[]=[]
function database(){const db=new AthleticDatabase(crypto.randomUUID());databases.push(db);return db}
function file(value:unknown){return new Blob([JSON.stringify(value)])}
async function emptyStages(db:AthleticDatabase){for(const name of INTERNAL_BACKUP_TABLES)expect(await db.table(name).count()).toBe(0)}
afterEach(async()=>{vi.restoreAllMocks();for(const db of databases.splice(0))await db.delete()})
describe('disk-staged backup pipeline',()=>{
  const { challenges: _challenges, challengeAttempts: _challengeAttempts, ...v15Data } = validateBackup(previous).data
  const { frontLeverAttempts: _frontLever, ...v14Data } = v15Data
  const { handstandAttempts: _handstand, ...v13Data } = v14Data
  const { plancheAttempts: _planche, ...v12Data } = v13Data
  const { muscleupAttempts: _muscleups, ...v11Data } = v12Data
  const { pullupAttempts: _pullups, ...v10Data } = v11Data
  const { pushupAttempts: _attempts, ...v9Data } = v10Data
  const { cardioTiming: _timing, cardioLive: _live, ...v7Data } = v9Data
  const { cardioDetails: _details, cardioDrafts: _drafts, ...v6Data } = v7Data
  const { routines: _routines, routineExercises: _routineExercises, ...v4Data } = v6Data
  const v4 = { ...validateBackup(previous), formatVersion: 4, data: v4Data }
  const v5 = { ...validateBackup(previous), formatVersion: 5, data: v6Data }
  const v6 = { ...v5, formatVersion: 6 }
  const v7 = { ...v6, formatVersion: 7, data: v7Data }
  const v8 = { ...validateBackup(previous), formatVersion: 8, data: v9Data }
  const v9 = { ...v8, formatVersion: 9 }
  it.each([old,strength,previous,v4,v5,v6,v7,v8,v9,{ ...v9, formatVersion: 10, data: v10Data },{ ...v9, formatVersion: 11, data: v11Data },{ ...v9, formatVersion: 12, data: v12Data },{ ...v9, formatVersion: 13, data: v13Data },{ ...v9, formatVersion: 14, data: v14Data },{ ...v9, formatVersion: 15, data: v15Data },{ ...v9, formatVersion: 16, data: validateBackup(previous).data },{ ...v9, formatVersion: 17, data: validateBackup(previous).data },validateBackup(previous)])('imports format $formatVersion, exports format 18 and restores with identical data',async fixture=>{
    const db=database();await verifyLocalStorage(db);await saveRecord('Existing record',undefined,db)
    const incoming=await stageImport(file(fixture),db)
    expect(incoming.counts.sessions).toBe('sessions' in fixture.data?fixture.data.sessions.length:0)
    const safety=await stageSnapshot(db)
    await restoreStagedBackup(incoming,safety,db)
    expect((await createBackup(db)).data).toEqual(validateBackup(fixture).data)
    await emptyStages(db)
    const exported=await exportBackupFile(db)
    const text=await exported.blob.text()
    expect(JSON.parse(text).data).toEqual(validateBackup(fixture).data)
    const target=database(),again=await stageImport(exported.blob,target)
    await verifyLocalStorage(target);const safe=await stageSnapshot(target)
    await restoreStagedBackup(again,safe,target)
    expect((await createBackup(target)).data).toEqual(validateBackup(fixture).data)
    await discardStage(exported.snapshot.id,db)
  })
  it('detects local edits even when the record count stays the same',async()=>{
    const db=database();await verifyLocalStorage(db);const record=await saveRecord('Before',undefined,db)
    const incoming=await stageImport(file(previous),db),safety=await stageSnapshot(db)
    await saveRecord('After',record.id,db)
    await expect(restoreStagedBackup(incoming,safety,db)).rejects.toThrow('Local data changed')
    expect((await db.foundationRecords.get(record.id))?.text).toBe('After')
  })
  it('rolls back a late replacement failure, leaving all live rows and staging available for retry',async()=>{
    const db=database();await verifyLocalStorage(db);await saveRecord('Keep',undefined,db)
    const before=(await createBackup(db)).data,incoming=await stageImport(file(previous),db),safety=await stageSnapshot(db)
    let fail=true
    db.exercisePreferences.hook('creating',()=>{if(fail){fail=false;throw new Error('Storage full')}})
    await expect(restoreStagedBackup(incoming,safety,db)).rejects.toThrow('Storage full')
    expect((await createBackup(db)).data).toEqual(before)
    expect(await db.backupJobs.count()).toBe(2)
    await restoreStagedBackup(incoming,safety,db);await emptyStages(db)
  })
  it('cancels import and replacement safely and cleans up failed imports',async()=>{
    const db=database();await verifyLocalStorage(db);await saveRecord('Keep',undefined,db)
    const before=(await createBackup(db)).data,abort=new AbortController()
    await expect(stageImport(file(previous),db,{signal:abort.signal,onProgress:()=>abort.abort()})).rejects.toThrow()
    await emptyStages(db)
    const incoming=await stageImport(file(previous),db),safety=await stageSnapshot(db),stop=new AbortController()
    await expect(restoreStagedBackup(incoming,safety,db,{signal:stop.signal,onProgress:()=>stop.abort()})).rejects.toThrow()
    expect((await createBackup(db)).data).toEqual(before)
  })
  it('cleans a staging quota failure without touching live data',async()=>{
    const db=database();await verifyLocalStorage(db);const before=(await createBackup(db)).data
    vi.spyOn(db.backupRows,'bulkAdd').mockRejectedValueOnce(new Error('Quota exceeded'))
    await expect(stageImport(file(previous),db)).rejects.toThrow('Quota exceeded')
    await emptyStages(db);expect((await createBackup(db)).data).toEqual(before)
  })
  it('rejects duplicate fields/IDs, orphan references, missing tables and invalid metadata',async()=>{
    const db=database();await verifyLocalStorage(db);const before=(await createBackup(db)).data
    const texts=['{"format":"x","format":"y"}',JSON.stringify(old).slice(0,-1),JSON.stringify(old)+'{}']
    const duplicate=structuredClone(previous);duplicate.data.strengthSets.push(duplicate.data.strengthSets[0]);texts.push(JSON.stringify(duplicate))
    const orphan=structuredClone(previous);orphan.data.strengthSets[0].sessionExerciseId=crypto.randomUUID();texts.push(JSON.stringify(orphan))
    const bad=structuredClone(previous);bad.data.sessions[0].status='invalid';texts.push(JSON.stringify(bad))
    for(const text of texts)await expect(stageImport(new Blob([text]),db)).rejects.toThrow()
    await emptyStages(db);expect((await createBackup(db)).data).toEqual(before)
  })
  it('enforces depth, individual record and UTF-8 validity limits while streaming',async()=>{
    const db=database()
    const tooDeep=`{"format":"athletic-tracker-backup","data":{"metadata":[{"x":${'['.repeat(40)}0${']'.repeat(40)}}]}}`
    await expect(stageImport(new Blob([tooDeep]),db)).rejects.toThrow('deep')
    const giant=`{"format":"athletic-tracker-backup","data":{"metadata":[{"key":"createdAt","value":"${'x'.repeat(MAX_BACKUP_ROW_BYTES+65536)}"}]}}`
    await expect(stageImport(new Blob([giant]),db)).rejects.toThrow(/large|limit/)
    await expect(stageImport(new Blob([new Uint8Array([0xff])]),db)).rejects.toThrow()
    await emptyStages(db)
  })
  it('decodes multibyte characters and escapes across arbitrarily split byte boundaries',async()=>{
    const value=structuredClone(old);value.data.foundationRecords[0].text='Emoji 🏋️ and quotes " and slash \\ and \n'
    const json=JSON.stringify(value)
    const db=database()
    for(const marker of ['🏋','\\"','\\\\','\\n']) {
      const at=json.indexOf(marker);expect(at).toBeGreaterThan(0)
      const padding=32*1024-1-utf8Bytes(json.slice(0,at))
      const stage=await stageImport(new Blob([' '.repeat(padding),json]),db),output=await exportStage(stage,db)
      expect(JSON.parse(await output.text()).data.foundationRecords[0].text).toBe(value.data.foundationRecords[0].text)
      await discardStage(stage.id,db)
    }
    expect(utf8Bytes(value.data.foundationRecords[0].text)).toBe(new TextEncoder().encode(value.data.foundationRecords[0].text).length)
  })
  it('rejects over-limit files before reading any bytes',async()=>{
    const db=database(),slice=vi.fn()
    await expect(stageImport({size:MAX_BACKUP_BYTES+1,slice},db)).rejects.toThrow('100 MB')
    expect(slice).not.toHaveBeenCalled();await emptyStages(db)
  })
})

describe('100 MB boundaries and bounded reads',()=>{
  function padded(value:unknown,size:number) {
    const prefix=new TextEncoder().encode(JSON.stringify(value))
    let maxSlice=0,reads=0
    return {size,slice:(start=0,end=size)=>{
      maxSlice=Math.max(maxSlice,end-start);reads++
      const output=new Uint8Array(Math.min(end,size)-start).fill(32)
      if(start<prefix.length)output.set(prefix.subarray(start,Math.min(end,prefix.length)))
      return new Blob([output])
    },metrics:()=>({maxSlice,reads})}
  }
  it('accepts valid JSON approaching and exactly at the limit without whole-file reads',async()=>{
    const db=database()
    for(const size of [MAX_BACKUP_BYTES-1,MAX_BACKUP_BYTES]) {
      const input=padded(old,size),stage=await stageImport(input,db)
      expect(stage.bytes).toBe(size);expect(input.metrics().maxSlice).toBeLessThanOrEqual(32*1024)
      expect(input.metrics().reads).toBeGreaterThan(3000)
      await discardStage(stage.id,db)
    }
    await emptyStages(db)
  },60000)
  it('rejects malformed JSON near the cap without changing live records',async()=>{
    const db=database();await verifyLocalStorage(db);await saveRecord('Keep',undefined,db)
    const before=(await createBackup(db)).data,input=padded(old,MAX_BACKUP_BYTES-1)
    const broken={size:MAX_BACKUP_BYTES,slice:(start=0,end=MAX_BACKUP_BYTES)=>end>=MAX_BACKUP_BYTES?new Blob([new Uint8Array(Math.max(0,MAX_BACKUP_BYTES-1-start)).fill(32),'x']):input.slice(start,end)}
    await expect(stageImport(broken,db)).rejects.toThrow()
    expect((await createBackup(db)).data).toEqual(before);await emptyStages(db)
  },60000)
  it('does not export over the limit and leaves the source untouched',async()=>{
    const db=database();await verifyLocalStorage(db)
    // A temporary staged output is never allowed past the same cap as import.
    const stage=await stageSnapshot(db),row={jobId:stage.id,table:'foundationRecords',key:crypto.randomUUID(),json:' '.repeat(MAX_BACKUP_BYTES),bytes:MAX_BACKUP_BYTES,parent:'',group:''}
    await db.backupRows.add(row)
    await expect(exportStage(stage,db)).rejects.toThrow('100 MB')
    expect(await db.foundationRecords.count()).toBe(0)
  },30000)
})

// A seekable, generated file: no file-sized source string is created by this test.
function recordHeavyFile() {
  const date='2026-01-01T00:00:00.000Z',row=(index:number)=>JSON.stringify({id:`10000000-0000-4000-8000-${String(index).padStart(12,'0')}`,text:'x'.repeat(9500),createdAt:date,updatedAt:date})
  const prefix=`{"format":"athletic-tracker-backup","formatVersion":4,"exportedAt":"${date}","appVersion":"size-test","data":{"metadata":[{"key":"createdAt","value":"${date}"}],"foundationRecords":[${row(0)}`
  const suffix='],"exercises":[],"sessions":[],"sessionActivities":[],"sessionExercises":[],"strengthSets":[],"supersetGroups":[],"restTimers":[],"editorDrafts":[],"exercisePreferences":[],"catalogueState":[]}}'
  const width=row(0).length+1,count=1+Math.floor((MAX_BACKUP_BYTES-4096-prefix.length-suffix.length)/width),bodyEnd=prefix.length+(count-1)*width,size=bodyEnd+suffix.length
  let largestRead=0
  return {count,size,largestRead:()=>largestRead,slice:(start=0,end=size)=>{
    end=Math.min(end,size);largestRead=Math.max(largestRead,end-start)
    let result=''
    while(start<end) {
      let part:string,offset:number,available:number
      if(start<prefix.length){part=prefix;offset=start;available=prefix.length-start}
      else if(start<bodyEnd){const index=1+Math.floor((start-prefix.length)/width);part=','+row(index);offset=(start-prefix.length)%width;available=width-offset}
      else{part=suffix;offset=start-bodyEnd;available=suffix.length-offset}
      const length=Math.min(available,end-start);result+=part.slice(offset,offset+length);start+=length
    }
    return new Blob([result])
  }}
}
describe('near-100 MB real-record integration',()=>{
  it('imports, validates, restores, reopens and exports a real payload near the cap',async()=>{
    const db=database();await verifyLocalStorage(db);await saveRecord('Old record',undefined,db)
    const input=recordHeavyFile();expect(input.size).toBeGreaterThan(MAX_BACKUP_BYTES-32*1024)
    const phases:string[]=[],start=performance.now()
    const incoming=await stageImport(input,db,{onProgress:phase=>{if(phases.at(-1)!==phase)phases.push(phase)}})
    expect(incoming.counts.foundationRecords).toBe(input.count);expect(input.largestRead()).toBeLessThanOrEqual(32*1024)
    const safety=await stageSnapshot(db);await restoreStagedBackup(incoming,safety,db)
    expect(await db.foundationRecords.count()).toBe(input.count)
    expect((await db.foundationRecords.get('10000000-0000-4000-8000-000000000000'))?.text.length).toBe(9500)
    db.close();await db.open()
    const exported=await exportBackupFile(db)
    expect(exported.blob.size).toBeGreaterThan(MAX_BACKUP_BYTES-32*1024);expect(exported.blob.size).toBeLessThanOrEqual(MAX_BACKUP_BYTES)
    expect(await exported.blob.slice(0,100).text()).toContain('"formatVersion":18')
    await discardStage(exported.snapshot.id,db);await emptyStages(db)
    expect(phases.some(phase=>phase.startsWith('Validating'))).toBe(true)
    for(let i=0;i<4;i++)await db.foundationRecords.add({id:crypto.randomUUID(),text:'x'.repeat(9500),createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'})
    await expect(exportBackupFile(db)).rejects.toThrow('100 MB')
    expect(await db.foundationRecords.count()).toBe(input.count+4)
    await emptyStages(db)
    console.info(`Large backup integration: ${input.count} records, ${input.size} input bytes, ${exported.blob.size} export bytes, ${Math.round(performance.now()-start)} ms (desktop fake IndexedDB; not an iPhone measurement).`)
  },120000)
})

describe('staging lifecycle and validation parity',()=>{
  it('rejects global relationship conflicts just as the legacy validator does',async()=>{
    const original=validateBackup(previous)
    const mutations=[
      (backup:typeof original)=>{backup.data.sessions.push({...backup.data.sessions[0],id:crypto.randomUUID()})},
      (backup:typeof original)=>{backup.data.sessionActivities.push({...backup.data.sessionActivities[0],id:crypto.randomUUID(),position:99})},
      (backup:typeof original)=>{backup.data.sessionExercises.push({...backup.data.sessionExercises[0],id:crypto.randomUUID()})},
      (backup:typeof original)=>{backup.data.strengthSets.push({...backup.data.strengthSets[0],id:crypto.randomUUID()})},
      (backup:typeof original)=>{backup.data.editorDrafts.push({...backup.data.editorDrafts[0],id:crypto.randomUUID()})},
      (backup:typeof original)=>{backup.data.supersetGroups.push({...backup.data.supersetGroups[0],id:crypto.randomUUID()})},
    ]
    const db=database()
    for(const mutate of mutations){const bad=structuredClone(original);mutate(bad);expect(()=>validateBackup(bad)).toThrow();await expect(stageImport(file(bad),db)).rejects.toThrow()}
    await emptyStages(db)
  })
  it('detects removed temporary rows instead of downloading a silently incomplete backup',async()=>{
    const db=database();await verifyLocalStorage(db);await saveRecord('Keep',undefined,db)
    const stage=await stageSnapshot(db);await db.backupRows.where('[jobId+table]').equals([stage.id,'foundationRecords']).delete()
    await expect(exportStage(stage,db)).rejects.toThrow('staging changed')
    expect(await db.foundationRecords.count()).toBe(1)
  })
  it('clears abandoned temporary jobs while retaining all live data',async()=>{
    const {clearTemporaryBackups}=await import('../src/data/backup/pipeline')
    const db=database();await verifyLocalStorage(db);await saveRecord('Keep',undefined,db)
    await stageImport(file(previous),db);await stageSnapshot(db)
    await clearTemporaryBackups(db);await emptyStages(db)
    expect((await db.foundationRecords.toArray())[0].text).toBe('Keep')
  })
})

describe('dense strength payload performance',()=>{
  it('validates thousands of sets with a bounded parent cache rather than repeated full-graph reads',async()=>{
    const db=database(),backup=validateBackup(previous),base=backup.data.strengthSets[0]
    for(let i=0;i<12000;i++)backup.data.strengthSets.push({...base,id:`20000000-0000-4000-8000-${String(i).padStart(12,'0')}`,position:i+100})
    const input=file(backup),reads=vi.spyOn(db.backupRows,'get')
    expect(input.size).toBeGreaterThan(5*1024*1024)
    const incoming=await stageImport(input,db)
    expect(incoming.counts.strengthSets).toBe(12006)
    expect(reads.mock.calls.length).toBeLessThan(100)
    await discardStage(incoming.id,db);await emptyStages(db)
  },30000)
})

describe('snapshot consistency and additive migration',()=>{
  it('takes one consistent snapshot while another connection queues an edit',async()=>{
    const Dexie=(await import('dexie')).default
    const db=database();await verifyLocalStorage(db);const saved=await saveRecord('Before snapshot',undefined,db)
    const other=new AthleticDatabase(db.name);databases.push(other);await other.open()
    let edit:Promise<unknown>|undefined
    const snapshot=await stageSnapshot(db,{onProgress:phase=>{if(phase==='Preparing foundationRecords…'&&!edit)edit=Dexie.ignoreTransaction(()=>saveRecord('After snapshot',saved.id,other))}})
    await edit
    const blob=await exportStage(snapshot,db)
    expect(JSON.parse(await blob.text()).data.foundationRecords[0].text).toBe('Before snapshot')
    expect((await db.foundationRecords.get(saved.id))?.text).toBe('After snapshot')
  })
  it('upgrades a real schema-4 database without rewriting any backed-up row',async()=>{
    const Dexie=(await import('dexie')).default
    const source=database();await restoreBackup(previous,source)
    const data=(await createBackup(source)).data
    const schema=Object.fromEntries(source.tables.filter(table=>!['routines','routineExercises',...INTERNAL_BACKUP_TABLES].includes(table.name)).map(table=>[table.name,[table.schema.primKey.src,...table.schema.indexes.map(index=>index.src)].join(',')]))
    const name=crypto.randomUUID(),old=new Dexie(name);old.version(4).stores(schema)
    for(const table of Object.keys(schema))await old.table(table).bulkAdd(data[table as keyof typeof data])
    old.close()
    const upgraded=new AthleticDatabase(name);databases.push(upgraded);await upgraded.open()
    expect(upgraded.verno).toBe(16)
    expect((await createBackup(upgraded)).data).toEqual(data)
    await emptyStages(upgraded)
  })
})
