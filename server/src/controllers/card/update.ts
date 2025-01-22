import { cardSchema, type CardPublic } from '@server/entities/card'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { listRepository } from '@server/repositories/listRepository'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(provideRepos({ listRepository, cardRepository }))
  .input(
    cardSchema
      .pick({
        id: true,
        title: true,
        listId: true,
        description: true
      })
      .partial({ listId: true, title: true, description: true })
  )
  .mutation(
    async ({ input, ctx: { repos, authUser } }): Promise<CardPublic> => {
      const { id, ...newData } = input

      const card = await repos.cardRepository.findById(id)
      if (!card) {
        throw new NotFoundError('Card not found')
      }

      if (card.userId !== authUser.id) {
        throw new ForbiddenError('You are not authorized to update this card')
      }

      const updatedCard = await repos.cardRepository.update(id, newData)
      return updatedCard
    }
  )
