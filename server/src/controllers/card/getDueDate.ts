import { cardSchema } from '@server/entities/card'
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
    cardSchema.pick({
      id: true,
    })
  )
  .query(async ({ input: { id }, ctx: { repos } }): Promise<Date | null> => {
    const cacheKey = `card:dueDate:${id}`

    try {
      const EXTEND_TTL_THRESHOLD = 4 * 60
      const cachedDueDate = await getCache<Date | null>(
        cacheKey,
        EXTEND_TTL_THRESHOLD
      )
      if (cachedDueDate) {
        return cachedDueDate
      }
    } catch (error) {
      logger.error('Error retrieving cache for key:', cacheKey, error)
    }

    const dueDate = await repos.cardRepository.getDueDate(id)

    try {
      const CACHE_TTL = 5 * 60
      await setCache(cacheKey, dueDate, CACHE_TTL)
    } catch (error) {
      logger.error('Error setting cache for key:', cacheKey, error)
    }

    return dueDate
  })
