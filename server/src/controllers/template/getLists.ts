import { templateRepository } from '@server/repositories/templateRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { listTemplateSchema } from '@server/entities/template'

export default publicProcedure
  .use(
    provideRepos({
      templateRepository,
    })
  )
  .input(
    listTemplateSchema.pick({
      boardId: true,
    })
  )
  .query(async ({ input: { boardId }, ctx: { repos } }) => {
    const listTemplates = await repos.templateRepository.findByBoardId(boardId)
    return listTemplates
  })
