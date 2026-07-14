import {
  endOfWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  isAfter,
  isBefore,
  isSunday,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { v4 as uuid } from 'uuid'
import type { AppData, BambooStick, WeeklyReport } from '../types'
import { REPORT_MESSAGES } from '../constants/categories'

export function getWeekKey(date: Date = new Date()): string {
  const year = getISOWeekYear(date)
  const week = getISOWeek(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function getWeekRange(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return { start, end }
}

export function formatWeekLabel(date: Date = new Date()): string {
  const { start, end } = getWeekRange(date)
  return `${format(start, 'M月d日', { locale: zhCN })} — ${format(end, 'M月d日', { locale: zhCN })}`
}

export function createEmptyStick(date: Date = new Date()): BambooStick {
  const { start, end } = getWeekRange(date)
  return {
    id: uuid(),
    weekKey: getWeekKey(date),
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    tasks: [],
  }
}

export function shouldSealWeek(
  currentStickWeekKey: string,
  lastSealedWeekKey: string | null,
  now: Date = new Date(),
): boolean {
  if (lastSealedWeekKey === currentStickWeekKey) return false

  const thisWeek = getWeekKey(now)
  if (currentStickWeekKey !== thisWeek) return true

  if (!isSunday(now)) return false

  const { end } = getWeekRange(now)
  const deadline = new Date(end)
  deadline.setHours(23, 59, 0, 0)
  return !isBefore(now, deadline)
}

export function getTrashExpiryTime(discardedAt: string): Date {
  return new Date(parseISO(discardedAt).getTime() + 24 * 60 * 60 * 1000)
}

export function isTrashExpired(discardedAt: string, now: Date = new Date()): boolean {
  return isAfter(now, getTrashExpiryTime(discardedAt))
}

export function getTrashRemainingMs(discardedAt: string, now: Date = new Date()): number {
  const expiry = getTrashExpiryTime(discardedAt)
  return Math.max(0, expiry.getTime() - now.getTime())
}

export function formatRemainingTime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}时${minutes}分`
  return `${minutes}分钟`
}

export function generateReportMessage(
  completedCount: number,
  discardedCount: number,
): string {
  const total = completedCount + discardedCount
  if (total === 0) return REPORT_MESSAGES.empty
  const ratio = completedCount / total
  if (ratio >= 0.8 && completedCount >= 5) return REPORT_MESSAGES.excellent
  if (ratio >= 0.7) return REPORT_MESSAGES.good
  if (ratio >= 0.5) return REPORT_MESSAGES.moderate
  if (discardedCount > completedCount) return REPORT_MESSAGES.ambitious
  return REPORT_MESSAGES.busy
}

export function createWeeklyReport(
  stick: BambooStick,
  discardedCount: number,
): WeeklyReport {
  const breakdown: Record<string, number> = {}
  for (const task of stick.tasks) {
    breakdown[task.category] = (breakdown[task.category] ?? 0) + 1
  }

  const weekStart = parseISO(stick.weekStart)
  return {
    id: uuid(),
    weekKey: stick.weekKey,
    weekLabel: formatWeekLabel(weekStart),
    completedCount: stick.tasks.length,
    discardedCount,
    categoryBreakdown: breakdown,
    message: generateReportMessage(stick.tasks.length, discardedCount),
    generatedAt: new Date().toISOString(),
  }
}

export function purgeExpiredTrash(data: AppData, now: Date = new Date()): AppData {
  return {
    ...data,
    trash: data.trash.filter((t) => !isTrashExpired(t.discardedAt, now)),
  }
}

export function isStickFromCurrentWeek(stick: BambooStick, now: Date = new Date()): boolean {
  return stick.weekKey === getWeekKey(now)
}

export function isBeforeWeekEnd(now: Date = new Date()): boolean {
  const { end } = getWeekRange(now)
  const deadline = new Date(end)
  deadline.setHours(23, 59, 59, 999)
  return isBefore(now, deadline)
}
