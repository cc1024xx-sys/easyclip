import { useState } from 'react'
import { MAX_CATEGORIES } from '../constants/categories'
import { useApp } from '../hooks/useAppState'
import './AddCategoryForm.css'

export function AddCategoryForm() {
  const { data, addCategory } = useApp()
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')

  const atLimit = data.categories.length >= MAX_CATEGORIES

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = addCategory(label)
    if (ok) {
      setLabel('')
      setError('')
      setOpen(false)
    } else if (data.categories.some((c) => c.label === label.trim())) {
      setError('分类名称已存在')
    } else if (atLimit) {
      setError(`最多 ${MAX_CATEGORIES} 个分类`)
    } else {
      setError('请输入分类名称')
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="add-category-trigger"
        onClick={() => setOpen(true)}
        disabled={atLimit}
        title={atLimit ? `最多 ${MAX_CATEGORIES} 个分类` : '新建票夹分类'}
      >
        <span className="add-category-icon">+</span>
        <span>新建分类</span>
      </button>
    )
  }

  return (
    <form className="add-category-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="add-category-input"
        placeholder="分类名称，如：阅读"
        value={label}
        onChange={(e) => {
          setLabel(e.target.value)
          setError('')
        }}
        maxLength={8}
        autoFocus
      />
      <div className="add-category-actions">
        <button type="submit" className="add-category-submit" disabled={!label.trim()}>
          添加
        </button>
        <button
          type="button"
          className="add-category-cancel"
          onClick={() => {
            setOpen(false)
            setLabel('')
            setError('')
          }}
        >
          取消
        </button>
      </div>
      {error && <p className="add-category-error">{error}</p>}
    </form>
  )
}
