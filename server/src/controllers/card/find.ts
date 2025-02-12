import { cardSchema, type CardPublic } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { publicProcedure } from '@server/trpc'
import { getCache, setCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

export default publicProcedure
  .use(
    provideRepos({
      cardRepository,
    })
  )
  .input(
    cardSchema
      .pick({
        listId: true,
        description: true,
      })
      .partial({ description: true })
  )
  .mutation(
    async ({ input: { listId }, ctx: { repos } }): Promise<CardPublic[]> => {
      const cacheKey = `cards:list:${listId}`

      try {
        const EXTEND_TTL_THRESHOLD = 4 * 60
        const cachedCards = await getCache<CardPublic[]>(
          cacheKey,
          EXTEND_TTL_THRESHOLD
        )
        if (cachedCards && Array.isArray(cachedCards)) {
          return cachedCards
        }
      } catch (error) {
        logger.error('Error retrieving cache for key:', cacheKey, error)
      }

      const cards = await repos.cardRepository.findByListId(listId)

      try {
        const CACHE_TTL = 5 * 60
        await setCache(cacheKey, cards, CACHE_TTL)
      } catch (error) {
        logger.error('Error setting cache for key:', cacheKey, error)
      }

      return cards
    }
  )
