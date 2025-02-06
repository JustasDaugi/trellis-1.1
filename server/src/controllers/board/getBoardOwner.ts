import { idSchema } from '@server/entities/shared'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'

export default publicProcedure
  .use(
    provideRepos({
      boardMemberRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: boardId, ctx: { repos } }) => {
    const boardOwnerId =
      await repos.boardMemberRepository.getBoardOwner(boardId)

    if (!boardOwnerId) {
      throw new NotFoundError('Board owner not found')
    }

    return {
      boardId,
      boardOwnerId,
    }
  })
