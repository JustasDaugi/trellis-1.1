<script lang="ts" setup>
import { ref, defineEmits, defineProps } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import type { BoardPublic } from '@server/shared/types'

const emit = defineEmits<{
  (e: 'delete-board'): void
  (e: 'cancel'): void
}>()

const props = defineProps<{
  board: BoardPublic
}>()

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  emit('cancel')
}

const [deleteBoard, deleteErrorMessage] = useErrorMessage(async () => {
  try {
    await trpc.board.deleteById.mutate({
      id: props.board.id,
    })
    console.log(`Board "${props.board.title}" deleted successfully.`)
    emit('delete-board')
    close()
  } catch (error) {
    console.log(`Board "${props.board.title}" deletion failed:`, error)
    throw error
  }
})

const confirmDelete = async () => {
  await deleteBoard()
}

import { defineExpose } from 'vue'

defineExpose({
  open,
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-800 bg-opacity-75"
    @click.self="close"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-board-title"
  >
    <div class="relative z-[1001] w-96 rounded-lg bg-white p-6 shadow-lg" @click.stop>
      <h3 id="delete-board-title" class="mb-4 text-xl font-bold text-black">Delete Board</h3>
      <p class="mb-4 text-sm text-gray-700">
        Are you sure you want to delete the board "{{ board.title }}"? This action cannot be undone.
      </p>
      <p v-if="deleteErrorMessage" class="mb-4 text-sm text-red-500">{{ deleteErrorMessage }}</p>
      <div class="flex justify-end">
        <button
          class="mr-2 rounded-md bg-gray-400 px-4 py-2 font-bold text-white hover:bg-gray-500"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="rounded-md bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
          @click="confirmDelete"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-orchid-500 {
  border-color: #9d4edd;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
