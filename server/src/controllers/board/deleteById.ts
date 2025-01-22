import { boardSchema, type BoardPublic } from '@server/entities/board'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardRepository } from '@server/repositories/boardRepository'
import NotFoundError from "@server/utils/errors/NotFound";
import ForbiddenError from "@server/utils/errors/Forbidden";

export default authenticatedProcedure
  .use(provideRepos({ boardRepository }))
  .input(
    boardSchema.pick({
      id: true,
    })
  )
  .mutation(
    async ({
      input: { id },
      ctx: { repos, authUser },
    }): Promise<BoardPublic> => {
      const board = await repos.boardRepository.findById(id)

      if (!board) {
        throw new NotFoundError(`Board not found`)
      }

      if (board.userId !== authUser.id) {
        throw new ForbiddenError('You are not authorized to delete this board')
      }

      await repos.boardRepository.delete(id)

      return board
    }
  )
