import { ref } from 'vue'
import { trpc } from '@/trpc'
import { authUserId } from '@/stores/user'
import type { ListPublic, CardPublic, BoardPublic } from '@server/shared/types'

type ListCards = ListPublic & {
  cards: CardPublic[]
}

export const lists = ref<ListCards[]>([])
const userId = ref<number | null>(authUserId.value)
export const board = ref<BoardPublic | null>(null)

export const handleListDelete = async (listId: number) => {
  try {
    lists.value = lists.value.filter((list) => list.id !== listId)
  } catch (error) {
    console.error('Error deleting list:', error)
  }
}

export const handleCardDelete = async (cardId: number, listId: number) => {
  try {
    const list = lists.value.find((list) => list.id === listId)
    if (list) {
      list.cards = list.cards.filter((card) => card.id !== cardId)
    }
  } catch (error) {
    console.error('Error deleting card:', error)
  }
}

export const logActivity = async (
  cardId: number | undefined,
  listId: number,
  userId: number,
  action: 'created' | 'updated' | 'deleted',
  entityType: 'card' | 'list',
  localTitle?: string,
  field?: string,
  previousValue?: any,
  newValue?: any,
  previousDueDate?: string | null,
  newDueDate?: string | null
) => {
  try {
    if (!board.value) {
      throw new Error('Board is not loaded yet.')
    }

    const activity = await trpc.activity.format.query({
      cardId: entityType === 'card' ? cardId : undefined,
      listId,
      boardId: board.value.id,
      userId,
    })

    await trpc.activity.log.mutate({
      cardId: cardId,
      listId,
      boardId: board.value.id,
      userId,
      action,
      entityType,
      localTitle: localTitle || activity.card?.title || activity.list?.title,
      field,
      previousValue,
      newValue,
      previousDueDate,
      newDueDate,
      description: '',
      id: '',
      timestamp: undefined,
    })
  } catch (error) {
    console.error(`Error logging activity for ${action} ${entityType}:`, error)
  }
}

export const createCard = (listId: number, card: CardPublic) => {
  const list = lists.value.find((lst) => lst.id === listId)
  if (list) {
    list.cards.push(card)
    if (userId.value !== null) {
      logActivity(card.id, listId, userId.value, 'created', 'card', card.title).catch((error) =>
        console.error('Error logging card creation:', error)
      )
    }
  } else {
    console.error(`List with ID ${listId} not found`)
  }
}

export const renderList = (newList: ListPublic) => {
  lists.value.push({ ...newList, cards: [] })
  if (userId.value !== null) {
    logActivity(undefined, newList.id, userId.value, 'created', 'list', newList.title).catch(
      (error) => console.error('Error logging list creation:', error)
    )
  }
}
