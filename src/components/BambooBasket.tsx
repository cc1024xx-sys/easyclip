import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useApp } from '../hooks/useAppState'
import { StackedNote } from './StackedNote'
import { TicketClip } from './TicketClip'
import './BambooBasket.css'

export function BambooBasket() {
  const { data } = useApp()
  const { categories } = data

  if (data.archivedSticks.length === 0) {
    return (
      <section className="archive-cabinet archive-cabinet--empty">
        <h2>封存柜</h2>
        <div className="cabinet-empty-state">
          <div className="cabinet-empty-shelf">
            <div className="shelf-slot" />
            <div className="shelf-slot" />
            <div className="shelf-slot" />
          </div>
          <p>每周日封存后，票夹墙将收入透明储物盒</p>
          <p className="empty-hint">封存柜尚空，从夹入第一张便签开始</p>
        </div>
      </section>
    )
  }

  return (
    <section className="archive-cabinet">
      <h2>封存柜</h2>
      <p className="cabinet-desc">
        {data.archivedSticks.length} 周成果 · 透明储物盒陈列
      </p>

      <div className="cabinet-grid">
        {data.archivedSticks.map((stick) => {
          const sealedDate = stick.sealedAt
            ? format(parseISO(stick.sealedAt), 'yyyy年M月d日', { locale: zhCN })
            : ''

          const tasksByCategory = categories.map((cat) => ({
            cat,
            tasks: stick.tasks.filter((t) => t.category === cat.id).slice(-4),
            total: stick.tasks.filter((t) => t.category === cat.id).length,
          }))

          return (
            <article key={stick.id} className="archive-box">
              <div className="archive-box-lid">
                <span>第 {stick.weekKey.split('-W')[1]} 周</span>
              </div>
              <div className="archive-box-body">
                <div className="archive-clips-row">
                  {tasksByCategory.map(({ cat, tasks, total }) => (
                    <div key={cat.id} className="archive-clip-col">
                      <TicketClip category={cat} count={total} />
                      <div className="archive-mini-stack">
                        {tasks.map((task, i) => (
                          <div
                            key={task.id}
                            className="archive-stack-layer"
                            style={{ bottom: i * 2 }}
                          >
                            <StackedNote task={task} index={i} size="sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="archive-box-info">
                <span className="archive-count">{stick.tasks.length} 张便签</span>
                {sealedDate && <time className="archive-date">{sealedDate} 封存</time>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
