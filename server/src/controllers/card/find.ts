import { cardSchema, type CardPublic } from '@server/entities/card'
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
      listId: true,
      description: true
    }).partial({ description: true})
  )
  .mutation(
    async ({ input: { listId }, ctx: { repos } }): Promise<CardPublic[]> => {
      const cards = await repos.cardRepository.findByListId(listId)

      return cards
    }
  )
