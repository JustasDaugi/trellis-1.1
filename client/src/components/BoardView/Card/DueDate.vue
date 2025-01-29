<script lang="ts" setup>
import { ref, watch } from 'vue'
import { defineProps, defineEmits } from 'vue'
import { trpc } from '@/trpc'
import useErrorMessage from '@/composables/useErrorMessage'
import DatePicker from './DatePicker.vue'
import ClockPicker from './ClockPicker.vue'

const props = defineProps<{
  cardId: number
  initialDueDate: Date | null
}>()

const emit = defineEmits(['close', 'cancel', 'done', 'update:startDateTime'])

const isModalVisible = ref(true)

const dueDate = ref<Date>(props.initialDueDate || new Date())
const dueTime = ref<Date>(props.initialDueDate || new Date())

const [addStartDate, errorMessage] = useErrorMessage(async () => {
  if (!props.cardId) {
    console.error('Card ID is missing')
    throw new Error('Card ID is missing')
  }

  const combinedDateTime = new Date(
    dueDate.value.getFullYear(),
    dueDate.value.getMonth(),
    dueDate.value.getDate(),
    dueTime.value.getHours(),
    dueTime.value.getMinutes()
  )

  const updatedCard = await trpc.card.addDueDate.mutate({
    id: props.cardId,
    dueDate: combinedDateTime,
  })

  emit('done', updatedCard.dueDate)
})

function closeModal() {
  emit('close')
}

function onCancel() {
  emit('cancel')
  closeModal()
}

async function onDone() {
  await addStartDate()
  closeModal()
}

watch([dueDate, dueTime], ([newDate, newTime]) => {
  const combinedDateTime = new Date(
    newDate.getFullYear(),
    newDate.getMonth(),
    newDate.getDate(),
    newTime.getHours(),
    newTime.getMinutes()
  )
  emit('update:startDateTime', combinedDateTime)
})
</script>

<template>
  <div>
    <transition name="fade">
      <div
        v-if="isModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-70"
      >
        <div
          class="w-80 scale-95 transform rounded-md bg-gray-800 p-4 text-white shadow-2xl transition-transform"
        >
          <header class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Due date</h2>
            <button
              @click="closeModal"
              class="text-2xl text-gray-300 hover:text-white focus:outline-none"
            >
              &times;
            </button>
          </header>

          <div class="mb-6">
            <label class="mb-4 block">
              <span class="mb-2 block text-sm font-medium text-gray-300">Due date</span>
              <DatePicker v-model="dueDate" />
            </label>

            <label class="mb-4 block">
              <span class="mb-2 block text-sm font-medium text-gray-300">Due time</span>
              <ClockPicker v-model="dueTime" />
            </label>
          </div>

          <p v-if="errorMessage" class="mb-4 text-sm text-red-500">
            {{ errorMessage }}
          </p>

          <div class="flex justify-end space-x-4">
            <button
              @click="onCancel"
              class="text-sm text-gray-300 hover:text-white focus:outline-none"
            >
              CANCEL
            </button>
            <button
              @click="onDone"
              class="text-sm text-blue-400 hover:text-blue-300 focus:outline-none"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
