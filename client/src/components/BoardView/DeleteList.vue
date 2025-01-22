<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="w-96 rounded-md bg-white p-6 shadow-lg">
      <h3 class="mb-4 text-lg font-semibold">Delete List</h3>
      <p>Are you sure you want to delete the list "{{ list.title }}"?</p>
      <p v-if="deleteErrorMessage" class="mt-2 text-sm text-red-500">{{ deleteErrorMessage }}</p>
      <div class="mt-4 flex justify-end">
        <button class="mr-2 rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300" @click="close">
          Cancel
        </button>
        <button
          class="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          @click="confirmDeleteList"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits, defineProps } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import type { ListPublic } from '@server/shared/types'

const emit = defineEmits<{
  (e: 'delete-list'): void
}>()

const props = defineProps<{
  list: ListPublic
}>()

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const [deleteList, deleteErrorMessage] = useErrorMessage(async () => {
  try {
    await trpc.list.deleteById.mutate({
      id: props.list.id,
    })
    console.log(`List "${props.list.title}" deleted successfully.`)
    emit('delete-list')
    close()
  } catch (error) {
    console.log(`List "${props.list.title}" deletion failed:`, error)
    throw error
  }
})

const confirmDeleteList = async () => {
  await deleteList()
}

import { defineExpose } from 'vue'

defineExpose({
  open,
})
</script>
