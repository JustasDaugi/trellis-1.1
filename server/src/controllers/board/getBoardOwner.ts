import { idSchema } from '@server/entities/shared'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      boardMemberRepository,
      boardRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: boardId, ctx: { repos, authUser } }) => {
    const board = await repos.boardRepository.findById(boardId)
    if (!board) {
      throw new NotFoundError('not found')
    }

    const isOwner = board.userId === authUser.id
    const isMember = await repos.boardMemberRepository.isMemberOfBoard(
      boardId,
      authUser.id
    )
    if (!isOwner && !isMember) {
      throw new ForbiddenError(
        'Not authorized'
      )
    }

    const boardOwnerId =
      await repos.boardMemberRepository.getBoardOwner(boardId)
    if (!boardOwnerId) {
      throw new NotFoundError('Not found')
    }

    return {
      boardId,
      boardOwnerId,
    }
  })
