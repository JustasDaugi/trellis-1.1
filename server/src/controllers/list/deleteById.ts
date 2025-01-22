import { listSchema, type ListPublic } from '@server/entities/list'
import { listRepository } from '@server/repositories/listRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import provideRepos from '@server/trpc/provideRepos'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      listRepository,
    })
  )
  .input(
    listSchema.pick({
      id: true,
    })
  )
  .mutation(
    async ({
      input: { id },
      ctx: { repos, authUser },
    }): Promise<ListPublic> => {
      const list = await repos.listRepository.findById(id)

      if (!list) {
        throw new NotFoundError('List not found')
      }

      if (list.userId !== authUser.id) {
        throw new ForbiddenError('You are not authorized to delete this list')
      }

      await repos.listRepository.delete(id)

      return list
    }
  )
