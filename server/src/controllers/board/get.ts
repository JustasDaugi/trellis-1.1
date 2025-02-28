import { idSchema } from '@server/entities/shared'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'
import { getCache, setCache } from '@server/service/redis'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      boardMemberRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: boardId, ctx: { repos, authUser } }) => {
    const cacheKey = `board:${boardId}`

    let cachedBoard
    try {
      cachedBoard = await getCache<any>(cacheKey)
      if (cachedBoard) {
        return cachedBoard
      }
    } catch (error) {
      console.error(`Error retrieving cache for key ${cacheKey}: ${error}`)
    }

    const board = await repos.boardRepository.findById(boardId)
    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const boardMembers = await repos.boardMemberRepository.getBoardMembers(boardId)

    const isBoardOwner = board.userId === authUser.id
    const isBoardMember = boardMembers.some(member => member.userId === authUser.id)

    if (!isBoardOwner && !isBoardMember) {
      throw new ForbiddenError('Not authorized to view this board')
    }

    const selectedBackground =
      await repos.boardRepository.findSelectedBackground(boardId)
    const boardData = {
      ...board,
      selectedBackground: selectedBackground?.selectedBackground ?? null,
    }

    try {
      await setCache(cacheKey, boardData, 60)
    } catch (error) {
      console.error(`Error setting cache for key ${cacheKey}: ${error}`)
    }

    return boardData
  })
