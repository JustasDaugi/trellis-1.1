import { idSchema } from '@server/entities/shared'
import { templateRepository } from '@server/repositories/templateRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import NotFoundError from '@server/utils/errors/NotFound'

export default publicProcedure
  .use(
    provideRepos({
      templateRepository,
      boardRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: boardId, ctx: { repos } }) => {
    const board = await repos.templateRepository.findById(boardId)

    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const selectedBackground =
      await repos.boardRepository.findSelectedBackground(boardId)

    return {
      ...board,
      selectedBackground: selectedBackground?.selectedBackground ?? null,
    }
  })
