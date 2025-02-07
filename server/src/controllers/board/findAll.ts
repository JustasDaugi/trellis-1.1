import { boardRepository } from '@server/repositories/boardRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { boardSchema } from '@server/entities/board'
import { z } from 'zod'

export default publicProcedure
  .use(
    provideRepos({
      boardRepository,
    })
  )
  .input(
    boardSchema.pick({
      userId: true,
    }).extend({
      limit: z.number().int().positive().default(10),
      offset: z.number().int().nonnegative().default(0)
    })
  )
  .query(async ({ input: { userId, limit, offset }, ctx: { repos } }) => {
    const boards = await repos.boardRepository.findAllByUserId(userId, limit, offset)

    return boards
  })
