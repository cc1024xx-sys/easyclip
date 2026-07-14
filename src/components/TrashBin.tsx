import { useEffect, useState } from 'react'
import { resolveCategory } from '../constants/categories'
import { useApp } from '../hooks/useAppState'
import {
  formatRemainingTime,
  getTrashRemainingMs,
  isTrashExpired,
} from '../utils/week'
import './TrashBin.css'

export function TrashBin() {
  const { data, restoreTask, categoryMap } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const activeTrash = data.trash.filter((t) => !isTrashExpired(t.discardedAt))

  return (
    <section className="trash-bin-section">
      <div className="section-header">
        <h2>收纳桶</h2>
        <span className="section-count">{activeTrash.length} 待清理</span>
      </div>

      <p className="trash-bin-hint">
        在待办池右下角拖入便签放下 · 24 小时内可撤回
      </p>

      {activeTrash.length > 0 ? (
        <ul className="trash-list">
          {activeTrash.map((task) => {
            const cat = resolveCategory(categoryMap, task.category)
            const remaining = getTrashRemainingMs(task.discardedAt)
            return (
              <li key={task.id} className="trash-item">
                <span
                  className="trash-item-swatch"
                  style={{ backgroundColor: cat.bg, borderColor: cat.color }}
                />
                <span className="trash-item-title">{task.title}</span>
                <span className="trash-item-time">
                  {formatRemainingTime(remaining)}
                </span>
                <button
                  type="button"
                  className="trash-restore"
                  onClick={() => restoreTask(task.id)}
                >
                  撤回
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="trash-bin-empty">
          <div className="trash-bin-empty-icon" aria-hidden="true">
            <div className="pool-trash-lid" />
            <div className="pool-trash-body" />
          </div>
          <p>暂无放下的便签</p>
        </div>
      )}
    </section>
  )
}
