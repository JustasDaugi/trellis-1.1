<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import type { Selectable } from 'kysely'
import type { BoardPublic } from '@server/shared/types'
import { getBackgroundImageUrl } from '@/utils/fetchImage'

const props = defineProps<{
  board: Selectable<BoardPublic>
}>()

const { board } = props

const backgroundImageUrl = getBackgroundImageUrl(board)
</script>

<template>
  <RouterLink :to="`/board/${board.id}`" class="block">
    <div
      :style="{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
      class="relative flex h-full transform cursor-pointer flex-col overflow-hidden rounded-lg p-4 shadow-md transition-transform hover:scale-105 dark:bg-gray-700"
    >
      <div class="absolute inset-0 bg-black opacity-25"></div>
      <div class="relative z-10 flex h-full flex-col justify-end">
        <h4 class="mb-2 text-lg font-semibold text-white hover:text-blue-300">
          {{ board.title }}
        </h4>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
div {
  height: 200px;
}

div {
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

div:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}
</style>
