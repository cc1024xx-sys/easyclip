import type { CategoryConfig } from '../types'
import './TicketClip.css'

interface TicketClipProps {
  category: CategoryConfig
  count: number
  bouncing?: boolean
  opening?: boolean
  compact?: boolean
}

export function TicketClip({ category, count, bouncing, opening, compact }: TicketClipProps) {
  return (
    <div
      className={[
        'ticket-clip',
        compact && 'ticket-clip--compact',
        bouncing && 'ticket-clip--bounce',
        opening && 'ticket-clip--open',
      ].filter(Boolean).join(' ')}
    >
      <div
        className="ticket-clip-body"
        style={{ '--clip-color': category.clipColor } as React.CSSProperties}
      >
        <div className="clip-handle" />
        <div className="clip-arm clip-arm--top" />
        <div className="clip-arm clip-arm--bottom" />
        <div className="clip-shadow" />
      </div>
      {!compact && <span className="ticket-clip-label">{category.label}</span>}
      {!compact && count > 0 && <span className="ticket-clip-count">{count}</span>}
    </div>
  )
}
