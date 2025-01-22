<script lang="ts" setup>
import { ref } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import type { ListPublic } from '@server/shared/types'

const props = defineProps<{
  list: ListPublic
}>()

const emit = defineEmits<{
  (e: 'change-name', newName: string): void
  (e: 'cancel'): void
}>()

const isOpen = ref(false)
const listName = ref(props.list.title)

const openDialog = () => {
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
  emit('cancel')
}

const [updateList, updateErrorMessage] = useErrorMessage(async () => {
  try {
    if (listName.value.trim()) {
      await trpc.list.update.mutate({
        id: props.list.id,
        title: listName.value.trim(),
      })
      emit('change-name', listName.value.trim())
      closeDialog()
    }
  } catch (error) {
    console.log('List update failed:', error)
    throw error
  }
})

const changeName = async () => {
  await updateList()
}
</script>

<template>
  <div>
    <button
      @click="openDialog"
      class="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-100"
    >
      Change name
    </button>
    <div
      v-if="isOpen"
      class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h3 class="mb-4 text-xl font-bold text-black">Change Name</h3>
        <div class="mb-4">
          <label for="list-name" class="mb-2 block text-sm font-medium text-gray-700">
            List Name
          </label>
          <input
            id="list-name"
            v-model="listName"
            type="text"
            class="focus:border-orchid-500 focus:ring-orchid-500 block w-full rounded-md border-gray-300 text-black shadow-sm"
            required
            maxlength="500"
            placeholder="Enter new list name"
          />
        </div>
        <p v-if="updateErrorMessage" class="mt-2 text-sm text-red-500">{{ updateErrorMessage }}</p>
        <div class="mt-4 flex justify-end">
          <button
            class="mr-2 rounded-md bg-gray-400 px-4 py-2 font-bold text-white hover:bg-gray-500"
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

<style scoped>
.border-orchid-500 {
  border-color: #9d4edd;
}
</style>
