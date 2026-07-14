import { AppProvider, useApp } from './hooks/useAppState'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { Workspace } from './components/Workspace'
import { BambooBasket } from './components/BambooBasket'
import { WeeklyReportView, WeeklyReportModal } from './components/WeeklyReportView'
import { AnimationOverlay } from './components/AnimationOverlay'
import './App.css'

function AppContent() {
  const { view } = useApp()

  return (
    <div className="app">
      <Header />
      <Navigation />
      <main className="main-content" key={view}>
        {view === 'workspace' && <Workspace />}
        {view === 'basket' && <BambooBasket />}
        {view === 'reports' && <WeeklyReportView />}
      </main>
      <AnimationOverlay />
      <WeeklyReportModal />
      <footer className="app-footer">
        <p>周日 23:59 自动封存票夹墙 · 收纳桶超过 24 小时不可逆清理</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
