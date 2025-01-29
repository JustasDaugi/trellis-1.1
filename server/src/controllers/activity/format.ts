import { activitySchema } from '@server/entities/activity'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { listRepository } from '@server/repositories/listRepository'
import { userRepository } from '@server/repositories/userRepository'
import { publicProcedure } from '@server/trpc'
import NotFoundError from '@server/utils/errors/NotFound'

export default publicProcedure
  .use(
    provideRepos({
      cardRepository,
      listRepository,
      userRepository,
    })
  )
  .input(
    activitySchema.pick({
      cardId: true,
      listId: true,
      boardId: true,
      userId: true,
    })
  )
  .query(
    async ({ input: { cardId, listId, boardId, userId }, ctx: { repos } }) => {
      const lists = await repos.listRepository.findByBoardId(boardId)
      const list = lists.find((list) => list.id === listId)
      if (!list) {
        throw new NotFoundError(
          `No list found for List ID ${listId} in Board ID ${boardId}.`
        )
      }

      const user = await repos.userRepository.findById(userId)
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found.`)
      }

      let card
      if (cardId) {
        const cards = await repos.cardRepository.findByListId(listId)
        card = cards.find((card) => card.id === cardId)
        if (!card) {
          throw new NotFoundError(
            `No card found for Card ID ${cardId} in List ID ${listId}.`
          )
        }
      }

      return {
        card: card ? { title: card.title } : null,
        list: {
          title: list.title,
        },
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }
    }
  )
