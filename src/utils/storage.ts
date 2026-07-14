import { format } from 'date-fns'
import { DEFAULT_CATEGORIES } from '../constants/categories'
import type { AppData } from '../types'
import { createEmptyStick } from './week'

const STORAGE_KEY = 'easyclip-app-data'
const LEGACY_STORAGE_KEYS = ['bianjia-app-data', 'zhuyin-app-data']
export const EXPORT_VERSION = 1

export function loadAppData(): AppData {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        raw = localStorage.getItem(legacyKey)
        if (raw) {
          localStorage.removeItem(legacyKey)
          break
        }
      }
    }
    if (!raw) return createDefaultData()
    const data = JSON.parse(raw) as AppData
    return normalizeData(data)
  } catch {
    return createDefaultData()
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function createDefaultData(): AppData {
  return {
    pendingTasks: [],
    currentStick: createEmptyStick(),
    archivedSticks: [],
    trash: [],
    reports: [],
    lastSealedWeekKey: null,
    categories: [...DEFAULT_CATEGORIES],
  }
}

export function normalizeData(data: AppData): AppData {
  return {
    pendingTasks: data.pendingTasks ?? [],
    currentStick: data.currentStick ?? createEmptyStick(),
    archivedSticks: data.archivedSticks ?? [],
    trash: data.trash ?? [],
    reports: data.reports ?? [],
    lastSealedWeekKey: data.lastSealedWeekKey ?? null,
    categories:
      data.categories?.length > 0 ? data.categories : [...DEFAULT_CATEGORIES],
  }
}

function isAppDataShape(data: unknown): data is AppData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d.pendingTasks) &&
    d.currentStick !== null &&
    typeof d.currentStick === 'object' &&
    Array.isArray(d.archivedSticks) &&
    Array.isArray(d.trash) &&
    Array.isArray(d.reports)
  )
}

export function parseImportPayload(raw: string): AppData {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('无法解析 JSON 文件')
  }

  const data =
    parsed &&
    typeof parsed === 'object' &&
    'data' in parsed &&
    isAppDataShape((parsed as { data: unknown }).data)
      ? (parsed as { data: AppData }).data
      : isAppDataShape(parsed)
        ? parsed
        : null

  if (!data) throw new Error('不是有效的 EasyClip 备份文件')
  return normalizeData(data)
}

export function createExportPayload(data: AppData) {
  return {
    version: EXPORT_VERSION,
    app: 'EasyClip',
    exportedAt: new Date().toISOString(),
    data: normalizeData(data),
  }
}

export function downloadAppDataExport(data: AppData): void {
  const payload = createExportPayload(data)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `easyclip-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  link.click()
  URL.revokeObjectURL(url)
}
