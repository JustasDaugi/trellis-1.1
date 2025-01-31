import { ref } from 'vue'
import { trpc } from '@/trpc'
import type { ListPublic, CardPublic } from '@server/shared/types'

type ListCards = ListPublic & {
  cards: CardPublic[]
}

const cardDueDates = ref<Record<number, string | null>>({})

export const fetchLists = async (boardId: number, lists: ListCards[]) => {
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

          await Promise.all(
            fetchedCards.map(async (card) => {
              const dueDate = await trpc.card.getDueDate.query({ id: card.id })
              cardDueDates.value[card.id] = dueDate ? new Date(dueDate).toLocaleString() : null
            })
          )
        } catch (error) {
          console.error(`Error fetching cards for list ${list.id}:`, error)
        }
      })
    )
    lists.splice(0, lists.length, ...listsWithCards)
  } catch (error) {
    console.error('Error fetching lists:', error)
  }
}

export { cardDueDates }
