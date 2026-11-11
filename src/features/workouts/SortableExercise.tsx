import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
export function SortableExercise({ id, name, disabled, children, className = '' }: { id: string; name: string; disabled: boolean; children: ReactNode; className?: string }) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id, disabled })
  return <article aria-label={name} ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={`workout-exercise inline-exercise sortable-exercise ${className} ${isDragging ? 'is-dragging' : ''}`}>
    <button className="exercise-drag-handle" ref={setActivatorNodeRef} {...attributes} {...listeners} disabled={disabled} aria-label={`Reorder ${name}`} aria-describedby="exercise-drag-instructions" onContextMenu={event => event.preventDefault()}><span aria-hidden="true">⠿</span></button>
    {children}
  </article>
}
