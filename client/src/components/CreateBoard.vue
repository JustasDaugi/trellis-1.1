<script setup lang="ts">
import { ref } from 'vue'

interface BoardForm {
  title: string
  selectedBackground: string
}

const isDialogOpen = ref(false)
const boardForm = ref<BoardForm>({
  title: '',
  selectedBackground: '',
})

function openDialog() {
  isDialogOpen.value = true
}

function selectBackground(background: string) {
  boardForm.value.selectedBackground = background
}

function createBoard() {
  console.log('Board created with title:', boardForm.value.title)
  console.log('Selected background:', boardForm.value.selectedBackground)
  isDialogOpen.value = false
}
</script>

<template>
  <div>
    <button
      @click="openDialog"
      class="bg-orchid-500 hover:bg-orchid-600 fixed bottom-6 right-6 flex items-center space-x-2 rounded-md px-4 py-2 text-white shadow-lg focus:outline-none"
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

    <div
      v-if="isDialogOpen"
      class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75"
      @click.self="isDialogOpen = false"
    >
      <div class="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-xl font-bold">Create board</h2>
        <div class="mb-4 flex space-x-2">
          <div class="relative">
            <img
              src="@/assets/background-1.jpg"
              alt="Background 1"
              class="h-16 w-24 cursor-pointer rounded-lg object-cover"
              @click="selectBackground('@/assets/background-1.jpg')"
            />
            <svg
              v-if="boardForm.selectedBackground === '@/assets/background-1.jpg'"
              class="absolute right-1 top-1 h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 011.414 1.414l-7.364 7.364a1 1 0 01-1.414 0L6.293 11.707a1 1 0 011.414-1.414L10 12.586l5.293-5.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="relative">
            <img
              src="@/assets/background-2.jpg"
              alt="Background 2"
              class="h-16 w-24 cursor-pointer rounded-lg object-cover"
              @click="selectBackground('@/assets/background-2.jpg')"
            />
            <svg
              v-if="boardForm.selectedBackground === '@/assets/background-2.jpg'"
              class="absolute right-1 top-1 h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 011.414 1.414l-7.364 7.364a1 1 0 01-1.414 0L6.293 11.707a1 1 0 011.414-1.414L10 12.586l5.293-5.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="relative">
            <img
              src="@/assets/background-3.jpg"
              alt="Background 3"
              class="h-16 w-24 cursor-pointer rounded-lg object-cover"
              @click="selectBackground('@/assets/background-3.jpg')"
            />
            <svg
              v-if="boardForm.selectedBackground === '@/assets/background-3.jpg'"
              class="absolute right-1 top-1 h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 011.414 1.414l-7.364 7.364a1 1 0 01-1.414 0L6.293 11.707a1 1 0 011.414-1.414L10 12.586l5.293-5.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <label for="board-title" class="mb-2 block text-sm font-medium text-gray-700"
          >Board title</label
        >
        <input
          id="board-title"
          v-model="boardForm.title"
          type="text"
          class="focus:border-orchid-500 focus:ring-orchid-500 block w-full rounded-md border-gray-300 shadow-sm"
        />
        <button
          @click="createBoard"
          class="bg-orchid-500 hover:bg-orchid-600 mt-4 w-full rounded-md px-4 py-2 text-white"
        >
          Create
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
