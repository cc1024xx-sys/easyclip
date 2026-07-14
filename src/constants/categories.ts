import type { CategoryConfig } from '../types'

export type { CategoryConfig }

export const MAX_CATEGORIES = 12

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'work',
    label: '工作',
    color: '#6B8E9B',
    bg: '#E4EDF0',
    border: '#A8BFC8',
    clipColor: '#8B9DA6',
  },
  {
    id: 'life',
    label: '生活',
    color: '#B8956B',
    bg: '#F2E8DA',
    border: '#D4BC9A',
    clipColor: '#A08060',
  },
  {
    id: 'learning',
    label: '学习',
    color: '#7A9A7E',
    bg: '#E8EFE6',
    border: '#A8C4AA',
    clipColor: '#8FA68E',
  },
  {
    id: 'health',
    label: '健康',
    color: '#C49A9A',
    bg: '#F5EAEA',
    border: '#D4B0B0',
    clipColor: '#B88888',
  },
]

const CATEGORY_PALETTE: Omit<CategoryConfig, 'id' | 'label'>[] = [
  { color: '#8B7BA8', bg: '#EDE8F4', border: '#B8A8D0', clipColor: '#9A8AB8' },
  { color: '#7A9099', bg: '#E6EEF1', border: '#A8BEC8', clipColor: '#889AA3' },
  { color: '#A89070', bg: '#F3EBE0', border: '#D0BCA0', clipColor: '#988060' },
  { color: '#889A7A', bg: '#EBF0E6', border: '#B0C4A8', clipColor: '#788A6A' },
  { color: '#A88898', bg: '#F2EAEE', border: '#D0B0C0', clipColor: '#987888' },
  { color: '#7090A8', bg: '#E6EEF4', border: '#A0B8D0', clipColor: '#608098' },
  { color: '#989070', bg: '#F0EEE6', border: '#C8C0A0', clipColor: '#888060' },
  { color: '#7A9888', bg: '#E8F0EC', border: '#A8C4B8', clipColor: '#6A8878' },
]

export function buildCategoryFromPalette(
  label: string,
  index: number,
): Omit<CategoryConfig, 'id'> {
  const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
  return { label, ...palette }
}

export function getCategoryMap(
  categories: CategoryConfig[],
): Record<string, CategoryConfig> {
  return Object.fromEntries(categories.map((c) => [c.id, c]))
}

export function resolveCategory(
  map: Record<string, CategoryConfig>,
  id: string,
): CategoryConfig {
  return (
    map[id] ?? {
      id,
      label: id.length <= 8 ? id : '其他',
      color: '#9A8B78',
      bg: '#F0EBE3',
      border: '#D4C9B8',
      clipColor: '#9A8B78',
    }
  )
}

export const DISCARD_MESSAGES = [
  '放下这张，下周再来',
  '不必强求，轻装整理',
  '舍弃也是收纳的一部分',
  '调整节奏，留些空白',
]

export const REPORT_MESSAGES = {
  excellent: '本周票夹饱满，每一张便签都是真实留下的痕迹。',
  good: '本周夹入扎实，书桌上的成果清晰可见。',
  moderate: '本周节奏适中，便签层叠刚刚好。',
  busy: '本周似乎过于忙碌，下周是否调整节奏？',
  ambitious: '本周目标或许过大，不妨精简待办，专注当下。',
  empty: '本周票夹尚空，从夹入第一张便签开始。',
}
