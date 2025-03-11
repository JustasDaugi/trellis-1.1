import { z } from 'zod'
import { listSchema } from '@server/entities/list'
import { cardSchema } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { cardRepository } from '@server/repositories/cardRepository'
import { publicProcedure } from '@server/trpc'

const cardPublicSchema = cardSchema
  .pick({
    id: true,
    order: true,
    title: true,
    dueDate: true,
  })
  .extend({
    listId: cardSchema.shape.listId.optional(),
  })

const listPublicSchema = listSchema
  .pick({
    id: true,
    title: true,
    order: true,
    boardId: true,
  })
  .extend({
    cards: z.array(cardPublicSchema),
  })

const boardDataSchema = z.object({
  lists: z.array(listPublicSchema),
})

export default publicProcedure
  .use(
    provideRepos({
      listRepository,
      cardRepository,
    })
  )
  .input(listSchema.pick({ boardId: true }))
  .query(async ({ input: { boardId }, ctx: { repos } }) => {
    const lists = await repos.listRepository.findByBoardId(boardId)

    const listsWithCards = await Promise.all(
      lists.map(async (list) => {
        const cards = await repos.cardRepository.findByListId(list.id)
        const cardsWithDueDate = await Promise.all(
          cards.map(async (card) => {
            const dueDate = await repos.cardRepository.getDueDate(card.id)
            return {
              ...card,
              dueDate,
            }
          })
        )
        return {
          ...list,
          cards: cardsWithDueDate,
        }
      })
    )

    const fullBoardData = boardDataSchema.parse({
      lists: listsWithCards,
    })

    return fullBoardData
  })
