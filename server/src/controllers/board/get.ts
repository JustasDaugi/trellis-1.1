import { idSchema } from '@server/entities/shared'
import { boardRepository } from '@server/repositories/boardRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'
import { getCache, setCache } from '@server/service/redis'

export default publicProcedure
  .use(
    provideRepos({
      boardRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: boardId, ctx: { repos } }) => {
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
