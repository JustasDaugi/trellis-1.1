<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { useRoute } from 'vue-router'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import { authUserId } from '@/stores/user'

const emit = defineEmits(['list-created'])
const route = useRoute()
const addListRef = ref(false)
const listForm = ref({
  title: '',
})

const [createList, errorMessage] = useErrorMessage(async () => {
  try {
    const boardId = Number(route.params.id)
    const userId = authUserId.value
    if (boardId && userId && listForm.value.title) {
      const list = await trpc.list.create.mutate({
        title: listForm.value.title,
        boardId,
        userId,
      })
      console.log('List created successfully')
      emit('list-created', list)
      listForm.value.title = ''
      addListRef.value = false
    }
  } catch (error) {
    console.log('List creation failed:', error)
    throw error
  }
})

const toggleAddList = () => {
  addListRef.value = !addListRef.value
}
</script>

<template>
  <div>
    <button
      v-if="!addListRef"
      @click="toggleAddList"
      class="h-16 w-48 rounded-lg bg-black text-base font-medium text-blue-400 shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      + Add list
    </button>
    <div v-else class="w-full">
      <div class="flex w-52 items-center rounded-lg bg-black p-4">
        <input
          v-model="listForm.title"
          type="text"
          placeholder="List name"
          class="w-full border-b-2 border-none border-blue-500 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-0"
          maxlength="500"
        />
        <button @click="createList" class="ml-4 text-blue-500 hover:text-blue-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button @click="toggleAddList" class="ml-2 text-gray-400 hover:text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>
