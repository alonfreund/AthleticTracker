import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { DurationEditor } from '../../components/DurationEditor'
import { globalRest, saveGlobalRest } from '../../data/repositories/preferences'
import { updateSafety } from '../../app/updateSafety'
import type { FoundationRecord } from '../../domain/foundation'
import { deleteRecord, listRecords, saveRecord } from '../../data/repositories/foundation'
import { readBackupStatus } from '../../data/backup/status'
import { db } from '../../data/db/database'
import { clearTemporaryBackups, discardStage, downloadBackupBlob, exportBackupFile, restoreStagedBackup, stageImport, type StagedBackup, type PipelineOptions } from '../../data/backup/pipeline'

export function FoundationPanel({ onDataRestored }: { onDataRestored?: () => Promise<void> }) {
  const [rest, setRest] = useState<number>()
  const [restDirty, setRestDirty] = useState(false)
  const [backupStatus, setBackupStatus] = useState(readBackupStatus)
  const [recordPage,setRecordPage]=useState(0)
  const [recordCount,setRecordCount]=useState(0)
  const [records, setRecords] = useState<FoundationRecord[]>([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string>()
  const [baseline, setBaseline] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [temporaryJobs,setTemporaryJobs]=useState(0)
  const [progress, setProgress] = useState('')
  const controller = useRef<AbortController | undefined>(undefined)
  const pendingRef = useRef<StagedBackup | undefined>(undefined)
  const lock = useRef(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState<StagedBackup>()
  const [safetyReady, setSafetyReady] = useState(false)
  const safetyBackup = useRef<StagedBackup | undefined>(undefined)
  const [confirmed, setConfirmed] = useState(false)
  pendingRef.current = pending
  const dirty = text !== baseline || restDirty
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty, busy, restoring: !!pending, loading: !loaded })
  }, [dirty, busy, pending, loaded])
  useEffect(() => {
    void Promise.all([listRecords(db,50,recordPage*50), globalRest(),db.foundationRecords.count()]).then(([value, rest,count]) => { setRecords(value); setRecordCount(count); setRest(rest); setLoaded(true) }).catch(() => setError('Could not load local records. Reload to retry.'))
  }, [recordPage])
  useEffect(()=>{let active=true;void db.backupJobs.count().then(count=>{if(active)setTemporaryJobs(count)}).catch(()=>{});return()=>{active=false}},[busy,pending])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || lock.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])
  async function run(action: (options: PipelineOptions) => Promise<void>) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true; updateSafety.setBusy(true); setBusy(true); setError(''); setMessage(''); setProgress('Working…'); controller.current=new AbortController()
    try { await action({ signal:controller.current.signal,onProgress:setProgress }) } catch (error) { if(controller.current?.signal.aborted)setMessage('Operation cancelled. Existing records were kept.');else setError(error instanceof Error ? error.message : 'Operation failed. Please retry.') }
    finally { controller.current=undefined;setProgress('');lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  function resetEditor() { setText(''); setBaseline(''); setEditingId(undefined) }
  async function cancelRestore() { setProgress('Cleaning temporary backup data…');const ids=[pending?.id,safetyBackup.current?.id];setPending(undefined);safetyBackup.current=undefined;setSafetyReady(false);setConfirmed(false);for(const id of ids)if(id)await discardStage(id).catch(()=>{}) }
  useEffect(()=>()=>{controller.current?.abort();for(const id of [pendingRef.current?.id,safetyBackup.current?.id])if(id)void discardStage(id).catch(()=>{})},[])
  return <>
    <section aria-labelledby="backup-heading" className="surface-card">
      <h2 id="backup-heading">Data &amp; backups</h2>
      <p role="status">Last backup download requested: {backupStatus.requestedAt ? new Date(backupStatus.requestedAt).toLocaleString() : 'No recorded request on this device.'}</p>
      {!backupStatus.historySaved && <p className="note">Backup history could not be saved on this device. This does not prevent downloading a backup.</p>}
      <p className="note">Includes safety-backup downloads. This date does not confirm that you kept the file or that it includes later changes.</p>
      <p className="note">Backups up to 100 MB. Large files need free local storage; keep the app open until the operation finishes.</p>
      <p>Backups contain saved records only. Save your draft first. Files are unencrypted and stay on your device unless you share them.</p>
      {busy && progress!=='Working…' && <div className="review-box" aria-live="polite"><p role="status">{progress}</p>{/^(Reading|Validating|Preparing|Writing|Restoring)/.test(progress) && <button className="secondary" onClick={()=>controller.current?.abort()}>Cancel operation</button>}</div>}
      <button disabled={applying || busy || !loaded || dirty || !!pending} onClick={() => void run(async options => { const output=await exportBackupFile(db,options);try { setBackupStatus(downloadBackupBlob(output.blob,output.snapshot.header.exportedAt));setMessage('Backup download requested. Keep the file outside this app; downloading alone does not prove it was saved.') } finally { setProgress('Cleaning temporary backup data…');await discardStage(output.snapshot.id).catch(()=>{}) } })}>Export backup</button>
      <label className="file-label" htmlFor="backup-file">Select a JSON backup to restore</label>
      <input id="backup-file" type="file" accept=".json,application/json" disabled={applying || busy || !loaded || dirty || !!pending} onChange={event => {
        const file = event.target.files?.[0]; event.target.value = ''; if (!file) return
        void run(async options => {
          const backup = await stageImport(file,db,options)
          setPending(backup); setSafetyReady(false); setConfirmed(false)
        })
      }} />
      {!!temporaryJobs && !pending && !busy && <div className="review-box"><p>Temporary backup files are stored locally. Close other copies of this app before removing them. Saved records are kept.</p><button className="secondary" disabled={applying} onClick={()=>void run(async()=>{await clearTemporaryBackups();setTemporaryJobs(0);setMessage('Temporary backup files removed. Saved records were kept.')})}>Remove temporary backup files</button></div>}
      {pending && <div className="restore-review">
        <h3>Review replacement</h3>
        <p>Backup from {new Date(pending.header.exportedAt).toLocaleString()}: {pending.counts.foundationRecords} test records, {pending.counts.sessions} workouts, {pending.counts.routines} routines and {pending.counts.exercises} library exercises. This replaces all saved data on this device, including workouts, sets and unfinished drafts. Records will not be merged. Backups made before routines were added contain zero routines.</p>
        <p>Other open tabs must not edit data during restore. Cancel to return to editing.</p>
        <button disabled={applying || busy} onClick={() => void run(async options => { const output=await exportBackupFile(db,options);try {setBackupStatus(downloadBackupBlob(output.blob,output.snapshot.header.exportedAt,'athletic-tracker-before-restore'))}catch(error){await discardStage(output.snapshot.id).catch(()=>{});throw error}const old=safetyBackup.current;safetyBackup.current=output.snapshot;if(old)await discardStage(old.id).catch(()=>{});setSafetyReady(true);setMessage('Safety-backup download requested. Check that you have kept the file before confirming replacement.') })}>Download safety backup</button>
        <label className="confirmation"><input type="checkbox" checked={confirmed} disabled={applying || busy || !safetyReady} onChange={event => setConfirmed(event.target.checked)} /> I have kept the safety backup and understand that existing data will be replaced.</label>
        <div className="actions">
          <button disabled={applying || busy || !safetyReady || !confirmed} onClick={() => void run(async options => {
            if (!safetyBackup.current) throw new Error('Download a safety backup first.')
            await restoreStagedBackup(pending,safetyBackup.current,db,options)
            await cancelRestore(); resetEditor(); setMessage('Restore completed successfully.')
            setRecordPage(0);setRecords(await listRecords());setRecordCount(await db.foundationRecords.count()); setRest(await globalRest())
            await onDataRestored?.()
          })}>Replace data with backup</button>
          <button className="secondary" disabled={applying || busy} onClick={() => void run(async () => { await cancelRestore() })}>Cancel restore</button>
        </div>
      </div>}
    </section>
    <section className="surface-card" aria-label="Rest preferences"><h2>Rest preferences</h2><p>Global default for exercises without their own saved rest preference. Changes apply when you next add an exercise; existing workouts keep their rest settings.</p>{rest !== undefined && <DurationEditor seconds={rest} label="Global default rest" saveLabel="Save global default" disabled={applying || busy || !!pending || !loaded} onDirty={setRestDirty} onSave={async seconds => {
      let saved = false
      await run(async () => { await saveGlobalRest(seconds); setRest(seconds); setMessage('Global rest default saved.'); saved = true })
      if (!saved) throw new Error('Could not save the global default.')
    }} />}</section>
    <details className="diagnostics"><summary>Advanced · storage test records{dirty ? ' · Unsaved changes' : ''}</summary>
    <section aria-labelledby="records-heading">
      <h2 id="records-heading">Storage test records</h2>
      <p className="note">Showing {recordCount ? recordPage*50+1 : 0}–{Math.min(recordCount,(recordPage+1)*50)} of {recordCount} records.</p>
      <div className="actions"><button className="secondary" disabled={busy || dirty || !!pending || recordPage===0} onClick={()=>setRecordPage(page=>page-1)}>Previous records</button><button className="secondary" disabled={busy || dirty || !!pending || (recordPage+1)*50>=recordCount} onClick={()=>setRecordPage(page=>page+1)}>Older records</button></div>
      <p>Use disposable text to test local saving. These are not workout records.</p>
      <form onSubmit={event => { event.preventDefault(); void run(async () => {
        const saved = await saveRecord(text, editingId)
        // Keep a confirmed save distinct from a subsequent list refresh failure.
        setEditingId(saved.id); setBaseline(saved.text)
        setMessage('Saved to this device.')
        setSafetyReady(false)
        setRecordPage(0);setRecords(await listRecords());setRecordCount(await db.foundationRecords.count())
      }) }}>
        <label htmlFor="record-text">{editingId ? 'Edit test record' : 'New test record'}</label>
        <textarea id="record-text" value={text} maxLength={10000} disabled={applying || busy || !loaded || !!pending} onChange={event => setText(event.target.value)} />
        <p className="note">{dirty ? 'Unsaved changes — press Save.' : 'No unsaved changes.'}</p>
        <div className="actions">
          <button disabled={applying || busy || !loaded || !!pending || !text.trim()} type="submit">Save</button>
          <button className="secondary" type="button" disabled={applying || busy || !!pending} onClick={resetEditor}>Discard draft / new record</button>
        </div>
      </form>
      {!loaded ? <p>Records unavailable until local storage loads.</p> : !records.length ? <p>No saved test records.</p> : <ul className="records">{records.map(record => <li key={record.id}>
        <p className="record-text">{record.text}</p>
        <p className="note">Updated {new Date(record.updatedAt).toLocaleString()}</p>
        <div className="actions">
          <button className="secondary" disabled={applying || busy || dirty || !!pending} onClick={() => { setEditingId(record.id); setText(record.text); setBaseline(record.text); setMessage('') }}>Edit</button>
          <button className="secondary" disabled={applying || busy || dirty || !!pending} onClick={() => {
            if (!window.confirm('Delete this storage test record? Export a backup first if you want to keep it.')) return
            void run(async () => { await deleteRecord(record.id); if (editingId === record.id) resetEditor(); setSafetyReady(false); setMessage('Record deleted.'); setRecordPage(0);setRecords(await listRecords());setRecordCount(await db.foundationRecords.count()) })
          }}>Delete</button>
        </div>
      </li>)}</ul>}
    </section>
    </details>
    <div aria-live="polite">{busy && progress==='Working…' && <p role="status">Working…</p>}{message && <p role="status">{message}</p>}</div>
    {error && <p role="alert" className="error">{error}</p>}
  </>
}
