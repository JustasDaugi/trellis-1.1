<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/MainView/Sidebar.vue'
import CreateBoard from '../components/MainView/CreateBoard/CreateBoard.vue'
import SearchBoards from '../components/MainView/SearchBoards.vue'
import TemplateBoardCard from '../components/TemplateView/TemplateBoardCard.vue'
import { FwbButton } from 'flowbite-vue'
import { isLoggedIn, logout } from '@/stores/user'
import { trpc } from '@/trpc'
import type { Selectable } from 'kysely'
import type { BoardPublic } from '@server/shared/types'

const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const router = useRouter()
function logoutUser() {
  logout()
  router.push({ name: 'Login' })
}

const loggedIn = computed(() => isLoggedIn.value)

const templates = ref<Selectable<BoardPublic>[]>([])

const fetchTemplates = async () => {
  templates.value = await trpc.template.getBoards.query()
}

onMounted(fetchTemplates)
</script>

<template>
  <div class="relative min-h-screen" @click="closeSidebar">
    <header class="fixed left-0 top-0 z-50 w-full bg-gray-800 text-gray-300 shadow-md">
      <div class="flex w-full items-center justify-between px-4 py-3" @click.stop>
        <div class="flex items-center space-x-2">
          <FwbButton
            size="sm"
            variant="light"
            @click.stop="toggleSidebar"
            aria-label="Toggle sidebar"
            class="bg-gray-700 p-2 hover:bg-gray-600 focus:ring-gray-500"
          >
            <span class="mb-1 block h-0.5 w-6 bg-gray-400"></span>
            <span class="mb-1 block h-0.5 w-6 bg-gray-400"></span>
            <span class="block h-0.5 w-6 bg-gray-400"></span>
          </FwbButton>
          <span class="text-lg font-medium">Template Boards</span>
        </div>
        <SearchBoards />
      </div>
    </header>
    <Sidebar :isSidebarOpen="isSidebarOpen" :loggedIn="loggedIn" @logout="logoutUser" />
    <CreateBoard />
    <main class="mt-16 p-6">
      <h2 class="mb-6 text-xl font-bold">Template Boards</h2>
      <div
        v-if="templates.length"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <TemplateBoardCard
          v-for="template in templates"
          :key="template.id"
          :board="template"
          class="h-full"
        />
      </div>
      <div v-else class="text-center text-gray-500 dark:text-gray-400">No templates found!</div>
    </main>
  </div>
</template>
