<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const s3BucketUrl = 'https://awsbucket012345.s3.eu-central-1.amazonaws.com'

const backgrounds = [
  {
    key: 'background-1.jpg',
    name: 'Background 1',
    url: `${s3BucketUrl}/background-1.jpg`,
  },
  {
    key: 'background-2.jpg',
    name: 'Background 2',
    url: `${s3BucketUrl}/background-2.jpg`,
  },
  {
    key: 'background-3.jpg',
    name: 'Background 3',
    url: `${s3BucketUrl}/background-3.jpg`,
  },
]

defineProps<{
  selectedBackground: string
}>()

const emit = defineEmits<{
  (e: 'selectBackground', background: string): void
}>()

function handleSelect(background: string) {
  emit('selectBackground', background)
}
</script>

<template>
  <div class="mb-4">
    <h3 class="mb-2 text-sm font-medium text-gray-700">Select Background</h3>
    <div class="flex space-x-2">
      <div v-for="bg in backgrounds" :key="bg.key" class="relative">
        <img
          :src="bg.url"
          :alt="bg.name"
          class="h-16 w-24 cursor-pointer rounded-lg border-2 object-cover"
          :class="{ 'border-orchid-500': selectedBackground === bg.url }"
          @click="handleSelect(bg.url)"
        />
        <svg
          v-if="selectedBackground === bg.url"
          class="absolute right-1 top-1 h-6 w-6 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 011.414 1.414l-7.364 7.364a1 1 0 01-1.414 0L6.293 11.707a1 1 0 011.414-1.414L10 12.586l5.293-5.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-orchid-500 {
  border-color: #9d4edd;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
