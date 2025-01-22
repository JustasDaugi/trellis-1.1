<script lang="ts" setup>
import { ref, defineEmits, onMounted, onBeforeUnmount, defineExpose } from 'vue';
import ShareBoard from '@/components/BoardView/Board/ShareBoard.vue';
import type { BoardPublic } from '@server/shared/types';

const emit = defineEmits<{
  (e: 'toggle-dropdown'): void;
}>();

defineProps<{
  board: BoardPublic;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  emit('toggle-dropdown');
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

defineExpose({
  closeDropdown,
});
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
      <slot name="content"></slot>
      <ShareBoard :boardId="board.id" />
    </div>
  </div>
</template>
