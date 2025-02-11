import { boardRepository } from '@server/repositories/boardRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { boardSchema } from '@server/entities/board'
import { z } from 'zod'
import { getCache, setCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

export default publicProcedure
  .use(
    provideRepos({
      boardRepository,
    })
  )
  .input(
    boardSchema
      .pick({
        userId: true,
      })
      .extend({
        limit: z.number().int().positive().default(10),
        offset: z.number().int().nonnegative().default(0),
      })
  )
  .query(async ({ input: { userId, limit, offset }, ctx: { repos } }) => {
    const cacheKey = `boards:${userId}:limit:${limit}:offset:${offset}`

    try {
      const EXTEND_TTL_THRESHOLD = 4 * 60
      const cachedBoards = await getCache(cacheKey, EXTEND_TTL_THRESHOLD)
      if (cachedBoards) {
        return cachedBoards
      }
    } catch (error) {
      logger.error(
        'error',
        `Error retrieving cache for key ${cacheKey}: ${error}`
      )
    }

    const boards = await repos.boardRepository.findAllByUserId(
      userId,
      limit,
      offset
    )

    try {
      const CACHE_TTL = 5 * 60
      await setCache(cacheKey, boards, CACHE_TTL)
    } catch (error) {
      logger.error('error', `Error setting cache for key ${cacheKey}: ${error}`)
    }

    return boards
  })
