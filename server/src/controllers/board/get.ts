import { idSchema } from '@server/entities/shared'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'
import { cacheMiddleware } from '@server/middleware'

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      boardMemberRepository,
    })
  )
  .input(idSchema)
  .use(async ({ ctx, next }) => {
    if (!ctx.authUser) {
      throw new Error('User must be authenticated to hit the cache layer')
    }
    return next()
  })
  .use(
    cacheMiddleware({
      key: ({ input, ctx }) => `board:${ctx.authUser.id}:${input}`,
      ttl: 60,
    })
  )
  .query(async ({ input: boardId, ctx: { repos, authUser } }) => {
    const board = await repos.boardRepository.findById(boardId)
    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const boardMembers =
      await repos.boardMemberRepository.getBoardMembers(boardId)
    const isBoardOwner = board.userId === authUser.id
    const isBoardMember = boardMembers.some(
      (member) => member.userId === authUser.id
    )
    if (!isBoardOwner && !isBoardMember) {
      throw new ForbiddenError('Not authorized to view this board')
    }

    const selectedBackground =
      await repos.boardRepository.findSelectedBackground(boardId)
    const boardData = {
      ...board,
      selectedBackground: selectedBackground?.selectedBackground ?? null,
    }

    return boardData
  })
