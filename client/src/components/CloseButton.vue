<template>
  <button
    type="button"
    class="absolute right-2 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
    @click="$emit('close')"
    aria-label="Close dialog"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
</template>

<script lang="ts" setup>
defineEmits(['close'])
</script>
