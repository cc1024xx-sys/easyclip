import { useMemo } from 'react'
import { isToday, parseISO } from 'date-fns'
import { useApp } from '../hooks/useAppState'
import { CreateTaskForm } from './CreateTaskForm'
import { PoolTrashDrop } from './PoolTrashDrop'
import { TaskNote } from './TaskNote'
import './TaskPool.css'

export function TaskPool() {
  const { data } = useApp()

  const { todayClipped, weekClipped } = useMemo(() => {
    const tasks = data.currentStick.tasks
    const todayClipped = tasks.filter((t) => isToday(parseISO(t.completedAt))).length
    return { todayClipped, weekClipped: tasks.length }
  }, [data.currentStick.tasks])

  return (
    <section className="task-pool">
      <div className="section-header">
        <h2>待办池</h2>
        <span className="section-count">{data.pendingTasks.length} 待处理</span>
      </div>
      <CreateTaskForm />
      <div className="task-pool-body">
        <div className="task-pool-grid">
          {data.pendingTasks.length === 0 ? (
            <div className="empty-pool">
              <p>待办池为空</p>
              <p className="empty-hint">写一张便签，夹入本周的票夹墙</p>
            </div>
          ) : (
            data.pendingTasks.map((task) => <TaskNote key={task.id} task={task} />)
          )}
        </div>
        <PoolTrashDrop />
      </div>
      <footer className="task-pool-stats">
        <span>
          今日已夹入 <strong>{todayClipped}</strong> 张
        </span>
        <span className="task-pool-stats-sep" aria-hidden="true">
          ·
        </span>
        <span>
          本周共加入 <strong>{weekClipped}</strong> 张
        </span>
      </footer>
    </section>
  )
}
