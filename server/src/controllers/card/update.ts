import { cardSchema, type CardPublic } from '@server/entities/card'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { listRepository } from '@server/repositories/listRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      listRepository,
      cardRepository,
      boardRepository,
      boardMemberRepository,
    })
  )
  .input(
    cardSchema
      .pick({
        id: true,
        title: true,
        listId: true,
        description: true,
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

      const list = await repos.listRepository.findById(card.listId)
      if (!list) {
        throw new NotFoundError(`List with id ${card.listId} not found.`)
      }

      const board = await repos.boardRepository.findById(list.boardId)
      if (!board) {
        throw new NotFoundError(`Board with id ${list.boardId} not found.`)
      }

      const isOwner = board.userId === authUser.id
      const isMember = await repos.boardMemberRepository.isMemberOfBoard(
        board.id,
        authUser.id
      )
      if (!isOwner && !isMember) {
        throw new ForbiddenError(
          'You are not authorized to update any cards on this board.'
        )
      }

      if (card.userId !== authUser.id) {
        throw new ForbiddenError(
          'You are not the owner of this card and therefore cannot update it.'
        )
      }

      const updatedCard = await repos.cardRepository.update(id, newData)
      return updatedCard
    }
  )
