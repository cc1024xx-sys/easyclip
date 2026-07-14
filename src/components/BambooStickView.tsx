import { useState } from 'react'
import type { TaskCategory } from '../types'
import { useApp } from '../hooks/useAppState'
import { AddCategoryForm } from './AddCategoryForm'
import { ClipCategoryDetail } from './ClipCategoryDetail'
import { ClipCountIcons } from './ClipCountIcons'
import { TicketClip } from './TicketClip'
import './BambooStickView.css'

export function BambooStickView() {
  const {
    data,
    stickFillPercent,
    bounceCategory,
    removeClippedTask,
    clearClippedCategory,
  } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null)
  const { categories } = data
  const tasks = data.currentStick.tasks
  const isFull = stickFillPercent >= 100

  const tasksByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat.id] = tasks.filter((t) => t.category === cat.id)
      return acc
    },
    {} as Record<string, typeof tasks>,
  )

  const selectedConfig = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null

  const handleRowClick = (categoryId: TaskCategory) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId))
  }

  return (
    <section className="clip-board">
      <div className="section-header">
        <h2>票夹墙</h2>
        <span className="section-count">{tasks.length} 张已夹入</span>
      </div>

      <div className={`clip-board-surface ${isFull ? 'clip-board-surface--full' : ''}`}>
        <div className="clip-rows">
          {categories.map((cat) => {
            const catTasks = tasksByCategory[cat.id] ?? []
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={`clip-row ${isSelected ? 'clip-row--selected' : ''}`}
                style={
                  {
                    '--row-color': cat.color,
                    '--row-bg': cat.bg,
                    '--row-border': cat.border,
                  } as React.CSSProperties
                }
                onClick={() => handleRowClick(cat.id)}
                aria-expanded={isSelected}
                aria-label={`查看${cat.label}票夹，共${catTasks.length}张`}
              >
                <div className="clip-row-label">
                  <span className="clip-row-dot" />
                  <span>{cat.label}</span>
                </div>

                <TicketClip
                  category={cat}
                  count={catTasks.length}
                  bouncing={bounceCategory === cat.id}
                  compact
                />

                <ClipCountIcons count={catTasks.length} category={cat} />

                <div className="clip-row-stat">
                  <span className="clip-row-num">{catTasks.length}</span>
                  <span className="clip-row-unit">张</span>
                </div>
              </button>
            )
          })}
          <AddCategoryForm />
        </div>

        {selectedConfig && (
          <ClipCategoryDetail
            category={selectedConfig}
            tasks={tasksByCategory[selectedConfig.id] ?? []}
            onClose={() => setSelectedCategory(null)}
            onRemoveTask={removeClippedTask}
            onClearCategory={() => clearClippedCategory(selectedConfig.id)}
          />
        )}

        {isFull && !selectedCategory && (
          <div className="clip-board-full">
            <span>票夹饱满</span>
            <small>本周成果层叠丰盈</small>
          </div>
        )}

        {tasks.length === 0 && !selectedCategory && (
          <p className="clip-board-hint">
            完成待办后，便签将夹入对应票夹 · 点击行查看详情
          </p>
        )}
      </div>
    </section>
  )
}
