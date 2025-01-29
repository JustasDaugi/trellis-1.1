import { cardSchema } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { publicProcedure } from '@server/trpc'

export default publicProcedure
  .use(
    provideRepos({
      cardRepository,
    })
  )
  .input(
    cardSchema.pick({
      id: true,
    })
  )
  .query(async ({ input: { id }, ctx: { repos } }): Promise<Date | null> => {
    const startDate = await repos.cardRepository.getDueDate(id)

    return startDate
  })
