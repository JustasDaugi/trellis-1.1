import { computed, type Ref } from 'vue'
import type { BoardPublic } from '@server/shared/types'

export function getBackgroundImageUrl(board: BoardPublic): string {
  return board.selectedBackground || ''
}

export function useBackgroundImage(board: Ref<BoardPublic | null>) {
  const backgroundImageUrl = computed(() => board.value?.selectedBackground || '')
  return { backgroundImageUrl }
}
