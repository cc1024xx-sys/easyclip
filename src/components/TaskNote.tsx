import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { resolveCategory } from '../constants/categories'
import type { Task } from '../types'
import { useApp } from '../hooks/useAppState'
import { setTaskDragData } from '../utils/dragDrop'
import './TaskNote.css'

interface TaskNoteProps {
  task: Task
}

export function TaskNote({ task }: TaskNoteProps) {
  const { completeTask, categoryMap } = useApp()
  const cat = resolveCategory(categoryMap, task.category)

  const handleComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.closest('.task-note')?.getBoundingClientRect() ?? null
    completeTask(task.id, rect)
  }

  const handleDragStart = (e: React.DragEvent) => {
    setTaskDragData(e.dataTransfer, task.id)
  }

  return (
    <div
      className="task-note"
      draggable
      onDragStart={handleDragStart}
      title={task.title}
      style={
        {
          '--note-color': cat.color,
          '--note-bg': cat.bg,
          '--note-border': cat.border,
        } as React.CSSProperties
      }
    >
      <span className="task-note-category">{cat.label}</span>
      <p className="task-note-title">{task.title}</p>
      {task.dueDate && (
        <time className="task-note-due" dateTime={task.dueDate}>
          {format(parseISO(task.dueDate), 'M月d日', { locale: zhCN })}
        </time>
      )}
      <div className="task-note-actions">
        <button type="button" className="task-action clip" onClick={handleComplete}>
          夹入
        </button>
      </div>
      <span className="task-drag-hint">拖入右下角放下</span>
    </div>
  )
}
