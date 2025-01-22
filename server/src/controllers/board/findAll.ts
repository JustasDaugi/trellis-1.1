import { boardRepository } from '@server/repositories/boardRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { boardSchema } from '@server/entities/board'

export default publicProcedure
  .use(
    provideRepos({
      boardRepository,
    })
  )
  .input(
    boardSchema.pick({
      userId: true,
    })
  )
  .query(async ({ input: { userId }, ctx: { repos } }) => {
    const boards = await repos.boardRepository.findAllByUserId(userId)

    return boards
  })
