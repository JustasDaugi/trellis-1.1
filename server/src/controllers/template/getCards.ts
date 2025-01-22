import { templateRepository } from '@server/repositories/templateRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { cardTemplateSchema } from '@server/entities/template'

export default publicProcedure
  .use(
    provideRepos({
      templateRepository,
    })
  )
  .input(
    cardTemplateSchema.pick({
      listId: true,
    })
  )
  .query(async ({ input: { listId }, ctx: { repos } }) => {
    const listTemplates = await repos.templateRepository.findByListId(listId)
    return listTemplates
  })
