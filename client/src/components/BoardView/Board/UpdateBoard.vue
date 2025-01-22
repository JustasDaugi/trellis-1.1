<script lang="ts" setup>
import { ref } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import type { BoardPublic } from '@server/shared/types'

const props = defineProps<{
  board: BoardPublic
}>()

const emit = defineEmits<{
  (e: 'change-name', newName: string): void
  (e: 'cancel'): void
}>()

const isDialogOpen = ref(false)
const boardName = ref(props.board.title)

const openDialog = () => {
  isDialogOpen.value = true
}

const closeDialog = () => {
  isDialogOpen.value = false
  emit('cancel')
}

const [updateBoard, updateErrorMessage] = useErrorMessage(async () => {
  try {
    if (boardName.value.trim()) {
      await trpc.board.update.mutate({
        id: props.board.id,
        title: boardName.value.trim(),
      })
      console.log('Board updated successfully')
      emit('change-name', boardName.value.trim())
      closeDialog()
    }
  } catch (error) {
    console.log('Board update failed:', error)
    throw error
  }
})

const changeName = async () => {
  await updateBoard()
}
</script>

<template>
  <div>
    <button
      @click="openDialog"
      class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
    >
      <span class="text-black">Change name</span>
    </button>
    <div
      v-if="isDialogOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-800 bg-opacity-75"
      @click.self="closeDialog"
    >
      <div class="relative z-[1001] w-96 rounded-lg bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-xl font-bold text-black">Change Name</h2>
        <div class="mb-4">
          <label for="board-name" class="mb-2 block text-sm font-medium text-gray-700">
            Board name
          </label>
          <input
            id="board-name"
            v-model="boardName"
            type="text"
            class="focus:border-orchid-500 focus:ring-orchid-500 block w-full rounded-md border-gray-300 text-black shadow-sm"
            required
            maxlength="500"
            placeholder="Enter new board name"
          />
        </div>
        <p v-if="updateErrorMessage" class="mt-2 text-sm text-red-500">{{ updateErrorMessage }}</p>
        <div class="mt-4 flex justify-end">
          <button
            class="mr-2 rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            @click="closeDialog"
          >
            Cancel
          </button>
          <button
            class="bg-orchid-500 hover:bg-orchid-600 rounded-md px-4 py-2 font-bold text-black"
            @click="changeName"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
