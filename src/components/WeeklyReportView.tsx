import { resolveCategory } from '../constants/categories'
import type { WeeklyReport } from '../types'
import { useApp } from '../hooks/useAppState'
import './WeeklyReportView.css'

function DonutChart({
  breakdown,
  total,
}: {
  breakdown: Record<string, number>
  total: number
}) {
  const { categoryMap } = useApp()

  if (total === 0) {
    return (
      <div className="donut-chart donut-chart--empty">
        <div className="donut-hole">
          <span>0</span>
        </div>
      </div>
    )
  }

  let cumulative = 0
  const segments = Object.entries(breakdown)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const cat = resolveCategory(categoryMap, id)
      const pct = (count / total) * 100
      const start = cumulative
      cumulative += pct
      return { id, color: cat.color, start, end: cumulative, label: cat.label, count }
    })

  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ')

  return (
    <div className="donut-chart-wrap">
      <div
        className="donut-chart"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="donut-hole">
          <span className="donut-total">{total}</span>
          <span className="donut-label">夹入</span>
        </div>
      </div>
      <ul className="donut-legend">
        {segments.map((s) => (
          <li key={s.id}>
            <span className="donut-legend-swatch" style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
            <span className="donut-legend-count">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReportCard({ report }: { report: WeeklyReport }) {
  const total = report.completedCount + report.discardedCount
  const completionRate = total > 0 ? Math.round((report.completedCount / total) * 100) : 0

  return (
    <article className="report-card">
      <div className="report-step-number">§</div>
      <header className="report-header">
        <h3>周报告 · {report.weekLabel}</h3>
        <time>{new Date(report.generatedAt).toLocaleDateString('zh-CN')}</time>
      </header>

      <div className="report-assembly-grid">
        <div className="report-stat-module">
          <span className="report-stat-num">{report.completedCount}</span>
          <span className="report-stat-label">夹入完成</span>
        </div>
        <div className="report-stat-module">
          <span className="report-stat-num">{report.discardedCount}</span>
          <span className="report-stat-label">放下清理</span>
        </div>
        <div className="report-stat-module">
          <span className="report-stat-num">{completionRate}%</span>
          <span className="report-stat-label">完成率</span>
        </div>
      </div>

      <div className="report-chart-section">
        <h4>01 · 成果分布</h4>
        <DonutChart breakdown={report.categoryBreakdown} total={report.completedCount} />
      </div>

      <div className="report-instruction">
        <h4>02 · 总结</h4>
        <p>{report.message}</p>
      </div>
    </article>
  )
}

export function WeeklyReportView() {
  const { data } = useApp()

  if (data.reports.length === 0) {
    return (
      <section className="weekly-reports weekly-reports--empty">
        <h2>周报告</h2>
        <div className="reports-empty-state">
          <div className="assembly-icon">
            <div className="assembly-step">1</div>
            <div className="assembly-arrow">→</div>
            <div className="assembly-step">2</div>
            <div className="assembly-arrow">→</div>
            <div className="assembly-step">3</div>
          </div>
          <p>每周日 23:59 封存后自动生成组装式报告</p>
        </div>
      </section>
    )
  }

  return (
    <section className="weekly-reports">
      <h2>周报告</h2>
      <p className="reports-intro">组装说明书式周报 · 暖色几何图表</p>
      <div className="reports-list">
        {data.reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </section>
  )
}

export function WeeklyReportModal() {
  const { showReport, latestReport, dismissReport } = useApp()

  if (!showReport || !latestReport) return null

  return (
    <div className="report-modal-overlay" onClick={dismissReport}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <span className="report-modal-step">封存完成</span>
          <h2>本周票夹已封存</h2>
          <p className="report-modal-subtitle">{latestReport.weekLabel}</p>
        </div>

        <div className="report-modal-body">
          <DonutChart
            breakdown={latestReport.categoryBreakdown}
            total={latestReport.completedCount}
          />

          <div className="report-modal-stats">
            <div className="modal-stat">
              <span className="modal-stat-num">{latestReport.completedCount}</span>
              <span>夹入</span>
            </div>
            <div className="modal-stat">
              <span className="modal-stat-num">{latestReport.discardedCount}</span>
              <span>放下</span>
            </div>
          </div>

          <p className="report-modal-message">{latestReport.message}</p>
        </div>

        <button type="button" className="report-modal-close" onClick={dismissReport}>
          确认，开始新一周
        </button>
      </div>
    </div>
  )
}
