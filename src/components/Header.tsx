import { useApp } from '../hooks/useAppState'
import { formatWeekLabel } from '../utils/week'
import { DataManage } from './DataManage'
import './Header.css'

export function Header() {
  const { data } = useApp()
  const weekLabel = formatWeekLabel()

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">
          <div className="header-logo-bar" />
          <div className="header-logo-bar" />
          <div className="header-logo-bar" />
        </div>
        <div>
          <h1 className="header-title">EasyClip</h1>
          <p className="header-subtitle">你的生活工作室</p>
        </div>
      </div>
      <div className="header-meta">
        <DataManage />
        <div className="header-meta-block">
          <span className="header-meta-label">本周</span>
          <span className="header-meta-value">{weekLabel}</span>
        </div>
        <div className="header-meta-block">
          <span className="header-meta-label">已夹入</span>
          <span className="header-meta-value header-meta-highlight">
            {data.currentStick.tasks.length}
          </span>
        </div>
      </div>
    </header>
  )
}
