<script lang="ts" setup>
import { ref, defineEmits, defineProps, onMounted, onBeforeUnmount } from 'vue'
import type { ListPublic } from '@server/shared/types'
import ChangeNameSection from './UpdateList.vue'
import DeleteList from './DeleteList.vue'

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'change-name', newName: string): void
  (e: 'delete-list'): void
}>()

const props = defineProps<{
  list: ListPublic
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const deleteListRef = ref<InstanceType<typeof DeleteList> | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const onDeleteList = () => {
  if (deleteListRef.value) {
    deleteListRef.value.open()
  }
  closeDropdown()
}

const changeName = (newName: string) => {
  emit('change-name', newName)
  closeDropdown()
}
</script>

<template>
  <div class="text-white focus:outline-none" ref="dropdownRef">
    <button class="text-white focus:outline-none" @click="toggleDropdown">
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
    <div v-if="isOpen" class="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-white shadow-lg">
      <ChangeNameSection
        :list="props.list"
        @change-name="changeName"
        @open-dialog="closeDropdown"
      />

      <button
        @click="onDeleteList"
        class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
      >
        Delete list
      </button>
    </div>

    <DeleteList ref="deleteListRef" :list="props.list" @delete-list="emit('delete-list')" />
  </div>
</template>
