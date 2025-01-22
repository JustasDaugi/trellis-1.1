<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import BackgroundSelection from './BackgroundSelection.vue'

const router = useRouter()
const isDialogOpen = ref(false)

const boardForm = ref({
  title: '',
  selectedBackground: '',
})

const [createBoard, errorMessage] = useErrorMessage(async () => {
  try {
    const board = await trpc.board.create.mutate(boardForm.value)
    console.log('Board created successfully:', board)
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
  console.log('Selected Background:', background)
}
</script>

<template>
  <div>
    <button
      @click="openDialog"
      class="bg-orchid-500 hover:bg-orchid-600 fixed bottom-6 right-6 z-[1000] flex items-center space-x-2 rounded-md px-4 py-2 text-white shadow-lg focus:outline-none"
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
      <span>Create board</span>
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
              class="bg-orchid-500 hover:bg-orchid-600 mt-4 w-full rounded-md px-4 py-2 text-white disabled:opacity-50"
              :disabled="!boardForm.title || !boardForm.selectedBackground"
            >
              Create
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="absolute right-2 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              @click="closeDialog"
              aria-label="Close dialog"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
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
