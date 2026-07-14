import type { CompletedTask } from '../types'

export function getStackOffset(id: string, index: number) {
  const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1) + index * 13
  return {
    rotate: ((seed % 9) - 4) * 0.6,
    x: ((seed % 7) - 3) * 0.8,
    y: ((seed % 5) - 2) * 0.4,
  }
}

export const CLIP_NOTE_SIZE = 34
export const CLIP_STACK_STEP = 3
export const CLIP_MAX_VISIBLE = 8

export function getClipStackHeight(count: number): number {
  if (count === 0) return 44
  const visible = Math.min(count, CLIP_MAX_VISIBLE)
  return (visible - 1) * CLIP_STACK_STEP + CLIP_NOTE_SIZE + 8
}

export type StackableTask = Pick<CompletedTask, 'id' | 'title' | 'category'>
