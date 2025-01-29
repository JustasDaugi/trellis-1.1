<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date(),
  },
})

const emit = defineEmits(['update:modelValue'])

const localDate = ref(props.modelValue.toISOString().split('T')[0])

watch(localDate, (newDate) => {
  const updatedDate = new Date(newDate)
  emit('update:modelValue', updatedDate)
})

watch(
  () => props.modelValue,
  (newValue) => {
    localDate.value = newValue.toISOString().split('T')[0]
  }
)
</script>

<template>
  <form class="mx-auto max-w-[12rem]">
    <label for="date" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
      Select Date:
    </label>
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
        <svg
          class="h-5 w-5 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h8M8 11h8m-6 4h6m-6-7V5m0 0h6m-6 0v2a2 2 0 012 2m-2-2V3"
          />
        </svg>
      </div>
      <input
        type="date"
        id="date"
        v-model="localDate"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        required
      />
    </div>
  </form>
</template>
