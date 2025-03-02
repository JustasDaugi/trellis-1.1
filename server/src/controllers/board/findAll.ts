import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardSchema } from '@server/entities/board'
import { z } from 'zod'
import { cacheMiddleware } from '@server/middleware'

type BoardFindAllInput = {
  userId: number
  limit: number
  offset: number
}

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      boardMemberRepository,
    })
  )
  .input(
    boardSchema.pick({ userId: true }).extend({
      limit: z.number().int().positive().default(10),
      offset: z.number().int().nonnegative().default(0),
    })
  )
  .use(
    cacheMiddleware({
      key: ({ input, ctx }) => {
        const typedInput = input as BoardFindAllInput
        return `boards-allowed:${ctx.authUser.id}:user:${typedInput.userId}:limit:${typedInput.limit}:offset:${typedInput.offset}`
      },
      ttl: 5 * 60,
    })
  )
  .query(
    async ({ input: { userId, limit, offset }, ctx: { repos, authUser } }) => {
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
      return allowedBoards
    }
  )
