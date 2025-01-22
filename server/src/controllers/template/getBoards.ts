import { templateRepository } from '@server/repositories/templateRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'

export default publicProcedure
  .use(
    provideRepos({
      templateRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const templates = await repos.templateRepository.findAll();
    return templates;
  });
