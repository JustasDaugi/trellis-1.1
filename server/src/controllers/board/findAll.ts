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
      const cachedBoards = await getCache(cacheKey)
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
      await setCache(cacheKey, boards, 60)
    } catch (error) {
      logger.error('error', `Error setting cache for key ${cacheKey}: ${error}`)
    }

    return boards
  })
