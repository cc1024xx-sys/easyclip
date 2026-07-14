import { useApp } from '../hooks/useAppState'
import { useTrashDrop } from '../hooks/useTrashDrop'
import './PoolTrashDrop.css'

export function PoolTrashDrop() {
  const { discardTask } = useApp()
  const { dragOver, handleDragOver, handleDragLeave, handleDrop } = useTrashDrop(
    (taskId, rect) => discardTask(taskId, rect),
  )

  return (
    <div
      className={`pool-trash-drop ${dragOver ? 'pool-trash-drop--active' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label="拖入便签放下"
    >
      <div className="pool-trash-icon" aria-hidden="true">
        <div className="pool-trash-lid" />
        <div className="pool-trash-body" />
      </div>
      <span className="pool-trash-label">
        {dragOver ? '松手放下' : '放下'}
      </span>
    </div>
  )
}
