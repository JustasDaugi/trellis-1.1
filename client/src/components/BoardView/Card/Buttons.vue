<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  onClose: () => void
  onUpdate: () => void
  onDelete: () => void
  isDeleteMessageVisible: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-delete-message'): void
}>()

const handleDeleteClick = () => {
  if (!props.isDeleteMessageVisible) {
    emit('toggle-delete-message')
  } else {
    props.onDelete()
  }
}
</script>

<template>
  <div class="flex justify-end space-x-2">
    <button class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300" @click="props.onClose">
      Cancel
    </button>
    <button
      class="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      @click="handleDeleteClick"
    >
      Delete
    </button>
    <button
      class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      @click="props.onUpdate"
    >
      Confirm
    </button>
  </div>
</template>
