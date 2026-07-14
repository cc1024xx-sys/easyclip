import { TaskPool } from './TaskPool'
import { BambooStickView } from './BambooStickView'
import { TrashBin } from './TrashBin'
import './Workspace.css'

export function Workspace() {
  return (
    <div className="workspace">
      <TaskPool />
      <div className="workspace-side">
        <BambooStickView />
        <TrashBin />
      </div>
    </div>
  )
}
