import { useEffect, useRef, useState } from 'react'
import { requestPersistence, type PersistenceStatus } from '../data/storage/persistence'

export function StorageProtection() {
  const [status, setStatus] = useState<PersistenceStatus | 'checking'>('checking')
  const request = useRef<Promise<PersistenceStatus> | undefined>(undefined)
  useEffect(() => {
    let active = true
    request.current ??= requestPersistence()
    void request.current.then(value => { if (active) setStatus(value) })
    return () => { active = false }
  }, [])
  const labels = {
    checking: 'Requesting persistent storage…',
    granted: 'Persistent storage: granted by this browser.',
    'not-granted': 'Persistent storage: not granted. Data remains stored locally, but may be cleared under storage pressure.',
    unsupported: 'Persistent storage: this browser does not support requesting protection.',
    unavailable: 'Persistent storage: status unavailable.',
  }
  return <section aria-labelledby="protection-heading">
    <h2 id="protection-heading">Storage protection</h2>
    <p role="status">{labels[status]}</p>
    {(status === 'not-granted' || status === 'unavailable') && <button className="secondary" onClick={() => {
      setStatus('checking')
      void requestPersistence().then(setStatus)
    }}>Request storage protection</button>}
    <p className="note">Even when granted, deleting the app, clearing website data or losing the device can lose data. Keep backups outside the app.</p>
  </section>
}
