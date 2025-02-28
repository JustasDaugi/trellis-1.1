import { cardSchema } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { publicProcedure } from '@server/trpc'
import logger from '@server/utils/logger/logger'

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
    try {
      const dueDate = await repos.cardRepository.getDueDate(id)
      return dueDate
    } catch (error) {
      logger.error('Error retrieving due date for card:', id, error)
      throw error
    }
  })
