<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isSearchOpen = ref(false)

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
}

const closeSearch = () => {
  isSearchOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeSearch)
})

onUnmounted(() => {
  document.removeEventListener('click', closeSearch)
})
</script>

<template>
  <div class="relative flex items-center space-x-4" @click.stop>
    <span class="text-sm text-gray-400">Quick find</span>
    <button @click.stop="toggleSearch" class="p-2 focus:outline-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        class="h-6 w-6 text-gray-400"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-4.35-4.35M15 11a6 6 0 11-12 0 6 6 0 0112 0z"
        />
      </svg>
    </button>
    <div
      class="absolute left-16 top-0 flex h-10 items-center rounded-lg border border-gray-600 bg-gray-800 text-gray-300 shadow-md transition-all duration-300"
      :class="{ 'w-64 px-4': isSearchOpen, 'w-0 px-0': !isSearchOpen }"
    >
      <input
        v-if="isSearchOpen"
        type="text"
        placeholder="Search boards"
        class="focus:ring-orchid-500 w-full bg-transparent text-sm text-white outline-none focus:ring-2"
      />
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition: all 0.3s ease-in-out;
}
</style>
