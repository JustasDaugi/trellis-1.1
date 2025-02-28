import { cardSchema, type CardPublic } from '@server/entities/card'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import { listRepository } from '@server/repositories/listRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      cardRepository,
      listRepository,
      boardRepository,
      boardMemberRepository,
    })
  )
  .input(
    cardSchema
      .pick({
        listId: true,
        description: true,
      })
      .partial({ description: true })
  )
  .mutation(
    async ({
      input: { listId },
      ctx: { repos, authUser },
    }): Promise<CardPublic[]> => {
      const list = await repos.listRepository.findById(listId)
      if (!list) {
        throw new NotFoundError(`List with id ${listId} not found.`)
      }

      const board = await repos.boardRepository.findById(list.boardId)
      if (!board) {
        throw new NotFoundError(`Board with id ${list.boardId} not found.`)
      }

      const userIsOwner = board.userId === authUser.id
      const userIsMember = await repos.boardMemberRepository.isMemberOfBoard(
        board.id,
        authUser.id
      )

      if (!userIsOwner && !userIsMember) {
        throw new ForbiddenError(
          'You do not have permission to view cards on this list.'
        )
      }

      const cards = await repos.cardRepository.findByListId(listId)
      return cards
    }
  )
