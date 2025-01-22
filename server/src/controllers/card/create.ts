import { cardSchema, type CardPublic } from '@server/entities/card'
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
    cardSchema
      .pick({
        listId: true,
        title: true,
        userId: true,
        description: true,
      })
      .partial({ description: true })
  )
  .mutation(async ({ input: card, ctx: { repos } }): Promise<CardPublic> => {
    const list = await repos.listRepository.findById(card.listId)

    if (!list) {
      throw new NotFoundError('Board not found')
    }

    const newCard = await repos.cardRepository.create(card)

    return newCard
  })
