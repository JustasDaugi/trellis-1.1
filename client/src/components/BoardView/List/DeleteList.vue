<script lang="ts" setup>
import { ref, defineEmits, defineProps } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import type { ListPublic } from '@server/shared/types'

const emit = defineEmits<{
  (e: 'delete-list'): void
  (e: 'cancel'): void
}>()

const props = defineProps<{
  list: ListPublic
}>()

const isOpen = ref(false)

const openDialog = () => {
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
  emit('cancel')
}

const [deleteList, deleteErrorMessage] = useErrorMessage(async () => {
  try {
    await trpc.list.deleteById.mutate({
      id: props.list.id,
    })
    emit('delete-list')
    closeDialog()
  } catch (error) {
    console.log(error)
    throw error
  }
})

const confirmDelete = async () => {
  await deleteList()
}

import { defineExpose } from 'vue'

defineExpose({
  open: openDialog,
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-800 bg-opacity-75"
    @click.self="closeDialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-list-title"
  >
    <div class="relative z-[1001] w-96 rounded-lg bg-white p-6 shadow-lg" @click.stop>
      <h3 id="delete-list-title" class="mb-4 text-xl font-bold text-black">Delete List</h3>
      <p class="mb-4 text-sm text-gray-700">
        Are you sure you want to delete the list "{{ list.title }}"? This action cannot be undone.
      </p>
      <p v-if="deleteErrorMessage" class="mb-4 text-sm text-red-500">{{ deleteErrorMessage }}</p>
      <div class="flex justify-end">
        <button
          class="mr-2 rounded-md bg-gray-400 px-4 py-2 font-bold text-white hover:bg-gray-500"
          @click="closeDialog"
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
