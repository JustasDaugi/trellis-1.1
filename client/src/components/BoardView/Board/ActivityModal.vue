<script setup lang="ts">
import { ref, defineEmits, watch, onMounted, onUnmounted, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { trpc } from '@/trpc'
import { socket } from '../../../config'

type ActivityAction = 'created' | 'updated' | 'deleted'
type ActivityEntityType = 'card' | 'list'

interface Activity {
  id: string
  cardId?: string
  listId: string
  userId: string
  action: ActivityAction
  entityType: ActivityEntityType
  boardId: string
  localTitle?: string
  field?: string
  previousValue?: any
  newValue?: any
  description: string
  previousDueDate?: string | null
  newDueDate?: string | null
  timestamp?: Date
}

const route = useRoute()
const boardId = Number(route.params.id)

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:isOpen'])

const localIsOpen = ref(props.isOpen)
const logs = ref<Activity[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchLogs = async () => {
  if (!boardId) {
    errorMessage.value = 'Invalid or missing boardId.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const queryPayload = {
      boardId,
      limit: 50,
    }

    const response = await trpc.activity.get.query(queryPayload)

    if (response.success) {
      logs.value = response.logs as unknown as Activity[]
      console.debug('Fetched logs:', logs.value)
    } else {
      errorMessage.value = 'Failed to fetch activity logs.'
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
    errorMessage.value = 'An error occurred while fetching activity logs.'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    localIsOpen.value = newVal
    if (newVal) {
      fetchLogs()
    }
  }
)

const closeModal = () => {
  localIsOpen.value = false
  emit('update:isOpen', false)
}

onBeforeMount(async () => {
  if (!boardId) {
    console.error('Board ID is missing.')
    return
  }

  if (props.isOpen) {
    await fetchLogs()
  }
})

watch(logs, (newLogs) => {
  console.log('Logs updated:', newLogs)
})

onMounted(() => {
  socket.on('logCreated', (logEntry: Activity) => {
    if (Number(logEntry.boardId) === boardId) {
      logs.value.push(logEntry)
      console.log('New log added. Updated logs:', logs.value)
    } else {
      console.log('Received log does not belong to current board, ignoring:', logEntry)
    }
  })
})

onUnmounted(() => {
  socket.off('logCreated')
})
</script>

<template>
  <transition name="fade">
    <div
      v-if="localIsOpen"
      class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="max-h-[80vh] w-96 scale-95 transform overflow-y-auto rounded-md bg-white p-6 shadow-lg transition-transform"
      >
        <h2 class="mb-4 text-xl font-bold text-gray-800">Activity Log</h2>
        <div class="mb-6">
          <p class="text-sm text-gray-600">View and track activity related to this board.</p>
        </div>

        <div v-if="isLoading" class="mb-4 text-center text-gray-500">Loading...</div>

        <div v-if="errorMessage" class="mb-4 text-center text-red-500">{{ errorMessage }}</div>

        <ul v-if="logs.length" class="mb-6 divide-y divide-gray-200">
          <li v-for="log in logs" :key="log.id" class="py-2 text-sm text-gray-700">
            <p>{{ log.description }}</p>
            <p class="mt-1 text-xs text-gray-500">
              {{ log.timestamp?.toLocaleString() ?? 'No timestamp available' }}
            </p>
          </li>
        </ul>

        <p v-else-if="!isLoading && !errorMessage" class="text-center text-sm text-gray-500">
          No activity logs to display.
        </p>

        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
