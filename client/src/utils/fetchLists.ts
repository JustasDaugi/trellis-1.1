import { ref } from 'vue'
import { trpc } from '@/trpc'
import type { ListPublic, CardPublic } from '@server/shared/types'

type ListCards = ListPublic & {
  cards: CardPublic[]
}

const inMemoryBoardLists = ref<Record<number, ListCards[]>>({})
const cardDueDates = ref<Record<number, string | null>>({})

/**
 * fetchLists
 *
 * If the lists for the given boardId are already cached in memory,
 * return them immediately. Otherwise, fetch them from the server,
 * populate our cache, and then return the data.
 */
export const fetchLists = async (boardId: number, lists: ListCards[]) => {
  const cached = inMemoryBoardLists.value[boardId]
  if (cached) {
    lists.splice(0, lists.length, ...cached)
    return
  }

  try {
    const fetchedLists = await trpc.list.find.mutate({ boardId })

    const listsWithCards: ListCards[] = await Promise.all(
      fetchedLists.map(async (list: ListPublic) => {
        const fetchedCards: CardPublic[] = await trpc.card.find.mutate({
          listId: list.id,
        })

        await Promise.all(
          fetchedCards.map(async (card) => {
            const dueDate = await trpc.card.getDueDate.query({ id: card.id })
            cardDueDates.value[card.id] = dueDate ? new Date(dueDate).toLocaleString() : null
          })
        )

        return {
          ...list,
          cards: fetchedCards,
        }
      })
    )

    inMemoryBoardLists.value[boardId] = listsWithCards

    lists.splice(0, lists.length, ...listsWithCards)
  } catch (error) {
    console.error('Error fetching lists:', error)
  }
}

export { cardDueDates }
