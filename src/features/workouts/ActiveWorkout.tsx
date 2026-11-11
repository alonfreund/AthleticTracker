import { groupLetter, groupProgress, supersetSlots, supersetRound, workoutBlocks } from '../../domain/strength/supersets'
import { replacementPlan } from '../../domain/strength/replacement'
import { SupersetEditor } from './SupersetEditor'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { updateSafety } from '../../app/updateSafety'
import type { ExerciseFilters } from '../../data/repositories/exercises'
import { ExerciseBrowser } from '../exercises/ExerciseBrowser'
import { saveSuperset, ungroupSuperset, saveSupersetRest, moveSupersetExercise, addSet, addWorkoutExercise, cancelWorkout, changeSetType, controlRest, discardSetDraft, finishWorkout, loadWorkout, moveWorkoutItem, previousPerformance, removeSet, removeWorkoutExercise, replaceWorkoutExercise, saveInlineSet, saveWorkoutDetails, setExerciseRest, saveExerciseRest, reorderExercises, replaceCurrentRest, timerSeconds, type PreviousExercise, type Workout } from '../../data/repositories/workouts'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, KeyboardSensor, closestCorners, pointerWithin, useSensor, useSensors, type DragEndEvent, type CollisionDetection } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableExercise } from './SortableExercise'
import { DurationEditor } from '../../components/DurationEditor'
import { inputFromSet } from '../../domain/strength/logging'
import type { Exercise, SessionExercise } from '../../domain/strength/models'
import { workoutLoadLabel } from '../../domain/strength/catalog'
import { useAutosave } from './useAutosave'
import { durationText } from './WorkoutHistory'
import { InlineSetStore } from './InlineSetStore'
import { ExerciseHistory } from './ExerciseHistory'
import { InlineSetRow } from './InlineSetRow'

const workoutCollision: CollisionDetection = args => {
  const pointed = pointerWithin(args)
  return pointed.length ? pointed : closestCorners(args)
}

function time(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
export function ActiveWorkout({ initial, library, onBack }: { initial: Workout; library: Exercise[]; onBack: () => void }) {
  const id = initial.sessions[0].id
  const [workout, setWorkout] = useState(initial)
  const [previous, setPrevious] = useState<Record<string, PreviousExercise>>({})
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [error, setError] = useState('')
  const [replacement, setReplacement] = useState<{ exerciseId: string; source?: Exercise }>()
  const [picker, setPicker] = useState(false)
  const [filters, setFilters] = useState<ExerciseFilters>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const pickerTrigger = useRef<HTMLButtonElement>(null)
  const returnPickerFocus = useRef(false)
  function closePicker() {
    returnPickerFocus.current = true
    setPicker(false)
  }
  const [groupSelection, setGroupSelection] = useState<{ ids: string[]; groupId?: string }>()
  const [groupDirty, setGroupDirty] = useState(false)
  const returnGroupFocus = useRef<string | undefined>(undefined)
  const [review, setReview] = useState<'finish' | 'cancel'>()
  const [removal, setRemoval] = useState<{ kind: 'exercise' | 'set'; id: string }>()
  const [dragging, setDragging] = useState<string>()
  const [restDrafts, setRestDrafts] = useState<Record<string, boolean>>({})
  const [timerEditor, setTimerEditor] = useState<number>()
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const reportRest = (key: string, dirty: boolean) => setRestDrafts(current => current[key] === dirty ? current : { ...current, [key]: dirty })
  const [now, setNow] = useState(Date.now())
  const mounted = useRef(true)
  const refreshRef = useRef<() => Promise<void>>(async () => {})
  const [store] = useState(() => new InlineSetStore(initial, async (setId, input, complete) => {
    const result = await saveInlineSet(id, setId, input, complete)
    await refreshRef.current()
    return result
  }))
  const rows = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const { applying } = useSyncExternalStore(updateSafety.subscribe, updateSafety.getSnapshot)
  const details = useAutosave({ title: initial.sessions[0].title, notes: initial.sessions[0].notes }, value => saveWorkoutDetails(id, value.title, value.notes))
  const detailsRef = useRef(details); detailsRef.current = details
  const completing = useRef(new Set<string>())
  const dirty = groupDirty || details.dirty || rows.dirty || Object.values(restDrafts).some(Boolean)
  const saving = busy || details.saving || rows.saving || !!dragging
  useLayoutEffect(() => { updateSafety.setSafety({ dirty, busy: saving, restoring: false, loading: false }) }, [dirty, saving])
  refreshRef.current = async () => { const value = await loadWorkout(id); if (mounted.current) { store.sync(value); setWorkout(value); setNow(Date.now()) } }
  useEffect(() => {
    mounted.current = true
    const hidden = () => { if (document.visibilityState === 'hidden') void store.flush().catch(() => {}) }
    const guard = (event: BeforeUnloadEvent) => { const status = store.getSnapshot(); if (status.dirty || status.saving || lock.current || updateSafety.getSnapshot().dirty || detailsRef.current.dirty || detailsRef.current.saving) event.preventDefault() }
    document.addEventListener('visibilitychange', hidden); window.addEventListener('beforeunload', guard)
    return () => { mounted.current = false; store.dispose(); document.removeEventListener('visibilitychange', hidden); window.removeEventListener('beforeunload', guard) }
  }, [store])
  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(interval) }, [])
  const exerciseIds = workout.sessionExercises.map(row => row.id).join(',')
  useEffect(() => { let active = true; void previousPerformance(id).then(value => { if (active) setPrevious(value) }).catch(() => { if (active) setError('Previous performance could not be loaded. Current logging is still available.') }); return () => { active = false } }, [id, exerciseIds])
  async function run(action: () => Promise<unknown>, after?: () => void) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true; updateSafety.setBusy(true); setBusy(true); setError('')
    try { await store.flush(); await details.flush(); await action(); await refreshRef.current(); after?.() }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not save workout.'); await refreshRef.current().catch(() => {}) }
    finally { lock.current = false; updateSafety.setBusy(false); setBusy(false) }
  }
  const invoke = (action: () => Promise<unknown>, after?: () => void) => { void run(action, after) }
  const blocked = busy || applying || !!dragging
  const reorderBlocked = busy || applying || rows.saving || details.saving || Object.values(restDrafts).some(Boolean)
  const structuralBlocked = reorderBlocked || !!dragging
  useLayoutEffect(() => {
    if (!picker && !blocked && returnPickerFocus.current) {
      returnPickerFocus.current = false
      pickerTrigger.current?.focus()
    }
  }, [picker, blocked])
  async function saveRest(action: () => Promise<unknown>) {
    let saved = false
    await run(async () => { await action(); saved = true })
    if (!saved) throw new Error('Could not save rest settings. Please retry.')
  }
  const blocks = workoutBlocks(workout)
  const groupBlocks = blocks.filter(block => block.group)
  const groupCode = (groupId: string) => groupLetter(groupBlocks.findIndex(block => block.group?.id === groupId))
  function blockName(blockId: string | number) {
    const block = blocks.find(row => row.id === blockId)
    return block?.group ? `Superset ${groupCode(block.group.id)}` : sessionExerciseName(block?.exercises[0].id)
  }
  function drop(event: DragEndEvent) {
    setDragging(undefined)
    if (!event.over || event.active.id === event.over.id) return
    const next = arrayMove(blocks, blocks.findIndex(block => block.id === event.active.id), blocks.findIndex(block => block.id === event.over!.id))
    const orderedIds = next.flatMap(block => block.exercises.map(row => row.id))
    const positions = new Map(orderedIds.map((id, position) => [id, position]))
    setWorkout(current => ({
      ...current, sessionExercises: current.sessionExercises.map(row => ({ ...row, position: positions.get(row.id)! })),
    }))
    invoke(() => reorderExercises(id, orderedIds))
  }
  function openSuperset(exerciseId: string, groupId?: string) {
    setError('')
    returnGroupFocus.current = exerciseId
    setGroupSelection({ ids: groupId ? workout.sessionExercises.filter(row => row.supersetGroupId === groupId).map(row => row.id) : [exerciseId], groupId })
  }
  function closeSuperset() {
    setGroupDirty(false)
    setGroupSelection(undefined)
  }
  useLayoutEffect(() => {
    if (!groupSelection && !replacement && !blocked && returnGroupFocus.current) {
      document.getElementById('exercise-' + returnGroupFocus.current)?.focus()
      returnGroupFocus.current = undefined
    }
  }, [groupSelection, replacement, blocked])
  const completed = workout.strengthSets.filter(set => set.completed).length
  const incomplete = workout.strengthSets.length - completed
  const timer = workout.restTimers[0]
  const remaining = timer ? timerSeconds(timer, now) : 0
  function sessionExerciseName(id: string | number | undefined, fallback = 'exercise') {
    const snapshot = workout.sessionExercises.find(row => row.id === id)?.snapshot
    return snapshot ? exerciseDisplayName(snapshot) : fallback
  }
  const showTimer = timer && ['running', 'paused'].includes(timer.status)
  const timerSource = workout.strengthSets.find(set => set.id === timer?.sourceSetId)
  const timerRound = timerSource ? supersetRound(workout, timerSource) : undefined
  const timerLabel = timerRound
    ? `Superset ${groupCode(timerRound.group.id)} · ${timerRound.complete ? 'Between rounds' : 'Between exercises'} · Round ${timerRound.index + 1}`
    : sessionExerciseName(timerSource?.sessionExerciseId, '')

  useEffect(() => {
    setTimerEditor(undefined)
  }, [timer?.sourceSetId, showTimer])

  useLayoutEffect(() => {
    if (replacement?.source) document.getElementById('replace-exercise-heading')?.focus()
  }, [replacement?.source])

  function exerciseCard(exercise: SessionExercise, code?: string, memberIndex = 0, memberCount = 1) {
    const Heading = code ? 'h4' : 'h3'
    const config = exercise.snapshot.tracking
    const sets = workout.strengthSets.filter(set => set.sessionExerciseId === exercise.id).sort((a, b) => a.position - b.position)
    const prior = previous[exercise.id]
    const rest = exercise.restSeconds ?? exercise.snapshot.defaultRestSeconds
    const units = new Set(sets.map(set => rows.rows[set.id]?.input.weightUnit ?? 'kg'))
    const weightLabel = config.load === 'added' ? 'Added' : config.load === 'assisted' ? 'Assist' : config.load === 'bodyweight' ? 'BW' : config.load === 'none' ? 'Load' : units.size > 1 ? 'Weight' : ([...units][0] ?? 'kg').toUpperCase()
    const canReplace = !sets.length || sets.some(set => !set.completed)
    return <div className={code ? 'superset-exercise inline-exercise' : undefined} key={exercise.id} role={code ? 'group' : undefined} aria-labelledby={code ? 'exercise-' + exercise.id : undefined}>
      <div className="exercise-card-heading"><Heading id={'exercise-' + exercise.id} tabIndex={-1}>{code && <span className="superset-member-label">{code} </span>}{exerciseDisplayName(exercise.snapshot)}</Heading><details className="exercise-menu"><summary aria-label={`${exerciseDisplayName(exercise.snapshot)}, exercise options`}>⋯</summary><div className="actions"><button className="secondary" disabled={structuralBlocked || !canReplace} onClick={() => {
        invoke(async () => {}, () => {
          returnGroupFocus.current = exercise.id
          setReplacement({ exerciseId: exercise.id })
        })
      }}>Replace exercise</button>{!canReplace && <p className="note">All sets are complete. Use Add exercise to log a substitute.</p>}{!exercise.supersetGroupId && <button className="secondary" disabled={structuralBlocked || workout.sessionExercises.filter(row => !row.supersetGroupId).length < 2} onClick={() => openSuperset(exercise.id)}>Create superset</button>}<button className="secondary" disabled={structuralBlocked} onClick={() => setRemoval({ kind: 'exercise', id: exercise.id })}>Remove exercise</button></div></details></div>
      {exercise.supersetGroupId && <div className="superset-member-actions">
        <button className="secondary" aria-label={`Move ${code} ${exerciseDisplayName(exercise.snapshot)} earlier in superset`} disabled={structuralBlocked || memberIndex === 0} onClick={() => invoke(() => moveSupersetExercise(id, exercise.supersetGroupId!, exercise.id, -1))}>Move earlier</button>
        <button className="secondary" aria-label={`Move ${code} ${exerciseDisplayName(exercise.snapshot)} later in superset`} disabled={structuralBlocked || memberIndex === memberCount - 1} onClick={() => invoke(() => moveSupersetExercise(id, exercise.supersetGroupId!, exercise.id, 1))}>Move later</button>
      </div>}
      <div className="exercise-card-subtitle"><span>{workoutLoadLabel(config)}{config.load !== 'none' && ` · ${units.size > 1 ? 'units per row' : [...units][0]}`}</span><details className="rest-preference"><summary>{exercise.supersetGroupId ? 'Warm-up / individual rest' : 'Rest'} {rest ? time(rest) : 'off'}</summary><div className="rest-preference__editor"><p><strong>Saved exercise preference</strong></p><p className="note">{exercise.supersetGroupId ? 'Used for warm-up sets and independent exercises. Working sets use the superset rest settings.' : 'Applies to this workout and future workouts. Does not change a countdown already running.'}</p><DurationEditor seconds={rest ?? 0} label={`${exerciseDisplayName(exercise.snapshot)}, saved rest`} saveLabel={exercise.sourceExerciseId ? 'Save exercise default' : 'Save for this workout'} disabled={blocked} onDirty={value => reportRest(exercise.id, value)} onSave={seconds => saveRest(() => exercise.sourceExerciseId ? saveExerciseRest(id, exercise.id, seconds) : setExerciseRest(id, exercise.id, seconds))} onUseGlobal={exercise.sourceExerciseId ? () => saveRest(() => saveExerciseRest(id, exercise.id, null)) : undefined} /></div></details></div>
      {exercise.notes && <p className="note multiline">{exercise.notes}</p>}
      <ExerciseHistory exerciseId={exercise.snapshot.id} name={exerciseDisplayName(exercise.snapshot)}
        previousDate={prior?.date} disabled={blocked} />
      <div className="inline-set__head" aria-hidden="true"><span>Set</span><span>Previous</span><span>{weightLabel}</span><span>{config.measurement === 'reps' ? 'Reps' : 'Secs'}</span><span>✓</span></div>
      {sets.map((set, index) => {
        const row = rows.rows[set.id]
        if (!row) return null
        const ordinal = sets.slice(0, index).filter(value => value.setType === set.setType).length
        const last = prior?.sets.filter(value => value.setType === set.setType)[ordinal]
        return <InlineSetRow key={set.id} exercise={exercise} set={set} row={row} index={index} last={index === sets.length - 1} previous={last} disabled={blocked}
          onChange={input => { if (!lock.current && !updateSafety.getSnapshot().applying) store.change(set.id, input) }} onSave={() => { void store.save(set.id).catch(() => {}) }}
          onComplete={() => { if (!lock.current && !completing.current.has(set.id)) { completing.current.add(set.id); void store.save(set.id, !set.completed).catch(() => {}).finally(() => completing.current.delete(set.id)) } }}
          onType={type => { if (!structuralBlocked) invoke(() => changeSetType(id, set.id, type)) }} onMove={direction => { if (!structuralBlocked) invoke(() => moveWorkoutItem(id, 'set', set.id, direction)) }} onRemove={() => { if (!structuralBlocked) setRemoval({ kind: 'set', id: set.id }) }}
          onRevert={() => invoke(async () => { await discardSetDraft(id, set.id); const current = await loadWorkout(id); store.reset(set.id, inputFromSet(current.strengthSets.find(value => value.id === set.id)!)) })} />
      })}
      <button className="add-set" disabled={structuralBlocked} onClick={() => invoke(() => addSet(id, exercise.id))}>+ Add set<span className="sr-only"> to {exerciseDisplayName(exercise.snapshot)}</span></button>
    </div>
  }
  if (replacement) {
    const plan = replacementPlan(workout, replacement.exerciseId)
    const source = replacement.source
    return <section aria-labelledby="replace-exercise-heading">
      <h2 id="replace-exercise-heading" tabIndex={-1}>Replace {plan ? exerciseDisplayName(plan.exercise.snapshot) : 'exercise'}</h2>
      {plan && source && <>
        <p>{exerciseDisplayName(source)} will get {plan.remaining.length} blank {plan.remaining.length === 1 ? 'set' : 'sets'}.</p>
        {plan.completed > 0 && <p>{plan.completed} completed {plan.completed === 1 ? 'set stays' : 'sets stay'} with {exerciseDisplayName(plan.exercise.snapshot)}.</p>}
        {plan.exercise.supersetGroupId && <p>The substitute takes over the remaining sets in the same superset slot.</p>}
        {plan.entered > 0 && <p role="alert">Replacing discards saved values or drafts in {plan.entered} unfinished {plan.entered === 1 ? 'set' : 'sets'}.</p>}
        {plan.discardsNotes && <p>The original exercise notes will be discarded.</p>}
        <div className="actions">
          <button disabled={blocked || (plan.completed > 0 && !plan.remaining.length)} onClick={() => {
            invoke(async () => {
              returnGroupFocus.current = await replaceWorkoutExercise(id, replacement.exerciseId, source.id, plan.revision)
            }, () => setReplacement(undefined))
          }}>{plan.entered || plan.discardsNotes ? 'Discard and replace' : 'Confirm replacement'}</button>
          <button className="secondary" disabled={blocked} onClick={() => setReplacement({ exerciseId: replacement.exerciseId })}>Choose another exercise</button>
        </div>
      </>}
      <button className="secondary" disabled={blocked} onClick={() => { setError(''); setReplacement(undefined) }}>Cancel replacement</button>
      {plan && !source && <ExerciseBrowser picker exercises={library.filter(row => row.id !== plan.exercise.snapshot.id)}
        filters={filters} onFiltersChange={setFilters} filtersOpen={filtersOpen} onFiltersOpenChange={setFiltersOpen}
        disabled={blocked} onSelect={source => setReplacement({ ...replacement, source })} />}
      {busy && <p role="status">Saving replacement…</p>}
      {error && <p role="alert" className="error">{error}</p>}
    </section>
  }
  if (groupSelection) return <>
    <SupersetEditor exercises={workout.sessionExercises} initialIds={groupSelection.ids} groupId={groupSelection.groupId}
      disabled={blocked} onDirty={() => setGroupDirty(true)}
      onCancel={closeSuperset}
      onSave={ids => invoke(() => saveSuperset(id, ids, groupSelection.groupId ?? null), closeSuperset)} />
    {busy && <p role="status">Saving superset…</p>}
    {error && <p role="alert" className="error">{error}</p>}
  </>
  return <section aria-label="Active workout" className={`active-workout inline-workout ${showTimer ? 'has-rest-timer' : ''}`}>
    <div className="workout-title"><p className="eyebrow">ACTIVE WORKOUT</p><strong>{durationText(workout.sessions[0].startedAt, new Date(now).toISOString())} elapsed</strong></div>
    <label className="sr-only" htmlFor="workout-title">Workout name</label><input className="workout-name" id="workout-title" maxLength={200} value={details.value.title} disabled={blocked} onChange={event => details.change({ ...details.value, title: event.target.value })} onBlur={() => void details.flush().catch(() => {})} />
    <details className="workout-notes"><summary>Workout notes{details.value.notes ? ' · added' : ''}</summary><label className="sr-only" htmlFor="workout-notes">Workout notes</label><textarea id="workout-notes" maxLength={10000} value={details.value.notes} disabled={blocked} onChange={event => details.change({ ...details.value, notes: event.target.value })} /></details>
    <div className="workout-save-line"><span>{completed} completed · {incomplete} incomplete</span><span role="status">{saving ? 'Saving…' : dirty ? 'Changes not saved yet' : Object.values(rows.rows).some(row => row.pending) ? 'Drafts saved · check pending rows' : 'Saved on this device'}</span></div>
    {details.error && <p role="alert" className="error">{details.error}<button onClick={() => void details.flush().catch(() => {})}>Retry</button></p>}
    {!workout.sessionExercises.length && <p>Add an exercise to begin. Your empty workout is already saved.</p>}
    <p id="exercise-drag-instructions" className="note drag-instructions">Hold ⠿ to reorder exercises or whole supersets. Scroll anywhere else.<span className="sr-only"> Keyboard: Space, arrow keys, Space to drop; Escape to cancel.</span></p>
    <DndContext accessibility={{ announcements: {
      onDragStart: ({ active }) => `Picked up ${blockName(active.id)}.`,
      onDragOver: ({ over }) => over ? `Over ${blockName(over.id)}.` : 'Outside exercise list.',
      onDragEnd: () => 'Dropped exercise. Saving order.', onDragCancel: () => 'Reordering cancelled. Order unchanged.',
    } }} sensors={sensors} collisionDetection={workoutCollision} onDragStart={event => { setDragging(String(event.active.id)); updateSafety.setBusy(true) }} onDragEnd={drop} onDragCancel={() => setDragging(undefined)}>
    <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
    {blocks.map(block => <SortableExercise key={block.id} id={block.id} name={blockName(block.id)}
      disabled={reorderBlocked} className={block.group ? 'superset-group' : ''}>
      {block.group ? <>
        <div className="superset-heading"><h3>Superset {groupCode(block.group.id)}</h3><span>{supersetSlots(block.exercises).length} exercises</span></div>
        <SupersetProgress workout={workout} exercises={block.exercises} />
        <div className="actions superset-actions">
          <button className="secondary" disabled={structuralBlocked} onClick={() => openSuperset(block.exercises[0].id, block.group!.id)}>Edit exercises</button>
          <button className="secondary" disabled={structuralBlocked} onClick={() => {
            returnGroupFocus.current = block.exercises[0].id
            invoke(() => ungroupSuperset(id, block.group!.id))
          }}>Ungroup</button>
        </div>
        <details className="superset-rest"><summary>Rest settings · {time(block.group.betweenExerciseRestSeconds)} between exercises · {time(block.group.betweenRoundRestSeconds)} between rounds</summary>
          <p className="note">Applies to this superset in this workout. A running countdown keeps its current time.</p>
          <DurationEditor seconds={block.group.betweenExerciseRestSeconds} label={`Superset ${groupCode(block.group.id)}, between exercises`} saveLabel="Save between-exercise rest"
            disabled={blocked} onDirty={value => reportRest(block.id + '-exercises', value)}
            onSave={seconds => saveRest(() => saveSupersetRest(id, block.group!.id, 'betweenExerciseRestSeconds', seconds))} />
          <DurationEditor seconds={block.group.betweenRoundRestSeconds} label={`Superset ${groupCode(block.group.id)}, between rounds`} saveLabel="Save between-round rest"
            disabled={blocked} onDirty={value => reportRest(block.id + '-rounds', value)}
            onSave={seconds => saveRest(() => saveSupersetRest(id, block.group!.id, 'betweenRoundRestSeconds', seconds))} />
        </details>
        {
          supersetSlots(block.exercises).map((slot, index, slots) =>
            slot.map(exercise => exerciseCard(exercise, groupCode(block.group!.id) + (index + 1), index, slots.length)))
        }
      </> : exerciseCard(block.exercises[0])}
    </SortableExercise>)}
    </SortableContext><DragOverlay dropAnimation={null}>{dragging && <div className="exercise-drag-overlay"><span aria-hidden="true">⠿</span><strong>{blockName(dragging)}</strong><span>Drop to save order</span></div>}</DragOverlay>
    </DndContext>
    <div className="actions workout-actions"><button ref={pickerTrigger} type="button" aria-expanded={picker} aria-controls={picker ? 'workout-exercise-picker' : undefined} disabled={blocked} onClick={() => picker ? closePicker() : setPicker(true)}>{picker ? 'Close exercise picker' : '+ Add exercise'}</button><button disabled={blocked || completed === 0} onClick={() => { setReview('finish'); setPicker(false) }}>Review and finish</button><button className="secondary" disabled={blocked} onClick={() => invoke(async () => {}, onBack)}>Back — workout stays active</button><button className="secondary" disabled={blocked} onClick={() => setReview('cancel')}>Cancel workout</button></div>
    {picker && <section className="exercise-picker" id="workout-exercise-picker" aria-labelledby="workout-exercise-picker-heading">
      <h3 id="workout-exercise-picker-heading">Add a library exercise</h3>
      <ExerciseBrowser picker exercises={library} filters={filters} onFiltersChange={setFilters}
        filtersOpen={filtersOpen} onFiltersOpenChange={setFiltersOpen} disabled={blocked}
        onSelect={exercise => invoke(() => addWorkoutExercise(id, exercise.id), closePicker)} />
    </section>}
    {removal && <div className="review-box" role="alert"><p>Remove this {removal.kind} and its saved values and drafts? This cannot be undone here.</p><div className="actions"><button disabled={blocked} onClick={() => invoke(() => removal.kind === 'exercise' ? removeWorkoutExercise(id, removal.id) : removeSet(id, removal.id), () => setRemoval(undefined))}>Confirm removal</button><button className="secondary" disabled={blocked} onClick={() => setRemoval(undefined)}>Keep it</button></div></div>}
    {review && <div className="review-box" role="alert"><h3>{review === 'finish' ? 'Finish this workout?' : 'Cancel this workout?'}</h3><p>{review === 'finish' ? `${completed} completed sets will count. ${incomplete} incomplete sets stay in history. Pending invalid edits must be corrected or reverted first.` : 'Recorded sets stay in cancelled history. Pending drafts will be discarded.'}</p><div className="actions"><button disabled={blocked} onClick={() => invoke(() => review === 'finish' ? finishWorkout(id, true) : cancelWorkout(id), onBack)}>{review === 'finish' ? 'Finish with completed sets' : 'Confirm cancellation'}</button><button className="secondary" disabled={blocked} onClick={() => setReview(undefined)}>Keep logging</button></div></div>}
    {error && <p role="alert" className="error">{error}</p>}
    {showTimer && <aside className={`rest-timer ${timerRound ? 'rest-timer--superset' : ''}`} aria-label="Rest timer"><div className="rest-timer__heading"><strong>{remaining ? `${timer.status === 'paused' ? 'Paused' : 'Rest'} ${time(remaining)}` : 'Rest complete'}</strong><span>{timerLabel}</span></div><p className="rest-timer__scope">Current timer only · saved defaults unchanged</p><div className="rest-timer__controls"><button disabled={blocked || !remaining} aria-label="Subtract 15 seconds" onClick={() => invoke(() => controlRest(id, 'adjust', -15))}>−15s</button><button disabled={blocked || !remaining} onClick={() => invoke(() => controlRest(id, timer.status === 'paused' ? 'resume' : 'pause'))}>{timer.status === 'paused' ? 'Resume' : 'Pause'}</button><button disabled={blocked || !remaining} aria-label="Add 15 seconds" onClick={() => invoke(() => controlRest(id, 'adjust', 15))}>+15s</button><button disabled={blocked} onClick={() => invoke(() => controlRest(id, 'skip'))}>{remaining ? 'Skip' : 'Dismiss'}</button></div><button className="timer-edit-toggle" aria-expanded={timerEditor !== undefined} disabled={blocked} onClick={() => setTimerEditor(timerEditor === undefined ? remaining : undefined)}>{timerEditor === undefined ? 'Set exact remaining time' : 'Close timer adjustment'}</button>{timerEditor !== undefined && <DurationEditor seconds={timerEditor} label="Current timer only" saveLabel="Apply to current timer" disabled={blocked} onDirty={value => reportRest('timer', value)} onSave={seconds => saveRest(async () => { await replaceCurrentRest(id, seconds); setTimerEditor(undefined) })} />}</aside>}
  </section>
}

function SupersetProgress({ workout, exercises }: { workout: Workout; exercises: SessionExercise[] }) {
  const progress = groupProgress(workout, exercises)
  if (!progress.rounds) return <p className="superset-progress">Add working sets to begin. Warm-ups use individual rest.</p>
  if (!progress.next) return <p className="superset-progress" role="status">All {progress.rounds} {progress.rounds === 1 ? 'round' : 'rounds'} completed</p>
  return <p className="superset-progress" role="status">Round {progress.round} of {progress.rounds} · {progress.participants} exercises this round<br />Next: {exerciseDisplayName(progress.next.snapshot)}</p>
}
