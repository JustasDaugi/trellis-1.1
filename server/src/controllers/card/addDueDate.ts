import { cardSchema } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { cardRepository } from '@server/repositories/cardRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      listRepository,
      boardRepository,
      cardRepository,
    })
  )
  .input(
    cardSchema.pick({
      id: true,
      dueDate: true,
    })
  )
  .mutation(async ({ input, ctx: { repos, authUser } }) => {
    const { id: cardId, dueDate } = input

    const card = await repos.cardRepository.findById(cardId)
    if (!card) {
      throw new NotFoundError('Card not found')
    }
    const list = await repos.listRepository.findById(card.listId)
    if (!list) {
      throw new NotFoundError(`List with id ${card.listId} not found`)
    }
    const board = await repos.boardRepository.findById(list.boardId)
    if (!board) {
      throw new NotFoundError(`Board with id ${list.boardId} not found`)
    }
    if (board.userId !== authUser.id) {
      throw new ForbiddenError(
        'Only the board owner is authorized to add a due date'
      )
    }

    const updatedCard = await repos.cardRepository.addDueDate(cardId, dueDate)
    return updatedCard
  })
