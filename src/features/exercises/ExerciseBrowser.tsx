import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { filterExercises, loadExerciseBrowseData, type ExerciseBrowseData, type ExerciseFilters, type ExerciseSort } from '../../data/repositories/exercises'
import { exerciseDisplayName } from '../../domain/strength/exerciseDisplayName'
import { EQUIPMENT, label, MUSCLES, trackingLabel } from '../../domain/strength/catalog'
import { EQUIPMENT_FILTER_GROUPS, EXERCISE_TYPES, MOVEMENT_PATTERNS, MUSCLE_FILTER_GROUPS } from '../../domain/strength/taxonomy'
import type { Exercise } from '../../domain/strength/models'

interface Props {
  exercises: Exercise[]
  filters: ExerciseFilters
  onFiltersChange: (filters: ExerciseFilters) => void
  filtersOpen: boolean
  onFiltersOpenChange: (open: boolean) => void
  onSelect: (exercise: Exercise) => void
  loading?: boolean
  disabled?: boolean
  picker?: boolean
}

const sources = { bundled: 'Built-in library', custom: 'My exercises' }
const muscleLabels = { ...MUSCLES, back: 'Back' }

function options(ids: Iterable<string>, labels: Record<string, string>) {
  return [...new Set(ids)].map(id => [id, label(id, labels)] as const)
    .sort((a, b) => a[1].localeCompare(b[1]))
}

export function ExerciseBrowser({
  exercises, filters, onFiltersChange, filtersOpen, onFiltersOpenChange, onSelect,
  loading, disabled, picker,
}: Props) {
  const id = useId()
  const search = useRef<HTMLInputElement>(null)
  const selectOnFirstTap = useRef(false)
  const [browse, setBrowse] = useState<ExerciseBrowseData>()
  const [browseError, setBrowseError] = useState(false)
  useEffect(() => {
    let active = true
    void loadExerciseBrowseData().then(
      data => { if (active) setBrowse(data) },
      () => { if (active) setBrowseError(true) },
    )
    return () => { active = false }
  }, [])
  useEffect(() => { if (picker) search.current?.focus() }, [picker])

  const fields = useMemo(() => {
    const visible = exercises.filter(exercise => !exercise.archived)
    const muscles = new Set(visible.flatMap(exercise => [...exercise.primaryMuscleGroupIds, ...exercise.secondaryMuscleGroupIds]))
    const equipment = new Set(visible.flatMap(exercise => exercise.equipmentIds))
    for (const [group, members] of Object.entries(MUSCLE_FILTER_GROUPS)) {
      if (members.some(member => muscles.has(member))) muscles.add(group)
    }
    for (const [group, members] of Object.entries(EQUIPMENT_FILTER_GROUPS)) {
      if (members.some(member => equipment.has(member))) equipment.add(group)
    }
    return [
      { key: 'muscle', title: 'Muscle group', all: 'All muscles', options: options(muscles, muscleLabels) },
      { key: 'equipment', title: 'Equipment', all: 'All equipment', options: options(equipment, EQUIPMENT) },
      { key: 'exerciseType', title: 'Exercise type', all: 'All types', options: options(Object.keys(EXERCISE_TYPES), EXERCISE_TYPES) },
      { key: 'movementPattern', title: 'Movement pattern', all: 'All patterns', options: options(Object.keys(MOVEMENT_PATTERNS), MOVEMENT_PATTERNS) },
      { key: 'origin', title: 'Source', all: 'All sources', options: Object.entries(sources) },
    ] as const
  }, [exercises])

  const activeFilters = fields.flatMap(field => {
    const value = filters[field.key]
    if (!value || value === 'all') return []
    return [field.options.find(([key]) => key === value)?.[1] ?? value]
  })
  if (filters.favouritesOnly) activeFilters.push('Favourites only')
  const needsBrowseData = (picker && !!filters.query?.trim()) || filters.favouritesOnly || filters.sort === 'recent' || filters.sort === 'favourites'
  const waiting = loading || (needsBrowseData && !browse && !browseError)
  const results = useMemo(() => filterExercises(exercises, filters, browse, { prioritizeUsed: picker }), [exercises, filters, browse, picker])
  const update = (change: ExerciseFilters) => onFiltersChange({ ...filters, ...change })

  return <>
    <label htmlFor={id + '-search'}>{picker ? 'Find exercise' : 'Search exercises'}</label>
    <input ref={search} id={id + '-search'} type="search" placeholder="Name, muscle or equipment"
      value={filters.query ?? ''}
      onFocus={event => {
        selectOnFirstTap.current = !!event.currentTarget.value
        event.currentTarget.select()
      }}
      onClick={event => {
        // A touch can place the caret after focus has selected the query.
        if (selectOnFirstTap.current) event.currentTarget.select()
        selectOnFirstTap.current = false
      }}
      onChange={event => update({ query: event.target.value })}
      onKeyDown={event => {
        selectOnFirstTap.current = false
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }} />
    <div className="exercise-browse-actions">
      <div>
        <label htmlFor={id + '-sort'}>Sort by</label>
        <select id={id + '-sort'} value={filters.sort ?? 'az'}
          onChange={event => update({ sort: event.target.value as ExerciseSort })}>
          <option value="az">Alphabetical (A–Z)</option>
          <option value="za">Alphabetical (Z–A)</option>
          <option value="recent" disabled={browseError}>Recently used</option>
          <option value="favourites" disabled={browseError}>Favourites first</option>
        </select>
      </div>
      <button type="button" className="secondary" aria-expanded={filtersOpen} aria-controls={id + '-filters'}
        onClick={() => onFiltersOpenChange(!filtersOpen)}>
        Filters{activeFilters.length > 0 && ` (${activeFilters.length} active)`}
      </button>
    </div>
    <fieldset className="form-fields" id={id + '-filters'} hidden={!filtersOpen}>
      <legend className="sr-only">Exercise filters</legend>
      <div className="filter-grid exercise-browser-grid">
        {fields.map(field => <div key={field.key}>
          <label htmlFor={id + '-' + field.key}>{field.title}</label>
          <select id={id + '-' + field.key} value={filters[field.key] === 'all' ? '' : filters[field.key] ?? ''}
            onChange={event => update({ [field.key]: event.target.value })}>
            <option value="">{field.all}</option>
            {field.options.map(([key, title]) => <option key={key} value={key}>{title}</option>)}
          </select>
        </div>)}
        <div className="choice-grid exercise-favourite-filter">
          <label><input type="checkbox" checked={filters.favouritesOnly ?? false} disabled={browseError}
            onChange={event => update({ favouritesOnly: event.target.checked })} /> Favourites only</label>
        </div>
      </div>
    </fieldset>
    {activeFilters.length > 0 && <div className="exercise-filter-summary">
      <p>Active filters: {activeFilters.join(', ')}</p>
      <button type="button" className="secondary" onClick={() => {
        onFiltersChange({ query: filters.query, sort: filters.sort })
        search.current?.focus()
      }}>Clear all filters</button>
    </div>}
    {browseError && <p role="alert">Could not load favourites or recently used exercises.</p>}
    <p role="status" aria-atomic="true">{waiting ? 'Loading exercises…' : `${results.length} matching exercise${results.length === 1 ? '' : 's'}`}</p>
    {!waiting && results.length === 0 && <p>Try a different search or clear your filters.</p>}
    {!waiting && <ul className="exercise-list">{results.map(exercise => <li key={exercise.id}>
      <button type="button" className="exercise-row" disabled={disabled} onClick={() => onSelect(exercise)}>
        <span className="exercise-row-top">
          <strong>{exerciseDisplayName(exercise)}</strong>
          {!picker && <span className="badge">{exercise.origin === 'custom' ? 'Custom' : 'Built-in'}</span>}
        </span>
        {!picker && <>
          <span>{exercise.primaryMuscleGroupIds.map(group => label(group, MUSCLES)).join(', ') || 'No primary muscles specified'}</span>
          <span className="note">{trackingLabel(exercise.tracking)}</span>
        </>}
        {browse?.favourites.has(exercise.id) && <span className="note">Favourite</span>}
      </button>
    </li>)}</ul>}
  </>
}
