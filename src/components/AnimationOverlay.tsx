import { resolveCategory } from '../constants/categories'
import { useApp } from '../hooks/useAppState'
import { TicketClip } from './TicketClip'
import './AnimationOverlay.css'

function getDiscardOrigin(sourceRect: DOMRect | null) {
  if (!sourceRect) {
    return { left: '50%', top: '45%' }
  }
  const centerX = sourceRect.left + sourceRect.width / 2
  const centerY = sourceRect.top + sourceRect.height / 2
  return {
    left: `${centerX}px`,
    top: `${centerY}px`,
  }
}

export function AnimationOverlay() {
  const { animation, discardMessage, categoryMap } = useApp()

  if (!animation.type || !animation.task) return null

  const cat = resolveCategory(categoryMap, animation.task.category)

  if (animation.type === 'complete') {
    return (
      <div className="animation-overlay complete-overlay">
        <div className="clip-target">
          <TicketClip category={cat} count={0} opening />
        </div>
        <div
          className="flying-note"
          style={
            {
              '--note-bg': cat.bg,
              '--note-border': cat.border,
              '--note-color': cat.color,
            } as React.CSSProperties
          }
        >
          <span className="flying-note-title">{animation.task.title}</span>
        </div>
      </div>
    )
  }

  const origin = getDiscardOrigin(animation.sourceRect)

  return (
    <div className="animation-overlay discard-overlay">
      <div
        className="crumpling-note"
        style={
          {
            left: origin.left,
            top: origin.top,
          } as React.CSSProperties
        }
      >
        <div
          className="crumple-paper"
          style={{
            backgroundColor: cat.bg,
            borderColor: cat.border,
            color: cat.color,
          }}
        >
          <span>{animation.task.title}</span>
        </div>
      </div>
      <p className="discard-message">{discardMessage}</p>
    </div>
  )
}
