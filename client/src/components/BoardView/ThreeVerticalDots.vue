<script lang="ts" setup>
defineProps<{}>()
</script>

<template>
  <button class="text-white focus:outline-none" @click="$emit('click')">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v.01M12 12v.01M12 18v.01" />
    </svg>
  </button>
</template>
