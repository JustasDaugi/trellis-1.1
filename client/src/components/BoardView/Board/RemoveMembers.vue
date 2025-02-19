<script lang="ts" setup>
import { ref, computed } from 'vue'
import { trpc } from '@/trpc'

const props = defineProps<{
  boardId: number
  userId: number
  isOwner: boolean
  loggedInUserId: number
}>()

const emit = defineEmits<{
  (e: 'member-removed'): void
}>()

const isLoading = ref(false)

const buttonLabel = computed(() => {
  return props.isOwner ? 'Remove' : 'Leave'
})

const removeMember = async () => {
  isLoading.value = true
  try {
    await trpc.board.removeBoardMembers.mutate({
      boardId: props.boardId,
      userId: props.userId,
    })
    emit('member-removed')
  } catch (error) {
    console.error('Failed to remove board member:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <button
    v-if="!isOwner"
    @click="removeMember"
    :disabled="isLoading"
    class="mr-2 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:bg-gray-400"
  >
    {{ buttonLabel }}
  </button>
</template>
