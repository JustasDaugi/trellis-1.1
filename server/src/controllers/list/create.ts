import { listSchema, type ListPublic } from '@server/entities/list'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { publicProcedure } from '@server/trpc'
import NotFoundError from '@server/utils/errors/NotFound'

export default publicProcedure
  .use(
    provideRepos({
      boardRepository,
      listRepository,
    })
  )
  .input(
    listSchema.pick({
      boardId: true,
      title: true,
      userId: true,
    })
  )
  .mutation(async ({ input: list, ctx: { repos } }): Promise<ListPublic> => {
    const board = await repos.boardRepository.findById(list.boardId)

    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const newList = await repos.listRepository.create(list)

    return newList
  })
