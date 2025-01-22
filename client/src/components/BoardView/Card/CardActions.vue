<script lang="ts" setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import Buttons from './Buttons.vue'
import type { CardPublic } from '@server/shared/types'

const props = defineProps<{
  card: CardPublic
}>()

const emit = defineEmits<{
  (e: 'update-card'): void
  (e: 'delete-card'): void
}>()

const isDialogOpen = ref(true)
const isDeleteMessageVisible = ref(false)
const cardTitle = ref(props.card.title)
const cardDescription = ref(props.card.description || '')

const closeDialog = () => {
  isDialogOpen.value = false
}

const [updateCard, updateErrorMessage] = useErrorMessage(async () => {
  if (cardTitle.value.trim()) {
    await trpc.card.update.mutate({
      id: props.card.id,
      title: cardTitle.value.trim(),
      description: cardDescription.value.trim(),
    })
    emit('update-card')
    closeDialog()
  }
})

const confirmUpdate = async () => {
  await updateCard()
}

const [deleteCard, deleteErrorMessage] = useErrorMessage(async () => {
  await trpc.card.deleteById.mutate({ id: props.card.id })
  emit('delete-card')
  closeDialog()
})

const confirmDelete = async () => {
  await deleteCard()
}

const toggleDeleteMessage = () => {
  isDeleteMessageVisible.value = !isDeleteMessageVisible.value
}
</script>

<template>
  <div>
    <transition name="fade">
      <div
        v-if="isDialogOpen"
        class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div class="w-96 scale-95 transform rounded-md bg-white p-6 shadow-lg transition-transform">
          <h2 class="mb-4 text-xl font-bold text-gray-800">Manage Card</h2>
          <div class="mb-6">
            <h4 class="mb-2 text-lg font-bold text-gray-700">Edit Card</h4>
            <label class="mb-4 block">
              <span class="mb-2 block text-sm font-medium text-gray-700">Title</span>
              <input
                v-model="cardTitle"
                type="text"
                class="focus:border-orchid-500 focus:ring-orchid-200 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring"
              />
            </label>
            <label class="mb-4 block">
              <span class="mb-2 block text-sm font-medium text-gray-700">Description</span>
              <textarea
                v-model="cardDescription"
                rows="3"
                class="focus:border-orchid-500 focus:ring-orchid-200 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring"
              ></textarea>
            </label>
            <p v-if="updateErrorMessage" class="mb-4 text-sm text-red-500">
              {{ updateErrorMessage }}
            </p>
          </div>
          <div class="mb-4" v-if="isDeleteMessageVisible">
            <p class="text-sm text-gray-700">Are you sure you want to delete this card?</p>
            <p v-if="deleteErrorMessage" class="mt-2 text-sm text-red-500">
              {{ deleteErrorMessage }}
            </p>
          </div>

          <Buttons
            :onClose="closeDialog"
            :onUpdate="confirmUpdate"
            :onDelete="confirmDelete"
            :isDeleteMessageVisible="isDeleteMessageVisible"
            @toggle-delete-message="toggleDeleteMessage"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
