import { z } from 'zod'
import { listSchema } from '@server/entities/list'
import { cardSchema } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { cardRepository } from '@server/repositories/cardRepository'
import { publicProcedure } from '@server/trpc'
import { getCache, setCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

const cardPublicSchema = cardSchema.pick({
  id: true,
  listId: true,
  order: true,
  title: true,
  dueDate: true,
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
  .mutation(async ({ input: { boardId }, ctx: { repos } }) => {
    const cacheKey = `board:fetchData:${boardId}`

    try {
      const EXTEND_TTL_THRESHOLD = 4 * 60
      const cachedData = await getCache<z.infer<typeof boardDataSchema>>(
        cacheKey,
        EXTEND_TTL_THRESHOLD
      )
      if (cachedData) {
        return cachedData
      }
    } catch (error) {
      logger.error('Error retrieving cache for key:', cacheKey, error)
    }

    try {
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

      try {
        const CACHE_TTL = 5 * 60
        await setCache(cacheKey, fullBoardData, CACHE_TTL)
      } catch (cacheError) {
        logger.error('Error setting cache for key:', cacheKey, cacheError)
      }

      return fullBoardData
    } catch (dbError) {
      logger.error('Error building board data for boardId:', boardId, dbError)
      return boardDataSchema.parse({ lists: [] })
    }
  })
