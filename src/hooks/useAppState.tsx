import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { v4 as uuid } from 'uuid'
import type {
  AnimationState,
  AppData,
  Task,
  TaskCategory,
  TrashedTask,
  View,
} from '../types'
import { DISCARD_MESSAGES, buildCategoryFromPalette, getCategoryMap, MAX_CATEGORIES } from '../constants/categories'
import type { CategoryConfig } from '../types'
import { loadAppData, saveAppData, downloadAppDataExport, parseImportPayload } from '../utils/storage'
import {
  createEmptyStick,
  createWeeklyReport,
  isTrashExpired,
  purgeExpiredTrash,
  shouldSealWeek,
} from '../utils/week'
import {
  playClipSnap,
  playCanvasDrop,
  playPaperCrumple,
  playPaperSlide,
  playSealSound,
  resumeAudio,
} from '../utils/sounds'

type Action =
  | { type: 'HYDRATE'; data: AppData }
  | { type: 'ADD_TASK'; title: string; category: TaskCategory; dueDate?: string }
  | { type: 'COMPLETE_TASK'; taskId: string }
  | { type: 'DISCARD_TASK'; taskId: string }
  | { type: 'RESTORE_TASK'; taskId: string }
  | { type: 'PURGE_TRASH' }
  | { type: 'SEAL_WEEK' }
  | { type: 'REMOVE_CLIPPED_TASK'; taskId: string }
  | { type: 'CLEAR_CLIPPED_CATEGORY'; category: TaskCategory }
  | { type: 'ADD_CATEGORY'; label: string }

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'HYDRATE':
      return action.data

    case 'ADD_TASK': {
      const task: Task = {
        id: uuid(),
        title: action.title.trim(),
        category: action.category,
        dueDate: action.dueDate,
        createdAt: new Date().toISOString(),
      }
      return { ...state, pendingTasks: [task, ...state.pendingTasks] }
    }

    case 'COMPLETE_TASK': {
      const task = state.pendingTasks.find((t) => t.id === action.taskId)
      if (!task) return state
      const completed = {
        ...task,
        completedAt: new Date().toISOString(),
      }
      return {
        ...state,
        pendingTasks: state.pendingTasks.filter((t) => t.id !== action.taskId),
        currentStick: {
          ...state.currentStick,
          tasks: [...state.currentStick.tasks, completed],
        },
      }
    }

    case 'DISCARD_TASK': {
      const task = state.pendingTasks.find((t) => t.id === action.taskId)
      if (!task) return state
      const trashed: TrashedTask = {
        ...task,
        discardedAt: new Date().toISOString(),
      }
      return {
        ...state,
        pendingTasks: state.pendingTasks.filter((t) => t.id !== action.taskId),
        trash: [trashed, ...state.trash],
      }
    }

    case 'RESTORE_TASK': {
      const trashed = state.trash.find((t) => t.id === action.taskId)
      if (!trashed || isTrashExpired(trashed.discardedAt)) return state
      const { discardedAt: _, ...task } = trashed
      return {
        ...state,
        trash: state.trash.filter((t) => t.id !== action.taskId),
        pendingTasks: [task, ...state.pendingTasks],
      }
    }

    case 'PURGE_TRASH':
      return purgeExpiredTrash(state)

    case 'SEAL_WEEK': {
      const stickToSeal = state.currentStick
      const discardedCount = state.trash.length
      const report = createWeeklyReport(stickToSeal, discardedCount)
      const sealedStick = {
        ...stickToSeal,
        sealedAt: new Date().toISOString(),
      }

      return {
        ...state,
        archivedSticks: [sealedStick, ...state.archivedSticks],
        currentStick: createEmptyStick(),
        trash: [],
        reports: [report, ...state.reports],
        lastSealedWeekKey: stickToSeal.weekKey,
      }
    }

    case 'REMOVE_CLIPPED_TASK': {
      const exists = state.currentStick.tasks.some((t) => t.id === action.taskId)
      if (!exists) return state
      return {
        ...state,
        currentStick: {
          ...state.currentStick,
          tasks: state.currentStick.tasks.filter((t) => t.id !== action.taskId),
        },
      }
    }

    case 'CLEAR_CLIPPED_CATEGORY': {
      return {
        ...state,
        currentStick: {
          ...state.currentStick,
          tasks: state.currentStick.tasks.filter(
            (t) => t.category !== action.category,
          ),
        },
      }
    }

    case 'ADD_CATEGORY': {
      const label = action.label.trim()
      if (!label) return state
      if (state.categories.length >= MAX_CATEGORIES) return state
      if (state.categories.some((c) => c.label === label)) return state
      const palette = buildCategoryFromPalette(label, state.categories.length)
      const category: CategoryConfig = { id: uuid(), ...palette }
      return { ...state, categories: [...state.categories, category] }
    }

    default:
      return state
  }
}

interface AppContextValue {
  data: AppData
  view: View
  setView: (view: View) => void
  animation: AnimationState
  discardMessage: string
  addTask: (title: string, category: TaskCategory, dueDate?: string) => void
  completeTask: (taskId: string, sourceRect: DOMRect | null) => void
  discardTask: (taskId: string, sourceRect: DOMRect | null) => void
  restoreTask: (taskId: string) => void
  removeClippedTask: (taskId: string) => void
  clearClippedCategory: (category: TaskCategory) => void
  addCategory: (label: string) => boolean
  exportData: () => void
  importData: (file: File) => Promise<void>
  categoryMap: Record<string, CategoryConfig>
  latestReport: AppData['reports'][0] | null
  showReport: boolean
  dismissReport: () => void
  stickFillPercent: number
  bounceCategory: TaskCategory | null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, loadAppData())
  const [view, setView] = useState<View>('workspace')
  const [animation, setAnimation] = useState<AnimationState>({
    type: null,
    task: null,
    sourceRect: null,
  })
  const [showReport, setShowReport] = useState(false)
  const [bounceCategory, setBounceCategory] = useState<TaskCategory | null>(null)
  const [discardMessage] = useState(
    () => DISCARD_MESSAGES[Math.floor(Math.random() * DISCARD_MESSAGES.length)],
  )

  useEffect(() => {
    saveAppData(data)
  }, [data])

  useEffect(() => {
    const check = () => {
      dispatch({ type: 'PURGE_TRASH' })
      const now = new Date()
      if (
        shouldSealWeek(
          data.currentStick.weekKey,
          data.lastSealedWeekKey,
          now,
        )
      ) {
        dispatch({ type: 'SEAL_WEEK' })
        playSealSound()
        setShowReport(true)
      }
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [data.currentStick.weekKey, data.lastSealedWeekKey])

  const addTask = useCallback(
    (title: string, category: TaskCategory, dueDate?: string) => {
      if (!title.trim()) return
      resumeAudio()
      dispatch({ type: 'ADD_TASK', title, category, dueDate })
    },
    [],
  )

  const completeTask = useCallback(
    (taskId: string, sourceRect: DOMRect | null) => {
      const task = data.pendingTasks.find((t) => t.id === taskId)
      if (!task) return
      setAnimation({ type: 'complete', task, sourceRect })
      setTimeout(() => {
        playPaperSlide()
      }, 350)
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_TASK', taskId })
        playClipSnap()
        setBounceCategory(task.category)
        setAnimation({ type: null, task: null, sourceRect: null })
        setTimeout(() => setBounceCategory(null), 500)
      }, 750)
    },
    [data.pendingTasks],
  )

  const discardTask = useCallback(
    (taskId: string, sourceRect: DOMRect | null) => {
      const task = data.pendingTasks.find((t) => t.id === taskId)
      if (!task) return

      resumeAudio()
      setAnimation({ type: 'discard', task, sourceRect })
      dispatch({ type: 'DISCARD_TASK', taskId })
      playPaperCrumple()
      setTimeout(() => playCanvasDrop(), 280)
      setTimeout(() => {
        setAnimation({ type: null, task: null, sourceRect: null })
      }, 850)
    },
    [data.pendingTasks],
  )

  const restoreTask = useCallback((taskId: string) => {
    dispatch({ type: 'RESTORE_TASK', taskId })
  }, [])

  const removeClippedTask = useCallback((taskId: string) => {
    resumeAudio()
    dispatch({ type: 'REMOVE_CLIPPED_TASK', taskId })
    playPaperCrumple()
  }, [])

  const clearClippedCategory = useCallback((category: TaskCategory) => {
    resumeAudio()
    dispatch({ type: 'CLEAR_CLIPPED_CATEGORY', category })
    playPaperCrumple()
  }, [])

  const addCategory = useCallback(
    (label: string) => {
      const trimmed = label.trim()
      if (!trimmed) return false
      if (data.categories.length >= MAX_CATEGORIES) return false
      if (data.categories.some((c) => c.label === trimmed)) return false
      dispatch({ type: 'ADD_CATEGORY', label: trimmed })
      return true
    },
    [data.categories],
  )

  const categoryMap = useMemo(
    () => getCategoryMap(data.categories),
    [data.categories],
  )

  const exportData = useCallback(() => {
    downloadAppDataExport(data)
  }, [data])

  const importData = useCallback(async (file: File) => {
    const text = await file.text()
    const imported = parseImportPayload(text)
    dispatch({ type: 'HYDRATE', data: imported })
    setView('workspace')
    setShowReport(false)
    setAnimation({ type: null, task: null, sourceRect: null })
    setBounceCategory(null)
  }, [])

  const stickFillPercent = useMemo(() => {
    const count = data.currentStick.tasks.length
    return Math.min(100, (count / 12) * 100)
  }, [data.currentStick.tasks.length])

  const latestReport = data.reports[0] ?? null

  const value: AppContextValue = {
    data,
    view,
    setView,
    animation,
    discardMessage,
    addTask,
    completeTask,
    discardTask,
    restoreTask,
    removeClippedTask,
    clearClippedCategory,
    addCategory,
    exportData,
    importData,
    categoryMap,
    latestReport,
    showReport,
    dismissReport: () => setShowReport(false),
    stickFillPercent,
    bounceCategory,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
