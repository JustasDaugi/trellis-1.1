<script setup lang="ts">
import { ref, onBeforeMount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import CopyBoard from '../components/TemplateView/CopyBoard.vue'
import type {
  ListTemplatePublic,
  BoardTemplatePublic,
  CardTemplatePublic,
} from '@server/shared/types'

type ListCardsTemplate = ListTemplatePublic & {
  cards: CardTemplatePublic[]
}

const route = useRoute()
const router = useRouter()
const board = ref<BoardTemplatePublic | null>(null)
const lists = ref<ListCardsTemplate[]>([])
const selectedCard = ref<CardTemplatePublic | null>(null)

const boardId = Number(route.params.id)

onBeforeMount(async () => {
  try {
    const boardFound = await trpc.template.get.query(boardId)
    if (boardFound) {
      board.value = boardFound
    } else {
      console.error('Board not found')
    }
    await fetchLists()
  } catch (error) {
    console.error('Error fetching board or lists:', error)
  }
})

const fetchLists = async () => {
  try {
    const fetchedLists = await trpc.template.getLists.query({ boardId })
    const listsWithCards: ListCardsTemplate[] = fetchedLists.map((list: ListTemplatePublic) => ({
      ...list,
      cards: [],
    }))
    await Promise.all(
      listsWithCards.map(async (list) => {
        try {
          const fetchedCards = await trpc.template.getCards.query({ listId: list.id })
          list.cards = fetchedCards
        } catch (error) {
          console.error(`Error fetching cards for list ${list.id}:`, error)
        }
      })
    )
    lists.value = listsWithCards
  } catch (error) {
    console.error('Error fetching lists:', error)
  }
}

function navigateToMainView() {
  router.push({ name: 'MainView' })
}

const openCardDialog = (card: CardTemplatePublic) => {
  selectedCard.value = null
  nextTick(() => {
    selectedCard.value = card
  })
}
</script>

<template>
  <div v-if="board" class="relative min-h-screen">
    <div class="absolute inset-0 bg-black opacity-50"></div>

    <div class="relative z-10">
      <div class="relative flex items-center justify-between bg-transparent p-4">
        <div class="flex items-center">
          <button class="text-white" @click="navigateToMainView">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="ml-4 text-white">{{ board.title }}</h1>
        </div>
      </div>
      <main class="mt-8 p-6">
        <div
          class="fixed-spacing grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <div
            v-for="list in lists"
            :key="list.id"
            class="relative flex max-w-[20rem] flex-col rounded-lg bg-black bg-opacity-25 p-4 text-white shadow-md"
          >
            <h2 class="mb-2 truncate text-lg font-semibold text-white hover:text-blue-300">
              {{ list.title }}
            </h2>
            <div
              v-for="card in list.cards"
              :key="card.id"
              class="mb-2 w-full cursor-pointer rounded bg-white p-2 text-black hover:bg-gray-100"
              @click="openCardDialog(card)"
            >
              <h3 class="text-sm font-semibold">{{ card.title }}</h3>
              <p class="text-xs">{{ card.description }}</p>
            </div>
          </div>
        </div>
        <CopyBoard />
      </main>
    </div>
  </div>
</template>
