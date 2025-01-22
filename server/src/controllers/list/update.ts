import { listSchema, type ListPublic } from '@server/entities/list'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(provideRepos({ listRepository }))
  .input(
    listSchema.pick({
      id: true,
      title: true,
    })
  )
  .mutation(
    async ({ input, ctx: { repos, authUser } }): Promise<ListPublic> => {
      const { id, ...newData } = input

      const list = await repos.listRepository.findById(id)
      if (!list) {
        throw new NotFoundError('List not found')
      }

      if (list.userId !== authUser.id) {
        throw new ForbiddenError('You are not authorized to update this list')
      }

      const updatedList = await repos.listRepository.update(id, newData)
      return updatedList
    }
  )
