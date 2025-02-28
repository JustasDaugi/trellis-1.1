import { cardSchema, type CardPublic } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { cardRepository } from '@server/repositories/cardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
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
        listId: true,
        title: true,
        description: true,
      })
      .partial({ description: true })
  )
  .mutation(
    async ({ input, ctx: { repos, authUser } }): Promise<CardPublic> => {
      const { listId, title, description } = input
      const list = await repos.listRepository.findById(listId)
      if (!list) {
        throw new NotFoundError('List not found.')
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
          'You are not authorized to create a card in this board.'
        )
      }

      const newCard = await repos.cardRepository.create({
        listId,
        title,
        description: description || null,
        userId: authUser.id,
      })

      return newCard
    }
  )
