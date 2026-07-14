import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { CategoryConfig } from '../types'
import type { CompletedTask } from '../types'
import './ClipCategoryDetail.css'

interface ClipCategoryDetailProps {
  category: CategoryConfig
  tasks: CompletedTask[]
  onClose: () => void
  onRemoveTask: (taskId: string) => void
  onClearCategory: () => void
}

export function ClipCategoryDetail({
  category,
  tasks,
  onClose,
  onRemoveTask,
  onClearCategory,
}: ClipCategoryDetailProps) {
  const sorted = [...tasks].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )

  const handleClear = () => {
    if (tasks.length === 0) return
    if (window.confirm(`确定清空「${category.label}」票夹中的 ${tasks.length} 张便签？`)) {
      onClearCategory()
    }
  }

  return (
    <div className="clip-detail-panel">
      <header
        className="clip-detail-header"
        style={
          {
            '--detail-color': category.color,
            '--detail-bg': category.bg,
            '--detail-border': category.border,
          } as React.CSSProperties
        }
      >
        <div className="clip-detail-title">
          <span className="clip-detail-dot" />
          <div>
            <h3>{category.label}票夹</h3>
            <p>{tasks.length} 张便签</p>
          </div>
        </div>
        <div className="clip-detail-actions">
          {tasks.length > 0 && (
            <button
              type="button"
              className="clip-detail-clear"
              onClick={handleClear}
            >
              清空票夹
            </button>
          )}
          <button type="button" className="clip-detail-close" onClick={onClose}>
            收起
          </button>
        </div>
      </header>

      <div className="clip-detail-body">
        {sorted.length === 0 ? (
          <div className="clip-detail-empty">
            <p>此票夹尚空</p>
            <span>完成对应分类的待办后将显示在这里</span>
          </div>
        ) : (
          <ul className="clip-detail-list">
            {sorted.map((task, index) => (
              <li
                key={task.id}
                className="clip-detail-item"
                style={
                  {
                    '--item-bg': category.bg,
                    '--item-border': category.border,
                    '--item-color': category.color,
                  } as React.CSSProperties
                }
              >
                <span className="clip-detail-index">{index + 1}</span>
                <div className="clip-detail-content">
                  <p className="clip-detail-item-title">{task.title}</p>
                  <div className="clip-detail-meta">
                    {task.dueDate && (
                      <time dateTime={task.dueDate}>
                        截止 {format(parseISO(task.dueDate), 'M月d日', { locale: zhCN })}
                      </time>
                    )}
                    <time dateTime={task.completedAt}>
                      夹入 {format(parseISO(task.completedAt), 'M月d日 HH:mm', { locale: zhCN })}
                    </time>
                  </div>
                </div>
                <button
                  type="button"
                  className="clip-detail-remove"
                  onClick={() => onRemoveTask(task.id)}
                  aria-label={`移除便签：${task.title}`}
                  title="从票夹移除"
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
