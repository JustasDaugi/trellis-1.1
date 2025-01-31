<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import BackgroundSelection from './BackgroundSelection.vue'
import CloseButton from '../../CloseButton.vue'

const router = useRouter()
const isDialogOpen = ref(false)

const boardForm = ref({
  title: '',
  selectedBackground: '',
})

const [createBoard, errorMessage] = useErrorMessage(async () => {
  try {
    const board = await trpc.board.create.mutate(boardForm.value)
    router.push({
      name: 'Board',
      params: { id: board.id },
    })
  } catch (error) {
    console.log('Board creation failed:', error)
    throw error
  }
})

function openDialog() {
  isDialogOpen.value = true
}

function closeDialog() {
  isDialogOpen.value = false
}

function selectBackground(background: string) {
  boardForm.value.selectedBackground = background
}
</script>

<template>
  <div>
    <button
      @click="openDialog"
      class="bg-orchid-500 hover:bg-orchid-600 fixed bottom-6 right-6 z-[1000] flex items-center space-x-2 rounded-md px-4 py-2 shadow-lg focus:outline-none"
      aria-label="Create Board"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        class="h-5 w-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span class="font-bold text-black">Create board</span>
    </button>
    <Teleport to="body">
      <div
        v-if="isDialogOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-800 bg-opacity-75"
        @click.self="closeDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-board-title"
      >
        <div class="relative z-[1001] w-96 rounded-lg bg-white p-6 shadow-lg" @click.stop>
          <form @submit.prevent="createBoard">
            <h2 id="create-board-title" class="mb-4 text-xl font-bold">Create board</h2>
            <BackgroundSelection
              :selectedBackground="boardForm.selectedBackground"
              @selectBackground="selectBackground"
            />
            <div class="mb-4">
              <label for="board-title" class="mb-2 block text-sm font-medium text-gray-700"
                >Board title</label
              >
              <input
                id="board-title"
                v-model="boardForm.title"
                type="text"
                class="focus:border-orchid-500 focus:ring-orchid-500 block w-full rounded-md border-gray-300 shadow-sm"
                required
                maxlength="500"
                placeholder="Enter board title"
              />
            </div>
            <AlertError :message="errorMessage" />
            <button
              type="submit"
              class="bg-orchid-500 hover:bg-orchid-600 mt-4 w-full rounded-md px-4 py-2 font-bold text-black disabled:opacity-50"
              :disabled="!boardForm.title"
            >
              Create
            </button>
            <CloseButton @close="closeDialog" />
          </form>
        </div>
      </div>
    </Teleport>
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
