<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, onBeforeMount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import { authUserId } from '@/stores/user'
import AddListButton from '../components/BoardView/AddListButton.vue'
import ListDropdown from '../components/BoardView/List/ListDropdown.vue'
import BoardDropdown from '../components/BoardView/Board/BoardDropdown.vue'
import AddCard from '../components/AddCard.vue'
import CardActions from '../components/BoardView/Card/CardActions.vue'
import { useBackgroundImage } from '@/utils/fetchImage'
import { fetchLists } from '@/utils/fetchLists'
import type { ListCards } from '@/utils/utils'
import type { CardPublic } from '@server/shared/types'
import {
  board,
  lists,
  handleListDelete,
  handleCardDelete,
  logActivity,
  createCard,
  renderList,
} from '@/utils/utils'

export type UpdateCardPayload = {
  updatedField: string
  previousValue: any
  newValue: any
  previousDueDate?: string | null
  newDueDate?: string | null
}

const route = useRoute()
const router = useRouter()
const boardId = Number(route.params.id)

const userId = ref<number | null>(authUserId.value)
const userFirstName = ref<string | null>(null)

const cardDueDates = ref<Record<number, string | null>>({})

const isLoading = ref(true)

function augmentListsData(listsData: any[]): any[] {
  return listsData.map((list) => ({
    ...list,
    createdAt: list.createdAt || new Date(),
    updatedAt: list.updatedAt || new Date(),
    userId: list.userId ?? 0,
    cards: (list.cards || []).map((card: any) => ({
      ...card,
      createdAt: card.createdAt || new Date(),
      updatedAt: card.updatedAt || new Date(),
      userId: card.userId ?? 0,
      description: card.description ?? null,
      dueDate: card.dueDate ?? null,
    })),
  }))
}

onBeforeMount(async () => {
  try {
    const boardFound = await trpc.board.get.query({
      id: boardId,
      title: board.value?.title,
    })

    if (boardFound) {
      board.value = boardFound
    } else {
      console.error('Board not found')
    }

    if (userId.value !== null) {
      const user = await trpc.user.findById.query({ id: userId.value })
      userFirstName.value = user?.firstName || null

      const fetchedListsData = await fetchLists(boardId)
      const augmentedLists = augmentListsData(fetchedListsData)

      lists.value.splice(0, lists.value.length, ...augmentedLists)
    } else {
      console.error('User ID is not available.')
    }
  } catch (error) {
    console.error('Error initializing BoardView:', error)
  } finally {
    isLoading.value = false
  }
})

const selectedCard = ref<CardPublic | null>(null)
const showDialog = ref(false)

const handleUpdateCard = ({
  updatedField,
  previousValue,
  newValue,
  previousDueDate,
  newDueDate,
}: UpdateCardPayload) => {
  if (selectedCard.value && selectedCard.value.id && selectedCard.value.listId) {
    handleCardUpdate(
      selectedCard.value.id,
      selectedCard.value.listId,
      updatedField,
      previousValue,
      newValue,
      previousDueDate,
      newDueDate
    )
  } else {
    console.error('selectedCard is null or its properties are missing.')
  }
}

const handleCardUpdate = async (
  cardId: number,
  listId: number,
  updatedField: string,
  previousValue: any,
  newValue: any,
  previousDueDate?: string | null,
  newDueDate?: string | null
) => {
  try {
    const list = lists.value.find((lst) => lst.id === listId)
    if (list) {
      const card = list.cards.find((c) => c.id === cardId)
      if (card) {
        ;(card as any)[updatedField] = newValue

        if (updatedField === 'dueDate') {
          renderDueDate(cardId, newDueDate ?? null)
        }
      }
    }

    if (userId.value !== null) {
      logActivity(
        cardId,
        listId,
        userId.value,
        'updated',
        'card',
        undefined,
        updatedField,
        previousValue,
        newValue,
        previousDueDate,
        newDueDate
      ).catch((error) => console.error('Error logging activity:', error))
    }
  } catch (error) {
    console.error('Error handling card update:', error)
  }
}

const renderDueDate = (cardId: number, dueDate: string | null) => {
  cardDueDates.value[cardId] = dueDate ? new Date(dueDate).toLocaleString() : null
}

function navigateToMainView() {
  router.push({ name: 'MainView' })
}

const { backgroundImageUrl } = useBackgroundImage(board)

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

const handleListTitleUpdate = async (listId: number, newTitle: string) => {
  try {
    const list = lists.value.find((lst) => lst.id === listId)
    if (list) {
      const previousTitle = list.title
      list.title = newTitle

      if (userId.value !== null) {
        logActivity(
          undefined,
          listId,
          userId.value,
          'updated',
          'list',
          newTitle,
          'title',
          previousTitle,
          newTitle
        ).catch((error) => console.error('Error logging list title update:', error))
      }
    } else {
      console.error(`List with ID ${listId} not found.`)
    }
  } catch (error) {
    console.error('Error updating list title:', error)
  }
}
</script>

<template>
  <div v-if="isLoading" class="flex h-screen w-full items-center justify-center">
    <svg
      class="mr-3 h-12 w-12 animate-spin text-gray-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <span class="text-xl text-white">Loading board...</span>
  </div>

  <div
    v-else-if="board"
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
          v-if="board && userId"
          :board="board"
          :userId="userId"
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
              @change-name="(newName) => handleListTitleUpdate(list.id, newName)"
              @delete-list="() => handleListDelete(list.id)"
            />
            <draggable v-model="list.cards" group="cards" :animation="200" item-key="id">
              <template #item="{ element }">
                <div
                  class="mb-2 w-full cursor-pointer rounded bg-white p-2 text-black hover:bg-gray-100"
                  @click="openCardDialog(element)"
                >
                  <h3 class="text-sm font-semibold">{{ element.title }}</h3>
                  <p v-if="element.description" class="text-xs">{{ element.description }}</p>
                  <p v-if="element.dueDate" class="mt-1 text-xs text-gray-500">
                    Due: {{ new Date(element.dueDate).toLocaleString() }}
                  </p>
                  <p v-if="cardDueDates[element.id]" class="mt-1 text-xs text-gray-500"></p>
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
      @update-card="handleUpdateCard"
      @delete-card="
        () => {
          if (selectedCard && selectedCard.id && selectedCard.listId) {
            handleCardDelete(selectedCard.id, selectedCard.listId)
            closeCardDialog()
          }
        }
      "
    />
  </div>
</template>
