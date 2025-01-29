import { cardSchema } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { cardRepository } from '@server/repositories/cardRepository'
import { publicProcedure } from '@server/trpc'
import NotFoundError from '@server/utils/errors/NotFound'

export default publicProcedure
  .use(
    provideRepos({
      listRepository,
      cardRepository,
    })
  )
  .input(
    cardSchema.pick({
      id: true,
      dueDate: true,
    })
  )
  .mutation(async ({ input, ctx: { repos } }) => {
    const { id: cardId, dueDate } = input

    const card = await repos.cardRepository.findById(cardId)

    if (!card) {
      throw new NotFoundError('Card not found')
    }

    const updatedCard = await repos.cardRepository.addDueDate(cardId, dueDate)

    return updatedCard
  })
