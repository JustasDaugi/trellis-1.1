import { boardSchema, type BoardPublic } from '@server/entities/board'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'
import { cacheMiddleware } from '@server/middleware'

const boardGetInput = boardSchema
  .pick({ id: true, title: true })
  .partial({ title: true })

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      boardMemberRepository,
    })
  )
  .input(boardGetInput)
  .use(async ({ ctx, next }) => {
    if (!ctx.authUser) {
      throw new Error('User must be authenticated to hit the cache layer')
    }
    return next()
  })
  .use(
    cacheMiddleware({
      key: ({ input, ctx }) => {
        const { id, title } = input as { id: number; title?: string }
        return `board:${ctx.authUser.id}:${id}:${title || ''}`
      },
      ttl: 60,
    })
  )
  .query(async ({ input, ctx: { repos, authUser } }) => {
    const { id } = input
    const board = await repos.boardRepository.findById(id)
    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const boardMembers = await repos.boardMemberRepository.getBoardMembers(id)
    const isBoardOwner = board.userId === authUser.id
    const isBoardMember = boardMembers.some(
      (member) => member.userId === authUser.id
    )
    if (!isBoardOwner && !isBoardMember) {
      throw new ForbiddenError('Not authorized to view this board')
    }

    const selectedBackground =
      await repos.boardRepository.findSelectedBackground(id)
    const boardData: BoardPublic = {
      ...board,
      selectedBackground: selectedBackground?.selectedBackground ?? null,
    }

    return boardData
  })
