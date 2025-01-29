<script lang="ts" setup>
import { ref, computed } from 'vue'
import { defineProps, defineEmits } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import Buttons from './Buttons.vue'
import StartDate from './DueDate.vue'
import type { CardPublic } from '@server/shared/types'
import type { UpdateCardPayload } from '@/views/BoardView.vue'

const props = defineProps<{
  card: CardPublic
}>()

const emit = defineEmits<{
  (e: 'update-card', payload: UpdateCardPayload): void
  (e: 'delete-card'): void
}>()

const isDialogOpen = ref(true)
const isDeleteMessageVisible = ref(false)

const showStartDateModal = ref(false)

const selectedDueDate = ref<Date | null>(props.card.dueDate)

const cardTitle = ref(props.card.title)
const cardDescription = ref(props.card.description || '')

const startDateButtonText = computed(() => {
  if (!selectedDueDate.value) {
    return 'Due date'
  }
  return `Due date: ${selectedDueDate.value.toLocaleString()}`
})

function closeDialog() {
  isDialogOpen.value = false
}

const [updateCard, updateErrorMessage] = useErrorMessage(async () => {
  if (cardTitle.value.trim()) {
    const previousTitle = props.card.title
    const previousDescription = props.card.description || ''

    const updates: { title?: string; description?: string } = {}

    if (cardTitle.value.trim() !== previousTitle) {
      updates.title = cardTitle.value.trim()
      emit('update-card', {
        updatedField: 'title',
        previousValue: previousTitle,
        newValue: cardTitle.value.trim(),
      })
    }

    if (cardDescription.value.trim() !== previousDescription) {
      updates.description = cardDescription.value.trim()
      emit('update-card', {
        updatedField: 'description',
        previousValue: previousDescription,
        newValue: cardDescription.value.trim(),
      })
    }

    const previousDueDate = props.card.dueDate
      ? new Date(props.card.dueDate).toLocaleString()
      : null
    const newDueDate = selectedDueDate.value ? selectedDueDate.value.toLocaleString() : null

    if (previousDueDate !== newDueDate) {
      emit('update-card', {
        updatedField: 'dueDate',
        previousValue: undefined,
        newValue: undefined,
        previousDueDate,
        newDueDate,
      })
    }

    if (Object.keys(updates).length > 0) {
      await trpc.card.update.mutate({
        id: props.card.id,
        ...updates,
      })
    }

    closeDialog()
  }
})

async function confirmUpdate() {
  await updateCard()
}

const [deleteCard, deleteErrorMessage] = useErrorMessage(async () => {
  await trpc.card.deleteById.mutate({ id: props.card.id })
  emit('delete-card')
  closeDialog()
})
async function confirmDelete() {
  await deleteCard()
}
function toggleDeleteMessage() {
  isDeleteMessageVisible.value = !isDeleteMessageVisible.value
}

const [addToCalendar, addToCalendarErrorMessage] = useErrorMessage(async () => {
  if (!selectedDueDate.value) {
    throw new Error('Start date is required.')
  }

  const result = await trpc.calendar.add.mutate({
    title: cardTitle.value,
    description: cardDescription.value,
    startDate: selectedDueDate.value.toISOString(),
  })

  if (result?.authUrl) {
    window.location.href = result.authUrl
  }
})
async function confirmAddToCalendar() {
  try {
    await addToCalendar()
  } catch (error) {
    console.error('Error adding to calendar:', error)
  }
}

function handleStartDateDone(newStartDate: Date | null) {
  selectedDueDate.value = newStartDate
  showStartDateModal.value = false
}

function closeStartDateModal() {
  showStartDateModal.value = false
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

            <div class="mb-4">
              <button
                type="button"
                class="w-full border border-gray-300 py-2 text-center text-sm font-medium text-blue-700"
                @click="showStartDateModal = true"
              >
                {{ startDateButtonText }}
              </button>
            </div>

            <div class="mb-4">
              <button
                type="button"
                class="w-full py-2 text-center text-sm font-medium text-blue-700 underline"
                @click="confirmAddToCalendar"
              >
                Go to calendar
              </button>
            </div>

            <p v-if="addToCalendarErrorMessage" class="mb-4 text-sm text-red-500">
              {{ addToCalendarErrorMessage }}
            </p>
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

    <StartDate
      v-if="showStartDateModal"
      :cardId="props.card.id"
      :initialDueDate="props.card.dueDate"
      @close="closeStartDateModal"
      @done="handleStartDateDone"
    />
  </div>
</template>
