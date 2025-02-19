<script lang="ts" setup>
import { ref, onMounted, defineEmits } from 'vue'
import { trpc } from '@/trpc'
import RemoveMembers from './RemoveMembers.vue'
import { authUserId } from '@/stores/user'

const props = defineProps<{
  boardId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

interface BoardMember {
  userId: number
  firstName: string
  lastName: string
  email: string
}

const boardMembers = ref<BoardMember[]>([])
const boardOwnerId = ref<number | null>(null)

const fetchBoardMembers = async () => {
  try {
    const members = await trpc.board.getBoardMembers.query({ boardId: props.boardId })

    boardMembers.value = members.filter((member): member is BoardMember => member !== null)

    const ownerResponse = await trpc.board.getBoardOwner.query(props.boardId)
    boardOwnerId.value = ownerResponse.boardOwnerId
  } catch (error) {
    console.error('Failed to fetch board members:', error)
  }
}

const refreshMembers = async () => {
  await fetchBoardMembers()
}

onMounted(fetchBoardMembers)
</script>

<template>
  <div
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-800 bg-opacity-75"
    @click.self="emit('close')"
  >
    <div class="relative z-[1001] w-96 rounded-lg bg-white p-6 shadow-lg">
      <h2 class="mb-4 text-xl font-bold text-black">Board Members</h2>
      <div v-if="boardMembers.length" class="mb-4">
        <ul class="divide-y divide-gray-300">
          <li
            v-for="member in boardMembers"
            :key="member.userId"
            class="flex items-center justify-between py-2 text-sm text-gray-800"
          >
            <div>
              <span class="font-semibold">{{ member.firstName }} {{ member.lastName }}</span>
              <span class="block text-xs text-gray-500">{{ member.email }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="{
                  'bg-green-200 text-green-800': member.userId === boardOwnerId,
                  'bg-gray-200 text-gray-700': member.userId !== boardOwnerId,
                }"
              >
                {{ member.userId === boardOwnerId ? 'Owner' : 'Member' }}
              </span>

              <RemoveMembers
                :boardId="props.boardId"
                :userId="member.userId"
                :isOwner="member.userId === boardOwnerId"
                :loggedInUserId="authUserId ?? 0"
                @member-removed="refreshMembers"
                class="ml-2"
              />
            </div>
          </li>
        </ul>
      </div>
      <p v-else class="text-sm text-gray-500">No board members found.</p>
      <div class="mt-4 flex justify-end">
        <button
          class="mr-2 rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
