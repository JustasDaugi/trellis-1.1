import { idSchema } from '@server/entities/shared'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'
import { setCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

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

    const cacheKey = `board:${authUser.id}:${boardId}`
    try {
      await setCache(cacheKey, boardData, 60)
      logger.info(`Cache updated for key ${cacheKey}`)
    } catch (error) {
      logger.error(`Error setting cache for key ${cacheKey}:`, error)
    }

    return boardData
  })
