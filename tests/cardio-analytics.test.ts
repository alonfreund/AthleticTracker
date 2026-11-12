import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { createBackup, restoreBackup } from '../src/data/backup/backup'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { blankCardioInput, deleteCardioSession, listCardioSessions, localDateTime, saveCardioSession } from '../src/data/repositories/cardio'
import { cardioBenchmarks, cardioChartPoints, cardioTotals, filterCardio } from '../src/domain/cardio/analytics'

it('keeps missing distances as gaps and compares exact-distance benchmarks within setting and timing groups', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(db)
    async function run(day: number, minutes: string, distance: string, setting = 'Outdoor') {
      return saveCardioSession('running', { ...blankCardioInput('running'), ...localDateTime(new Date(2026, 0, day, 8)),
        title: `Run ${day}`, minutes, distance, setting }, undefined, db)
    }
    const first = await run(1, '25', '5')
    await run(2, '20', '')
    await run(3, '25', '5')
    await run(4, '28', '7')
    const indoor = await run(5, '21', '5', 'Treadmill')
    const rows = await listCardioSessions(db)
    const live = { ...rows.find(row => row.session.id === indoor)!, session: { ...rows[0].session, id: 'live' },
      details: { ...rows[0].details, durationSeconds: 1200 }, timing: {} }
    const all = [...rows, live]
    const outdoor = filterCardio(all, 'running', 'Outdoor', 'manual')
    expect(cardioTotals(outdoor)).toEqual({ count: 4, duration: 5880, distance: 17000, distances: 3 })
    expect(cardioChartPoints(outdoor, 'pace').map(row => [row.value, row.breakBefore])).toEqual([[.3, false], [.3, true], [.24, false]])
    const matches = cardioBenchmarks(filterCardio(all, 'running', null, 'all')).filter(row => row.label === 'Fastest logged 5 km')
    expect(matches.map(row => row.row.session.id)).toEqual([first, indoor, 'live'])
    const backup = await createBackup(db)
    await deleteCardioSession(rows.find(row => row.session.id === first)!, db)
    expect(cardioBenchmarks(filterCardio(await listCardioSessions(db), 'running', 'Outdoor', 'manual')).find(row => row.label === 'Fastest logged 5 km')?.row.session.id).not.toBe(first)
    await restoreBackup(backup, db)
    expect(cardioBenchmarks(filterCardio(await listCardioSessions(db), 'running', 'Outdoor', 'manual')).find(row => row.label === 'Fastest logged 5 km')?.row.session.id).toBe(first)
  } finally { await db.delete() }
})
