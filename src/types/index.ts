export type TaskCategory = string

export interface Task {
  id: string
  title: string
  dueDate?: string
  category: TaskCategory
  createdAt: string
}

export interface CompletedTask extends Task {
  completedAt: string
}

export interface TrashedTask extends Task {
  discardedAt: string
}

export interface BambooStick {
  id: string
  weekKey: string
  weekStart: string
  weekEnd: string
  tasks: CompletedTask[]
  sealedAt?: string
}

export interface WeeklyReport {
  id: string
  weekKey: string
  weekLabel: string
  completedCount: number
  discardedCount: number
  categoryBreakdown: Record<string, number>
  message: string
  generatedAt: string
}

export interface CategoryConfig {
  id: string
  label: string
  color: string
  bg: string
  border: string
  clipColor: string
}

export interface AppData {
  pendingTasks: Task[]
  currentStick: BambooStick
  archivedSticks: BambooStick[]
  trash: TrashedTask[]
  reports: WeeklyReport[]
  lastSealedWeekKey: string | null
  categories: CategoryConfig[]
}

export type View = 'workspace' | 'basket' | 'reports'

export type AnimationType = 'complete' | 'discard' | null

export interface AnimationState {
  type: AnimationType
  task: Task | null
  sourceRect: DOMRect | null
}
