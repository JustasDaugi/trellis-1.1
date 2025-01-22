<script lang="ts" setup>
import UpdateBoard from './UpdateBoard.vue'
import DeleteBoard from './DeleteBoard.vue'
import ShareBoard from '@/components/BoardView/Board/ShareBoard.vue'
import type { BoardPublic } from '@server/shared/types'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  board: BoardPublic
}>()

const emit = defineEmits<{
  (e: 'change-name', newName: string): void
  (e: 'delete-board'): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const deleteBoardRef = ref<InstanceType<typeof DeleteBoard> | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const onDelete = () => {
  if (deleteBoardRef.value) {
    deleteBoardRef.value.open()
  }
}

const changeName = (newName: string) => {
  emit('change-name', newName)
  closeDropdown()
}

const cancelUpdate = () => {
  closeDropdown()
}

const cancelDelete = () => {
  closeDropdown()
}

const cancelShare = () => {
  closeDropdown()
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="text-white focus:outline-none" ref="dropdownRef">
    <button class="text-white focus:outline-none" @click="toggleDropdown">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v.01M12 12v.01M12 18v.01" />
      </svg>
    </button>
    <div v-if="isOpen" class="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-white shadow-lg">
      <UpdateBoard
        :board="props.board"
        :closeDropdown="closeDropdown"
        @change-name="changeName"
        @cancel="cancelUpdate"
      />
      <button
        @click="onDelete"
        class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
      >
        Delete board
      </button>
      <DeleteBoard
        ref="deleteBoardRef"
        :board="props.board"
        @delete-board="emit('delete-board')"
        @cancel="cancelDelete"
      />
      <ShareBoard :boardId="props.board.id" @cancel="cancelShare" />
    </div>
  </div>
</template>
