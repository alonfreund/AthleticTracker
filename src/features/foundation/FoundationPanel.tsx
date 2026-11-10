import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import type { FoundationRecord } from '../../domain/foundation'
import { deleteRecord, listRecords, saveRecord } from '../../data/repositories/foundation'
import { readBackupStatus } from '../../data/backup/status'
import { db } from '../../data/db/database'
import { createBackup, downloadBackup, MAX_BACKUP_BYTES, parseBackup, restoreBackup, type Backup } from '../../data/backup/backup'

export function FoundationPanel({ onDataRestored }: { onDataRestored?: () => Promise<void> }) {
  const [backupStatus, setBackupStatus] = useState(readBackupStatus)
  const [records, setRecords] = useState<FoundationRecord[]>([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string>()
  const [baseline, setBaseline] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState<Backup>()
  const [safetyReady, setSafetyReady] = useState(false)
  const safetyBackup = useRef<Backup | undefined>(undefined)
  const [confirmed, setConfirmed] = useState(false)
  const dirty = text !== baseline
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty, busy, restoring: !!pending, loading: !loaded })
  }, [dirty, busy, pending, loaded])
  useEffect(() => {
    void listRecords().then(value => { setRecords(value); setLoaded(true) }).catch(() => setError('Could not load local records. Reload to retry.'))
  }, [])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || lock.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])
  async function run(action: () => Promise<void>) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true; updateSafety.setBusy(true); setBusy(true); setError(''); setMessage('')
    try { await action() } catch (error) { setError(error instanceof Error ? error.message : 'Operation failed. Please retry.') }
    finally { lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  function resetEditor() { setText(''); setBaseline(''); setEditingId(undefined) }
  function cancelRestore() { setPending(undefined); setSafetyReady(false); setConfirmed(false) }
  return <>
    <section aria-labelledby="backup-heading" className="surface-card">
      <h2 id="backup-heading">Data &amp; backups</h2>
      <p role="status">Last backup download requested: {backupStatus.requestedAt ? new Date(backupStatus.requestedAt).toLocaleString() : 'No recorded request on this device.'}</p>
      {!backupStatus.historySaved && <p className="note">Backup history could not be saved on this device. This does not prevent downloading a backup.</p>}
      <p className="note">Includes safety-backup downloads. This date does not confirm that you kept the file or that it includes later changes.</p>
      <p>Backups contain saved records only. Save your draft first. Files are unencrypted and stay on your device unless you share them.</p>
      <button disabled={applying || busy || !loaded || dirty || !!pending} onClick={() => void run(async () => { setBackupStatus(downloadBackup(await createBackup())); setMessage('Backup download requested. Keep the file outside this app; downloading alone does not prove it was saved.') })}>Export backup</button>
      <label className="file-label" htmlFor="backup-file">Select a JSON backup to restore</label>
      <input id="backup-file" type="file" accept=".json,application/json" disabled={applying || busy || !loaded || dirty || !!pending} onChange={event => {
        const file = event.target.files?.[0]; event.target.value = ''; if (!file) return
        void run(async () => {
          if (file.size > MAX_BACKUP_BYTES) throw new Error('Select a backup smaller than 10 MB.')
          const backup = parseBackup(await file.text())
          setPending(backup); setSafetyReady(false); setConfirmed(false)
        })
      }} />
      {pending && <div className="restore-review">
        <h3>Review replacement</h3>
        <p>Backup from {new Date(pending.exportedAt).toLocaleString()}: {pending.data.foundationRecords.length} test records, {pending.data.sessions.length} workouts and {pending.data.exercises.length} library exercises. This replaces all saved data on this device, including workouts, sets and unfinished drafts. Records will not be merged. Older backups contain no workout data and will remove current workouts.</p>
        <p>Other open tabs must not edit data during restore. Cancel to return to editing.</p>
        <button disabled={applying || busy} onClick={() => void run(async () => { const backup = await createBackup(); setBackupStatus(downloadBackup(backup, 'athletic-tracker-before-restore')); safetyBackup.current = backup; setSafetyReady(true); setMessage('Safety-backup download requested. Check that you have kept the file before confirming replacement.') })}>Download safety backup</button>
        <label className="confirmation"><input type="checkbox" checked={confirmed} disabled={applying || busy || !safetyReady} onChange={event => setConfirmed(event.target.checked)} /> I have kept the safety backup and understand that existing data will be replaced.</label>
        <div className="actions">
          <button disabled={applying || busy || !safetyReady || !confirmed} onClick={() => void run(async () => {
            if (!safetyBackup.current) throw new Error('Download a safety backup first.')
            await restoreBackup(pending, db, safetyBackup.current)
            cancelRestore(); resetEditor(); setMessage('Restore completed successfully.')
            setRecords(await listRecords())
            await onDataRestored?.()
          })}>Replace data with backup</button>
          <button className="secondary" disabled={applying || busy} onClick={cancelRestore}>Cancel restore</button>
        </div>
      </div>}
    </section>
    <details className="diagnostics"><summary>Advanced · storage test records{dirty ? ' · Unsaved changes' : ''}</summary>
    <section aria-labelledby="records-heading">
      <h2 id="records-heading">Storage test records</h2>
      <p>Use disposable text to test local saving. These are not workout records.</p>
      <form onSubmit={event => { event.preventDefault(); void run(async () => {
        const saved = await saveRecord(text, editingId)
        // Keep a confirmed save distinct from a subsequent list refresh failure.
        setEditingId(saved.id); setBaseline(saved.text)
        setMessage('Saved to this device.')
        setSafetyReady(false)
        setRecords(await listRecords())
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
            void run(async () => { await deleteRecord(record.id); if (editingId === record.id) resetEditor(); setSafetyReady(false); setMessage('Record deleted.'); setRecords(await listRecords()) })
          }}>Delete</button>
        </div>
      </li>)}</ul>}
    </section>
    </details>
    <div aria-live="polite">{busy && <p>Working…</p>}{message && <p role="status">{message}</p>}</div>
    {error && <p role="alert" className="error">{error}</p>}
  </>
}
