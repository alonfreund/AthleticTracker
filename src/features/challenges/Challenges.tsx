import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { liveQuery } from 'dexie'
import { Button } from '../../components/ui/Button'
import { updateSafety } from '../../app/updateSafety'
import { db } from '../../data/db/database'
import { createChallenge, deleteChallenge, deleteChallengeAttempt, listChallengeAttempts, listChallenges, listChallengeVersions, recordChallengeAttempt, updateChallenge, updateChallengeAttempt } from '../../data/repositories/challenges'
import { challengeRoot, challengeVersion, compareResults, emptyResult, formatResult, isBetter, MAX_METRICS, METRIC_TYPES, parseResult, resultInput,
  type Challenge, type ChallengeAttempt, type ChallengeMetric, type ChallengeSetup, type Result, type ResultInput } from '../../domain/challenges/models'
import { ExerciseChart } from '../analytics/ExerciseChart'

function useSave(dirty: boolean) {
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useLayoutEffect(() => {
    updateSafety.setSafety({ dirty, busy, loading: false, restoring: false })
  }, [dirty, busy])
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty || lock.current) event.preventDefault() }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])
  async function save(action: () => Promise<void>, after?: () => void) {
    if (lock.current || updateSafety.getSnapshot().applying) return
    lock.current = true
    setBusy(true)
    updateSafety.setBusy(true)
    setError('')
    try { await action() }
    catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save.')
      return
    } finally {
      lock.current = false
      setBusy(false)
      updateSafety.setBusy(false)
    }
    after?.()
  }
  return { busy, error, save, clearError: () => setError('') }
}

export function ChallengeList({ blocked, onBack, onNew, onOpen }: {
  blocked: boolean; onBack: () => void; onNew: () => void; onOpen: (id: string) => void
}) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listChallenges>> | null>()
  useEffect(() => {
    const subscription = liveQuery(() => listChallenges()).subscribe({ next: setRows, error: () => setRows(null) })
    return () => subscription.unsubscribe()
  }, [])
  return <>
    <Button className="section-back" variant="secondary" disabled={blocked} onClick={onBack}>Back to Performance</Button>
    <section className="surface-card">
      <h2>Your challenges</h2>
      <Button disabled={blocked} onClick={onNew}>New challenge</Button>
      {rows === null ? <p role="alert">Could not load challenges.</p> : !rows ? <p role="status">Loading challenges…</p> :
        rows.length === 0 ? <p className="note">Create a challenge, finisher or performance test to start tracking results.</p> :
        <div className="challenge-list">{rows.map(({ challenge, latest, best }) =>
          <button type="button" key={challenge.id} className="exercise-row rep-track" disabled={blocked} onClick={() => onOpen(challengeRoot(challenge))}>
            <strong>{challenge.name}</strong>
            <span>{challenge.kind} · {challenge.metrics[0].name}</span>
            <span>{latest == null ? 'No attempts yet' : `Latest: ${formatResult(latest, challenge.metrics[0])}`}
              {best !== undefined && ` · Best: ${formatResult(best, challenge.metrics[0])}`}</span>
          </button>)}</div>}
    </section>
  </>
}

const fieldUnits: Partial<Record<ChallengeMetric['type'], string>> = { time: 'seconds', distance: 'm', weight: 'kg' }

function ResultFields({ label, metric, input, onChange, required = false }: {
  label: string; metric: ChallengeMetric; input: ResultInput; onChange: (value: ResultInput) => void; required?: boolean
}) {
  const pair = metric.type === 'rounds-reps'
  const unit = metric.type === 'custom' ? metric.unit : fieldUnits[metric.type]
  return <div className={pair ? 'challenge-fields' : undefined}>
    <label>{label}{pair ? ' (rounds)' : unit ? ` (${unit})` : ''}
      <input required={required} inputMode={pair || metric.type === 'reps' || metric.type === 'rounds' ? 'numeric' : 'decimal'} maxLength={24}
        value={input.value} onChange={event => onChange({ ...input, value: event.target.value })} />
    </label>
    {pair && <label>{label} (extra reps)<input inputMode="numeric" maxLength={24} placeholder="0" value={input.extra}
      onChange={event => onChange({ ...input, extra: event.target.value })} /></label>}
  </div>
}

const newMetric = (): ChallengeMetric => ({ name: '', type: 'reps', direction: 'higher', unit: '' })
const initialMetrics = [newMetric()]
export function ChallengeBuilder({ blocked, onBack, onSaved, existing }: {
  blocked: boolean; onBack: () => void; onSaved: (id: string) => void; existing?: Challenge
}) {
  const [name, setName] = useState(existing?.name ?? '')
  const [rules, setRules] = useState(existing?.rules ?? '')
  const [kind, setKind] = useState<Challenge['kind']>(existing?.kind ?? 'Challenge')
  const [metrics, setMetrics] = useState(existing?.metrics ?? initialMetrics)
  const [target, setTarget] = useState(() => resultInput(existing?.target))
  const [changesTest, setChangesTest] = useState(false)
  const [structureChanged, setStructureChanged] = useState(false)
  const originalTarget = resultInput(existing?.target)
  const dirty = name !== (existing?.name ?? '') || rules !== (existing?.rules ?? '') ||
    kind !== (existing?.kind ?? 'Challenge') || metrics !== (existing?.metrics ?? initialMetrics) ||
    target.value !== originalTarget.value || target.extra !== originalTarget.extra || changesTest
  const { save, busy, error } = useSave(dirty)
  const primary = metrics[0]
  function changeMetric(index: number, changes: Partial<ChallengeMetric>) {
    setMetrics(current => current.map((metric, position) => position === index ? { ...metric, ...changes } : metric))
    if (index === 0 && (changes.type || changes.direction === 'trend' || changes.unit !== undefined)) setTarget(emptyResult())
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    let id = ''
    void save(async () => {
      const result = primary.direction === 'trend' ? null : parseResult(target, primary)
      const setup: ChallengeSetup = { name: name.trim(), rules: rules.trim(), kind,
        metrics: metrics.map(metric => ({ ...metric, name: metric.name.trim(), unit: metric.unit.trim() })),
        ...(result === null ? {} : { target: result }) }
      const challenge = existing ? await updateChallenge(existing.id, setup, structureChanged || (changesTest && setup.rules !== existing.rules)) :
        await createChallenge(setup)
      id = challengeRoot(challenge)
    }, () => {
      updateSafety.setSafety({ dirty: false, busy: false, loading: false, restoring: false })
      onSaved(id)
    })
  }
  return <>
    <Button className="section-back" variant="secondary" disabled={blocked} onClick={onBack}>{existing ? 'Back to challenge' : 'Back to Challenges'}</Button>
    <form className="surface-card" onSubmit={submit}>
      <fieldset className="form-fields" disabled={blocked}>
        <label>Name<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label>
        <label>Category<select value={kind} onChange={event => setKind(event.target.value as Challenge['kind'])}>
          <option>Challenge</option><option>Finisher</option><option>Performance test</option>
        </select></label>
        <label>Rules or instructions (optional)<textarea maxLength={3000} value={rules} onChange={event => setRules(event.target.value)} /></label>
        {existing && rules.trim() !== existing.rules && <label className="confirmation">
          <input type="checkbox" checked={changesTest} onChange={event => setChangesTest(event.target.checked)} />
          This changes how the test is performed
        </label>}
        {existing && <p className="note">Changes to the test or metric setup start a new version when this version has attempts.</p>}
        <div className="challenge-list">
          {metrics.map((metric, index) => <fieldset className="form-fields challenge-metric" key={index}>
            <legend>{index === 0 ? 'Primary metric' : `Secondary metric ${index}`}</legend>
            <label>Metric name<input required maxLength={60} value={metric.name} onChange={event => changeMetric(index, { name: event.target.value })} /></label>
            <label>Measurement<select value={metric.type} onChange={event => {
              const type = event.target.value as ChallengeMetric['type']
              changeMetric(index, { type, unit: '', direction: type === 'time' ? 'lower' : 'higher' })
            }}>{Object.entries(METRIC_TYPES).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></label>
            {metric.type === 'custom' && <label>Unit (optional)<input maxLength={20} value={metric.unit} onChange={event => changeMetric(index, { unit: event.target.value })} /></label>}
            <label>Scoring<select value={metric.direction} onChange={event => changeMetric(index, { direction: event.target.value as ChallengeMetric['direction'] })}>
              <option value="higher">Higher is better</option><option value="lower">Lower is better</option><option value="trend">Trend only</option>
            </select></label>
            {index > 0 && <div className="actions">
              <Button variant="secondary" onClick={() => {
                setStructureChanged(true)
                setMetrics(current => [current[index], ...current.slice(0, index), ...current.slice(index + 1)])
                setTarget(emptyResult())
              }}>Make primary</Button>
              <Button variant="secondary" onClick={() => {
                setStructureChanged(true)
                setMetrics(current => current.filter((_, position) => position !== index))
              }}>Remove metric</Button>
            </div>}
          </fieldset>)}
        </div>
        {metrics.length < MAX_METRICS && <Button variant="secondary" onClick={() => { setStructureChanged(true); setMetrics(current => [...current, newMetric()]) }}>Add secondary metric</Button>}
        {primary.direction !== 'trend' && <ResultFields label="Primary target (optional)" metric={primary} input={target} onChange={setTarget} />}
        <Button type="submit">{busy ? 'Saving…' : existing ? 'Save changes' : 'Create challenge'}</Button>
      </fieldset>
      {error && <p role="alert" className="error">{error}</p>}
    </form>
  </>
}

export function ChallengeDetail({ id, blocked, onBack }: { id: string; blocked: boolean; onBack: () => void }) {
  const [data, setData] = useState<{ challenge: Challenge; attempts: ChallengeAttempt[] }[] | null>()
  const [selected, setSelected] = useState<string>()
  const [editing, setEditing] = useState(false)
  const { save, error } = useSave(false)
  useEffect(() => {
    const subscription = liveQuery(() => db.transaction('r', [db.challenges, db.challengeAttempts], async () => {
      const versions = await listChallengeVersions(id)
      return Promise.all(versions.map(async challenge => ({ challenge, attempts: await listChallengeAttempts(challenge.id) })))
    })).subscribe({ next: setData, error: () => setData(null) })
    return () => subscription.unsubscribe()
  }, [id])
  const current = data?.[0]
  const active = data?.find(row => row.challenge.id === selected) ?? current
  if (editing && current) return <ChallengeBuilder existing={current.challenge} blocked={blocked}
    onBack={() => {
      if (!updateSafety.getSnapshot().dirty || window.confirm('Discard unsaved changes?')) setEditing(false)
    }} onSaved={() => { setEditing(false); setSelected(undefined) }} />
  return <div className="performance-disciplines">
    <Button className="section-back" variant="secondary" disabled={blocked} onClick={onBack}>Back to Challenges</Button>
    {data === null ? <p role="alert">Could not load challenge.</p> : !data ? <p role="status">Loading challenge…</p> :
      active && current ? <>
        <section className="surface-card">
          <div className="actions">
            <Button variant="secondary" disabled={blocked} onClick={() => {
              if (!updateSafety.getSnapshot().dirty || window.confirm('Discard unsaved changes?')) setEditing(true)
            }}>{active.challenge.id === current.challenge.id ? 'Edit challenge' : 'Edit current version'}</Button>
            <Button variant="danger" disabled={blocked} onClick={() => {
              if (updateSafety.getSnapshot().dirty && !window.confirm('Discard unsaved changes?')) return
              const count = data.reduce((total, row) => total + row.attempts.length, 0)
              if (window.confirm(`Delete this challenge and its ${count} saved ${count === 1 ? 'attempt' : 'attempts'} across all versions?`)) {
                void save(() => deleteChallenge(id, count), () => {
                  updateSafety.setSafety({ dirty: false, busy: false, loading: false, restoring: false })
                  onBack()
                })
              }
            }}>Delete challenge</Button>
          </div>
          {error && <p role="alert" className="error">{error}</p>}
          {data.length > 1 && <label>Version<select disabled={blocked} value={active.challenge.id} onChange={event => {
            if (!updateSafety.getSnapshot().dirty || window.confirm('Discard unsaved changes?')) setSelected(event.target.value === current.challenge.id ? undefined : event.target.value)
          }}>
            {data.map(({ challenge }) => <option key={challenge.id} value={challenge.id}>
              Version {challengeVersion(challenge)}{challenge.id === current.challenge.id && ' (current)'}
            </option>)}
          </select></label>}
        </section>
        <ChallengeResults key={active.challenge.id} challenge={active.challenge} attempts={active.attempts}
          current={active.challenge.id === current.challenge.id} blocked={blocked} />
      </> : <p>Challenge unavailable.</p>}
  </div>
}

const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
const time = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' })

function ChallengeResults({ challenge, attempts, blocked, current }: { challenge: Challenge; attempts: ChallengeAttempt[]; blocked: boolean; current: boolean }) {
  const [inputs, setInputs] = useState<ResultInput[]>()
  const [notes, setNotes] = useState('')
  const [editingAttempt, setEditingAttempt] = useState<string>()
  const [historyLimit, setHistoryLimit] = useState(10)
  const attemptForm = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (editingAttempt) attemptForm.current?.querySelector('input')?.focus()
  }, [editingAttempt])
  const [metricIndex, setMetricIndex] = useState(0)
  const dirty = !!(editingAttempt || notes || inputs?.some(input => input.value || input.extra))
  const { save, busy, error, clearError } = useSave(dirty)
  const metric = challenge.metrics[metricIndex]
  const recorded = attempts.flatMap(attempt => {
    const result = attempt.results[metricIndex]
    return result == null ? [] : [{ attempt, result }]
  })
  const latest = recorded.at(-1)?.result
  let best: Result | undefined
  if (metric.direction !== 'trend') for (const { result } of recorded) {
    if (best === undefined || isBetter(result, best, metric.direction)) best = result
  }
  const target = metricIndex === 0 ? challenge.target : undefined
  const achieved = target !== undefined && best !== undefined && !isBetter(target, best, metric.direction)
  const pairs = metric.type === 'rounds-reps'
    ? recorded.map(row => row.result).sort(compareResults).filter((value, index, values) => index === 0 || compareResults(value, values[index - 1]) !== 0)
    : []
  const ranks = new Map(pairs.map((result, index) => [formatResult(result, metric), index + 1]))
  const points = recorded.map(({ attempt, result }) => {
    const at = new Date(attempt.recordedAt)
    return { attempt, at: at.getTime(), label: date.format(at), source: time.format(at),
      value: typeof result === 'number' ? result : ranks.get(formatResult(result, metric))! }
  })
  function close() { setEditingAttempt(undefined); setInputs(undefined); setNotes(''); clearError() }
  function editAttempt(attempt: ChallengeAttempt) {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    setEditingAttempt(attempt.id)
    setInputs(attempt.results.map(resultInput))
    setNotes(attempt.notes)
    clearError()
  }
  function attemptActions(attempt: ChallengeAttempt) {
    return <div className="actions">
      <Button variant="secondary" disabled={blocked} onClick={() => editAttempt(attempt)}>Edit attempt</Button>
      <Button variant="danger" disabled={blocked || !!inputs} onClick={() => {
        if (window.confirm('Delete this attempt?')) void save(() => deleteChallengeAttempt(attempt.id))
      }}>Delete attempt</Button>
    </div>
  }
  return <div className="performance-disciplines">
    <section className="surface-card">
      <h2>{challenge.name}</h2>
      <p className="note">{challenge.kind}</p>
      {challenge.rules && <p className="multiline">{challenge.rules}</p>}
      {inputs ? <form ref={attemptForm} onSubmit={event => {
        event.preventDefault()
        void save(async () => {
          const results = inputs.map((input, index) => parseResult(input, challenge.metrics[index]))
          if (editingAttempt) await updateChallengeAttempt(editingAttempt, results, notes)
          else await recordChallengeAttempt(challenge.id, results, notes)
        }, close)
      }}>
        <fieldset className="form-fields" disabled={blocked}>
          <legend>{editingAttempt ? 'Edit attempt' : 'Log attempt'}</legend>
          {challenge.metrics.map((item, index) => <ResultFields key={index} label={item.name + (index === 0 ? '' : ' (optional)')}
            metric={item} input={inputs[index]} required={index === 0} onChange={value => setInputs(inputs.map((input, position) => position === index ? value : input))} />)}
          <label>Notes (optional)<textarea maxLength={3000} value={notes} onChange={event => setNotes(event.target.value)} /></label>
          <div className="actions">
            <Button type="submit">{busy ? 'Saving…' : 'Save attempt'}</Button>
            <Button variant="secondary" onClick={() => { if (!dirty || window.confirm('Discard this attempt?')) close() }}>Cancel</Button>
          </div>
        </fieldset>
      </form> : current && <Button disabled={blocked} onClick={() => setInputs(challenge.metrics.map(emptyResult))}>Log attempt</Button>}
      {error && <p role="alert" className="error">{error}</p>}
    </section>
    <section className="surface-card">
      <h2>Progress</h2>
      {challenge.metrics.length > 1 && <label>Metric<select value={metricIndex} onChange={event => setMetricIndex(Number(event.target.value))}>
        {challenge.metrics.map((item, index) => <option key={index} value={index}>{item.name}</option>)}
      </select></label>}
      <dl className="cardio-week">
        <div><dt>Latest</dt><dd>{latest === undefined ? '—' : formatResult(latest, metric)}</dd></div>
        {metric.direction !== 'trend' && <div><dt>Best</dt><dd>{best === undefined ? '—' : formatResult(best, metric)}</dd></div>}
        {target !== undefined && <div><dt>Target</dt><dd>{formatResult(target, metric)}{achieved && ' · Achieved'}</dd></div>}
      </dl>
      {pairs.length > 1 && <p className="note">Graph positions show result order by rounds, then extra reps.</p>}
      <ExerciseChart key={metricIndex} points={points} title={metric.name} bars={false}
        format={value => pairs.length ? formatResult(pairs[value - 1], metric) : formatResult(value, metric)}
        details={({ attempt }) => <>
          <dl>{challenge.metrics.map((item, index) => {
            const result = attempt.results[index]
            return result == null ? null : <div key={index}><dt>{item.name}</dt><dd>{formatResult(result, item)}</dd></div>
          })}</dl>
          {attempt.notes && <p className="multiline">{attempt.notes}</p>}
          {attemptActions(attempt)}
        </>} />
    </section>
    {attempts.length > 0 && <section className="surface-card">
      <h2>Attempt history</h2>
      <div className="challenge-list">{attempts.slice(-historyLimit).reverse().map(attempt => <div key={attempt.id} className="challenge-metric">
        <strong>{formatResult(attempt.results[0]!, challenge.metrics[0])}</strong>
        <p className="note">{date.format(new Date(attempt.recordedAt))} · {time.format(new Date(attempt.recordedAt))}</p>
        {attemptActions(attempt)}
      </div>)}</div>
      {historyLimit < attempts.length && <Button variant="secondary" onClick={() => setHistoryLimit(historyLimit + 10)}>Show older attempts</Button>}
    </section>}
  </div>
}
