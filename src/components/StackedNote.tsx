import { resolveCategory } from '../constants/categories'
import { useApp } from '../hooks/useAppState'
import type { StackableTask } from '../utils/noteStack'
import { getStackOffset } from '../utils/noteStack'
import './StackedNote.css'

interface StackedNoteProps {
  task: StackableTask
  index: number
  size?: 'sm' | 'md' | 'lg'
}

export function StackedNote({ task, index, size = 'md' }: StackedNoteProps) {
  const { categoryMap } = useApp()
  const cat = resolveCategory(categoryMap, task.category)
  const offset = getStackOffset(task.id, index)

  return (
    <div
      className={`stacked-note stacked-note--${size}`}
      style={
        {
          '--note-bg': cat.bg,
          '--note-color': cat.color,
          '--note-border': cat.border,
          '--stack-rotate': `${offset.rotate}deg`,
          '--stack-x': `${offset.x}px`,
          '--stack-y': `${offset.y}px`,
          zIndex: index + 1,
        } as React.CSSProperties
      }
      title={task.title}
    >
      <span className="stacked-note-title">{task.title}</span>
    </div>
  )
}
