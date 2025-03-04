import { boardSchema, type BoardPublic } from '@server/entities/board'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardRepository } from '@server/repositories/boardRepository'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'
import { cacheMiddleware } from '@server/middleware'

export default authenticatedProcedure
  .use(provideRepos({ boardRepository }))
  .input(
    boardSchema.pick({
      id: true,
      title: true,
    })
  )
  .use(
    cacheMiddleware({
      key: ({ ctx }) =>
        `boards-allowed:${ctx.authUser.id}:user:${ctx.authUser.id}:limit:10:offset:0`,
      ttl: 0,
      invalidate: true,
    })
  )
  .mutation(
    async ({ input, ctx: { repos, authUser } }): Promise<BoardPublic> => {
      const { id, ...newData } = input

      const board = await repos.boardRepository.findById(id)
      if (!board) {
        throw new NotFoundError('Board not found')
      }

      if (board.userId !== authUser.id) {
        throw new ForbiddenError('You are not authorized to update this board')
      }

      const updatedBoard = await repos.boardRepository.update(id, newData)
      return updatedBoard
    }
  )
