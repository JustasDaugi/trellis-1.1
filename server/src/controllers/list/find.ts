import { listSchema, type ListPublic } from '@server/entities/list'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { publicProcedure } from '@server/trpc'
import { getCache, setCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

export default publicProcedure
  .use(
    provideRepos({
      listRepository,
    })
  )
  .input(
    listSchema.pick({
      boardId: true,
    })
  )
  .mutation(
    async ({ input: { boardId }, ctx: { repos } }): Promise<ListPublic[]> => {
      const cacheKey = `lists:board:${boardId}`

      try {
        const EXTEND_TTL_THRESHOLD = 4 * 60
        const cachedLists = await getCache<ListPublic[]>(
          cacheKey,
          EXTEND_TTL_THRESHOLD
        )
        if (cachedLists && Array.isArray(cachedLists)) {
          return cachedLists
        }
      } catch (error) {
        logger.error('Error retrieving cache for key:', cacheKey, error)
      }

      const lists = await repos.listRepository.findByBoardId(boardId)

      try {
        const CACHE_TTL = 5 * 60
        await setCache(cacheKey, lists, CACHE_TTL)
      } catch (error) {
        logger.error('Error setting cache for key:', cacheKey, error)
      }

      return lists
    }
  )
