<script lang="ts" setup>
import AddList from './AddList.vue'

defineProps<{}>()

defineEmits<{
  (e: 'list-created', newList: any): void
}>()
</script>

<template>
  <AddList @list-created="$emit('list-created', $event)" />
</template>
