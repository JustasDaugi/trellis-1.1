import { listSchema, type ListPublic } from '@server/entities/list'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { publicProcedure } from '@server/trpc'

export default publicProcedure
  .use(
    provideRepos({
      listRepository,
    })
  )
  .input(
    listSchema.pick({
      boardId: true,
    })
  )
  .mutation(
    async ({ input: { boardId }, ctx: { repos } }): Promise<ListPublic[]> => {
      const lists = await repos.listRepository.findByBoardId(boardId)

      return lists
    }
  )
