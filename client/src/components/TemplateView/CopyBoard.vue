<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import BackgroundSelection from '../MainView/CreateBoard/BackgroundSelection.vue'
import CloseButton from '../CloseButton.vue'
import type { BoardTemplatePublic } from '@server/shared/types'

const router = useRouter()
const route = useRoute()
const isDialogWindowOpen = ref(false)

const boardForm = ref({
  id: Number(route.params.id),
  title: '',
  selectedBackground: '',
})

const selectedBoard = ref<BoardTemplatePublic | null>(null)

const fetchBoard = async () => {
  const boardId = Number(route.params.id)
  if (!boardId) {
    console.error('No board ID provided in the route.')
    return
  }

  try {
    const board = await trpc.template.get.query(boardId)
    selectedBoard.value = board
    console.log('Fetched board details:', board)
  } catch (error) {
    console.error('Error fetching board details:', error)
  }
}

const [copyBoard, errorMessage] = useErrorMessage(async () => {
  try {
    const board = await trpc.template.copy.mutate(boardForm.value)
    console.log('Board created from template successfully:', board)
    router.push({
      name: 'Board',
      params: { id: board.id },
    })
  } catch (error) {
    console.error('Board creation from template failed:', error)
    throw error
  }
})

function openDialogWindow() {
  if (!selectedBoard.value) {
    console.error('No board selected for copying.')
    return
  }
  isDialogWindowOpen.value = true
  boardForm.value.title = selectedBoard.value.title
  boardForm.value.selectedBackground = selectedBoard.value.selectedBackground || ''
}

function closeDialogWindow() {
  isDialogWindowOpen.value = false
}

function selectBackground(background: string) {
  boardForm.value.selectedBackground = background
  console.log('Selected Background:', background)
}

onBeforeMount(fetchBoard)
</script>

<template>
  <div>
    <button
      @click="openDialogWindow"
      class="bg-orchid-500 hover:bg-orchid-600 fixed bottom-6 right-6 z-[1000] flex items-center space-x-2 rounded-md px-4 py-2 text-white shadow-lg focus:outline-none"
      aria-label="Create Board From Template"
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
      <span>Create board from template</span>
    </button>
    <Teleport to="body">
      <div
        v-if="isDialogWindowOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-800 bg-opacity-75"
        @click.self="closeDialogWindow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-board-from-template-title"
      >
        <div class="relative z-[1001] w-96 rounded-lg bg-white p-6 shadow-lg" @click.stop>
          <form @submit.prevent="copyBoard">
            <h2 id="create-board-from-template-title" class="mb-4 text-xl font-bold">
              Create board from template
            </h2>
            <BackgroundSelection
              :selectedBackground="boardForm.selectedBackground"
              @selectBackground="selectBackground"
            />
            <div class="mb-4">
              <label for="board-title" class="mb-2 block text-sm font-medium text-gray-700">
                Board title
              </label>
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
              class="bg-orchid-500 hover:bg-orchid-600 mt-4 w-full rounded-md px-4 py-2 text-black"
            >
              Create
            </button>
            <CloseButton @close="closeDialogWindow" />
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
