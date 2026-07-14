import type { View } from '../types'
import { useApp } from '../hooks/useAppState'
import './Navigation.css'

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'workspace', label: '工作区' },
  { id: 'basket', label: '封存柜' },
  { id: 'reports', label: '周报告' },
]

export function Navigation() {
  const { view, setView, data } = useApp()

  return (
    <nav className="navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${view === item.id ? 'active' : ''}`}
          onClick={() => setView(item.id)}
        >
          <span className="nav-label">{item.label}</span>
          {item.id === 'basket' && data.archivedSticks.length > 0 && (
            <span className="nav-badge">{data.archivedSticks.length}</span>
          )}
          {item.id === 'reports' && data.reports.length > 0 && (
            <span className="nav-badge">{data.reports.length}</span>
          )}
        </button>
      ))}
    </nav>
  )
}
