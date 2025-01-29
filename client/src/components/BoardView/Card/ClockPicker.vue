<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date(),
  },
})

const emit = defineEmits(['update:modelValue'])

const timeString = computed(
  () =>
    `${props.modelValue.getHours().toString().padStart(2, '0')}:${props.modelValue.getMinutes().toString().padStart(2, '0')}`
)

const selectedTime = ref(timeString.value)

watch(selectedTime, (newTime) => {
  const [hours, minutes] = newTime.split(':').map(Number)
  const updatedTime = new Date(props.modelValue)
  updatedTime.setHours(hours, minutes, 0, 0)
  emit('update:modelValue', updatedTime)
})

watch(
  () => props.modelValue,
  (newValue) => {
    selectedTime.value = `${newValue.getHours().toString().padStart(2, '0')}:${newValue.getMinutes().toString().padStart(2, '0')}`
  }
)
</script>

<template>
  <form class="mx-auto max-w-[8rem]">
    <label for="time" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
      Select Time (24-hour format)
    </label>
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 end-0 top-0 flex items-center pe-3.5">
        <svg
          class="h-4 w-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <input
        type="time"
        id="time"
        v-model="selectedTime"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm leading-none text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        min="00:00"
        max="23:59"
        required
      />
    </div>
  </form>
</template>
