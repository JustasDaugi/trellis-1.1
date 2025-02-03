import { activitySchema } from '@server/entities/activity'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { listRepository } from '@server/repositories/listRepository'
import { userRepository } from '@server/repositories/userRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { publicProcedure } from '@server/trpc'
import NotFoundError from '@server/utils/errors/NotFound'

export default publicProcedure
  .use(
    provideRepos({
      cardRepository,
      listRepository,
      userRepository,
      boardRepository,
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
      const board = await repos.boardRepository.findById(boardId)
      if (!board) {
        throw new NotFoundError(`Board with ID ${boardId} not found.`)
      }

      const lists = await repos.listRepository.findByBoardId(boardId)
      const foundList = lists.find((l) => l.id === listId)
      if (!foundList) {
        throw new NotFoundError(
          `No list found for List ID ${listId} in Board ID ${boardId}.`
        )
      }

      const user = await repos.userRepository.findById(userId)
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found.`)
      }

      let foundCard = null
      if (cardId) {
        const cards = await repos.cardRepository.findByListId(listId)
        foundCard = cards.find((c) => c.id === cardId)
        if (!foundCard) {
          throw new NotFoundError(
            `No card found for Card ID ${cardId} in List ID ${listId}.`
          )
        }
      }

      return {
        card: foundCard ? { title: foundCard.title } : null,
        list: {
          title: foundList.title,
        },
        board: {
          title: board.title,
        },
        user: {
          firstName: user.firstName,
        },
      }
    }
  )
