export const TASK_DRAG_TYPE = 'application/x-easyclip-task-id'

export function setTaskDragData(dataTransfer: DataTransfer, taskId: string) {
  dataTransfer.setData(TASK_DRAG_TYPE, taskId)
  dataTransfer.setData('text/plain', taskId)
  dataTransfer.effectAllowed = 'move'
}

export function getTaskDragId(dataTransfer: DataTransfer): string {
  return (
    dataTransfer.getData(TASK_DRAG_TYPE) ||
    dataTransfer.getData('text/plain')
  )
}
