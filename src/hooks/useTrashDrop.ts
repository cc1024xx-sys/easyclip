import { useCallback, useState } from 'react'
import { getTaskDragId } from '../utils/dragDrop'

export function useTrashDrop(onDrop: (taskId: string, rect: DOMRect) => void) {
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null
    if (!e.currentTarget.contains(related)) {
      setDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)

      const taskId = getTaskDragId(e.dataTransfer)
      if (!taskId) return

      const rect = e.currentTarget.getBoundingClientRect()
      onDrop(taskId, rect)
    },
    [onDrop],
  )

  return { dragOver, handleDragOver, handleDragLeave, handleDrop }
}
