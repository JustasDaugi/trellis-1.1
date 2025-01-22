<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, onBeforeMount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import AddListButton from '../components/BoardView/AddListButton.vue'
import ListDropdown from '../components/BoardView/List/ListDropdown.vue'
import BoardDropdown from '../components/BoardView/Board/BoardDropdown.vue'
import AddCard from '../components/AddCard.vue'
import CardActions from '../components/BoardView/Card/CardActions.vue'
import { useBackgroundImage } from '@/utils/fetchImage'
import type { ListPublic, BoardPublic, CardPublic } from '@server/shared/types'

type ListCards = ListPublic & {
  cards: CardPublic[]
}

const route = useRoute()
const router = useRouter()
const board = ref<BoardPublic | null>(null)
const lists = ref<ListCards[]>([])
const selectedCard = ref<CardPublic | null>(null)
const showDialog = ref(false)

const boardId = Number(route.params.id)

onBeforeMount(async () => {
  try {
    const boardFound = await trpc.board.get.query(boardId)
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
    const fetchedLists = await trpc.list.find.mutate({ boardId })
    const listsWithCards: ListCards[] = fetchedLists.map((list: ListPublic) => ({
      ...list,
      cards: [],
    }))
    await Promise.all(
      listsWithCards.map(async (list) => {
        try {
          const fetchedCards: CardPublic[] = await trpc.card.find.mutate({ listId: list.id })
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

const renderList = (newList: ListPublic) => {
  lists.value.push({ ...newList, cards: [] })
}

function navigateToMainView() {
  router.push({ name: 'MainView' })
}

const { backgroundImageUrl } = useBackgroundImage(board)

const createCard = (listId: number, card: CardPublic) => {
  const list = lists.value.find((lst) => lst.id === listId)
  if (list) {
    list.cards.push(card)
  } else {
    console.error(`List with ID ${listId} not found`)
  }
}

const openCardDialog = (card: CardPublic) => {
  selectedCard.value = null
  nextTick(() => {
    selectedCard.value = card
    showDialog.value = true
  })
}

const closeCardDialog = () => {
  selectedCard.value = null
  showDialog.value = false
}

const handleCardUpdate = async () => {
  await fetchLists()
}

const handleCardDelete = async () => {
  await fetchLists()
  closeCardDialog()
}

const onCardDragEnd = async (evt: any, targetListId: number) => {
  const { item } = evt
  const card = item as CardPublic

  if (card.listId !== targetListId) {
    try {
      const updatedCard = await trpc.card.update.mutate({
        id: card.id,
        listId: targetListId,
      })

      console.log(`Card updated successfully:`, updatedCard)

      fetchLists()
    } catch (error) {
      console.error('Error updating card listId:', error)
    }
  }
}
</script>

<template>
  <div
    v-if="board"
    :style="{
      backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
    class="relative min-h-screen"
  >
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
        <BoardDropdown
          v-if="board"
          :board="board"
          @change-name="
            (newName) => {
              if (board) board.title = newName
            }
          "
          @delete-board="navigateToMainView"
        />
      </div>
      <main class="mt-8 p-6">
        <div
          class="fixed-spacing grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <div
            v-for="list in lists"
            :key="list.id"
            class="relative flex max-w-[20rem] flex-col rounded-lg bg-black p-4 text-base font-medium text-blue-400 shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 class="mb-2 truncate text-lg font-semibold text-blue-400 hover:text-blue-300">
              {{ list.title }}
            </h2>
            <ListDropdown
              class="absolute right-4 top-4 text-white focus:outline-none"
              :list="list"
              :board="board"
              @change-name="(newName) => (list.title = newName)"
              @delete-list="fetchLists"
            />
            <draggable
              v-model="list.cards"
              group="cards"
              :animation="200"
              item-key="id"
              @end="(evt) => onCardDragEnd(evt, list.id)"
            >
              <template #item="{ element }">
                <div
                  class="mb-2 w-full cursor-pointer rounded bg-white p-2 text-black hover:bg-gray-100"
                  @click="openCardDialog(element)"
                >
                  <h3 class="text-sm font-semibold">{{ element.title }}</h3>
                  <p v-if="element.description" class="text-xs">{{ element.description }}</p>
                </div>
              </template>
            </draggable>
            <AddCard :listId="list.id" @card-created="(card) => createCard(list.id, card)" />
          </div>

          <AddListButton @list-created="renderList" />
        </div>
      </main>
    </div>
    <CardActions
      v-if="selectedCard"
      :card="selectedCard"
      @update-card="handleCardUpdate"
      @delete-card="handleCardDelete"
    />
  </div>
</template>

<style scoped>
.fixed-spacing {
  gap: 1rem !important;
}
</style>
