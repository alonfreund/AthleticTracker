import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { createBackup, validateBackup } from '../src/data/backup/backup'
import { exportBackupFile, discardStage, stageImport, stageSnapshot, restoreStagedBackup } from '../src/data/backup/pipeline'
import { AthleticDatabase, verifyLocalStorage } from '../src/data/db/database'
import { readAnalyticsOverview } from '../src/data/repositories/analytics'
import { blankCardioInput, saveCardioSession } from '../src/data/repositories/cardio'
import { activeMovementWorkout, addWorkoutExercise, finishWorkout, listWorkouts, loadWorkout, saveInlineSet, saveSetDraft, startWorkout } from '../src/data/repositories/workouts'
import { STARTER_EXERCISES } from '../src/domain/strength/catalog'
import { inputFromSet } from '../src/domain/strength/logging'

it('preserves all movement tracking modes, the unfinished draft, and discipline isolation through a mixed backup', async () => {
  const db = new AthleticDatabase(crypto.randomUUID())
  const restored = new AthleticDatabase(crypto.randomUUID())
  try {
    await verifyLocalStorage(db)
    await verifyLocalStorage(restored)
    await db.exercises.bulkAdd([...STARTER_EXERCISES])
    const strength = await startWorkout(db)
    const [bench] = STARTER_EXERCISES
    await addWorkoutExercise(strength, bench.id, db)
    const benchSet = (await loadWorkout(strength, db)).strengthSets[0]
    const benchInput = inputFromSet(benchSet)
    benchInput.values.reps = '5'
    benchInput.values.weight = '40'
    expect((await saveInlineSet(strength, benchSet.id, benchInput, true, db)).applied).toBe(true)
    await finishWorkout(strength, false, db)
    const cardio = await saveCardioSession('walking', { ...blankCardioInput('walking'), minutes: '10' }, undefined, db)

    const id = await startWorkout(db, 'calisthenics')
    expect((await activeMovementWorkout(db))?.discipline).toBe('calisthenics')
    await expect(startWorkout(db)).rejects.toThrow('active workout')
    await expect(addWorkoutExercise(id, bench.id, db)).rejects.toThrow('calisthenics exercise')
    const movementNames = ['Pull-up', 'Weighted pull-up', 'Assisted pull-up', 'Plank']
    for (const name of movementNames) await addWorkoutExercise(id, STARTER_EXERCISES.find(row => row.name === name)!.id, db)
    const workout = await loadWorkout(id, db)
    const draftSet = workout.strengthSets[0]
    const draft = inputFromSet(draftSet)
    draft.values.reps = 'unfinished'
    await saveSetDraft(id, draftSet.id, draft, db)
    db.close()
    await db.open()
    expect((await loadWorkout(id, db)).editorDrafts[0].values.reps).toBe('unfinished')

    const activeBackup = await createBackup(db)
    const activeFile = await exportBackupFile(db)
    const activeStage = await stageImport(activeFile.blob, restored)
    await restoreStagedBackup(activeStage, await stageSnapshot(restored), restored)
    await discardStage(activeFile.snapshot.id, db)
    expect((await createBackup(restored)).data).toEqual(activeBackup.data)
    expect((await activeMovementWorkout(restored))?.id).toBe(id)

    for (const exercise of workout.sessionExercises) {
      const row = workout.strengthSets.find(set => set.sessionExerciseId === exercise.id)!
      const input = inputFromSet(row)
      if (exercise.snapshot.tracking.measurement === 'duration') input.values.durationSeconds = '30'
      else input.values.reps = '8'
      if (row.load.mode === 'added' || row.load.mode === 'assisted') input.values.weight = '12'
      expect((await saveInlineSet(id, row.id, input, true, db)).applied).toBe(true)
    }
    const finished = await finishWorkout(id, false, db)
    expect(finished.strengthSets.find(row => row.durationSeconds !== null)?.durationSeconds).toBe(30)
    expect(finished.strengthSets.some(row => row.load.mode === 'added' && row.load.addedWeight?.value === 12)).toBe(true)
    expect(finished.strengthSets.some(row => row.load.mode === 'assisted' && row.load.assistance?.value === 12)).toBe(true)
    expect((await listWorkouts(db)).map(row => row.id)).toEqual([strength])
    expect((await listWorkouts(db, 'calisthenics')).map(row => row.id)).toEqual([id])
    expect((await readAnalyticsOverview(8, db)).weeks.reduce((sum, week) => sum + week.workouts, 0)).toBe(1)
    const backup = await createBackup(db)
    expect(backup.data.sessions.map(row => row.id)).toContain(cardio)
    const { handstandAttempts: _handstand, plancheAttempts: _planche, muscleupAttempts: _muscleups, pullupAttempts: _pullups, pushupAttempts: _attempts, ...legacyData } = backup.data
    const legacy = { ...backup, data: legacyData, formatVersion: 8 }
    expect(() => validateBackup(legacy)).toThrow('Calisthenics requires backup format 9')
    await expect(stageImport(new Blob([JSON.stringify(legacy)]), restored)).rejects.toThrow('Calisthenics requires backup format 9')
  } finally { await db.delete(); await restored.delete() }
})
