import { idSchema } from '@server/entities/shared'
import { boardRepository } from '@server/repositories/boardRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'
import { getCache, setCache } from '@server/service/redis'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
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
      // eslint-disable-next-line no-console
      console.error(`Error retrieving cache for key ${cacheKey}: ${error}`)
    }

    const board = await repos.boardRepository.findById(boardId)
    if (!board) {
      throw new NotFoundError('Board not found')
    }

    if (board.userId !== authUser.id)
      throw new ForbiddenError('Not authorized to view this board')

    const selectedBackground =
      await repos.boardRepository.findSelectedBackground(boardId)
    const boardData = {
      ...board,
      selectedBackground: selectedBackground?.selectedBackground ?? null,
    }

    try {
      await setCache(cacheKey, boardData, 60)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error setting cache for key ${cacheKey}: ${error}`)
    }

    return boardData
  })
