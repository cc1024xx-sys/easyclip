import type { CategoryConfig } from '../types'
import './ClipCountIcons.css'

interface ClipCountIconsProps {
  count: number
  category: CategoryConfig
  maxVisible?: number
}

export function ClipCountIcons({
  count,
  category,
  maxVisible = 14,
}: ClipCountIconsProps) {
  if (count === 0) {
    return (
      <div className="clip-count-icons clip-count-icons--empty">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className="clip-count-icon clip-count-icon--ghost" />
        ))}
      </div>
    )
  }

  const visible = Math.min(count, maxVisible)
  const overflow = count - visible

  return (
    <div className="clip-count-icons">
      {Array.from({ length: visible }, (_, i) => (
        <span
          key={i}
          className="clip-count-icon"
          style={
            {
              '--icon-bg': category.bg,
              '--icon-border': category.border,
              animationDelay: `${i * 0.03}s`,
            } as React.CSSProperties
          }
          title={`${category.label}便签 ${i + 1}`}
        />
      ))}
      {overflow > 0 && (
        <span className="clip-count-overflow">+{overflow}</span>
      )}
    </div>
  )
}
