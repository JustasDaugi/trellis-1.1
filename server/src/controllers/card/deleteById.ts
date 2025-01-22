import { cardSchema, type CardPublic } from '@server/entities/card'
import { cardRepository } from '@server/repositories/cardRepository'
import { listRepository } from '@server/repositories/listRepository'
import provideRepos from '@server/trpc/provideRepos'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      listRepository,
      cardRepository,
    })
  )
  .input(
    cardSchema.pick({
      id: true,
    })
  )
  .mutation(
    async ({
      input: { id },
      ctx: { repos, authUser },
    }): Promise<CardPublic> => {
      const card = await repos.cardRepository.findById(id)

      if (!card) {
        throw new NotFoundError('Card not found')
      }
      if (card.userId !== authUser.id) {
        throw new ForbiddenError('You are not authorized to delete this card')
      }

      await repos.cardRepository.delete(id)

      return card
    }
  )