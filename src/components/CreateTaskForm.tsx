import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import type { TaskCategory } from '../types'
import { useApp } from '../hooks/useAppState'
import './CreateTaskForm.css'

function formatToday() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function CreateTaskForm() {
  const { addTask, data } = useApp()
  const categories = data.categories
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TaskCategory>(
    () => categories[0]?.id ?? 'work',
  )
  const [dueDate, setDueDate] = useState(formatToday)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!categories.some((c) => c.id === category)) {
      setCategory(categories[0]?.id ?? 'work')
    }
  }, [categories, category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask(title, category, dueDate)
    setTitle('')
    setDueDate(formatToday())
    setExpanded(false)
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="create-form-main">
        <input
          type="text"
          className="create-input"
          placeholder="写下一件待办…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => {
            setExpanded(true)
            setDueDate((d) => d || formatToday())
          }}
        />
        <button type="submit" className="create-submit" disabled={!title.trim()}>
          添签
        </button>
      </div>

      {expanded && (
        <div className="create-form-extra">
          <div className="category-picker">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-btn ${category === cat.id ? 'selected' : ''}`}
                style={
                  {
                    '--cat-color': cat.color,
                    '--cat-bg': cat.bg,
                    '--cat-border': cat.border,
                  } as React.CSSProperties
                }
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            className="due-date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      )}
    </form>
  )
}
