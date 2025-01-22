<script lang="ts" setup>
defineProps(['isSidebarOpen', 'loggedIn'])
defineEmits(['logout'])
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 -translate-x-full transform bg-gray-800 text-gray-300 transition-transform"
    :class="{ 'translate-x-0': isSidebarOpen }"
    @click.stop
  >
    <div class="p-4">
      <ul class="space-y-2">
        <li>
          <a href="/templates" class="flex items-center p-2 hover:bg-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="mr-3 h-5 w-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            Browse Templates
          </a>
        </li>
        <li v-if="loggedIn">
          <button
            @click.prevent="$emit('logout')"
            class="flex w-full items-center p-2 text-left hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="mr-3 h-5 w-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7"
              />
            </svg>
            Logout
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
aside {
  transition: transform 0.3s ease-in-out;
}
</style>
