import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardSchema } from '@server/entities/board'
import { z } from 'zod'
import { getCache, setCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      boardMemberRepository,
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
  .query(
    async ({ input: { userId, limit, offset }, ctx: { repos, authUser } }) => {
      const cacheKey = `boards-allowed:${authUser.id}:user:${userId}:limit:${limit}:offset:${offset}`

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

      const allBoards = await repos.boardRepository.findAllByUserId(
        userId,
        limit,
        offset
      )

      const boardsCheckResults = await Promise.all(
        allBoards.map(async (board) => {
          const isOwner = board.userId === authUser.id
          const isMember = await repos.boardMemberRepository.isMemberOfBoard(
            board.id,
            authUser.id
          )
          return isOwner || isMember ? board : null
        })
      )

      const allowedBoards = boardsCheckResults.filter((b) => b !== null)
      try {
        const CACHE_TTL = 5 * 60
        await setCache(cacheKey, allowedBoards, CACHE_TTL)
      } catch (error) {
        logger.error(
          'error',
          `Error setting cache for key ${cacheKey}: ${error}`
        )
      }

      return allowedBoards
    }
  )
