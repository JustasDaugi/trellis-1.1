import { listSchema, type ListPublic } from '@server/entities/list'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(
    provideRepos({
      listRepository,
      boardRepository,
      boardMemberRepository,
    })
  )
  .input(
    listSchema.pick({
      boardId: true,
    })
  )
  .mutation(
    async ({
      input: { boardId },
      ctx: { repos, authUser },
    }): Promise<ListPublic[]> => {
      const board = await repos.boardRepository.findById(boardId)
      if (!board) {
        throw new NotFoundError(`Board with id ${boardId} not found.`)
      }

      const userIsOwner = board.userId === authUser.id
      const userIsMember = await repos.boardMemberRepository.isMemberOfBoard(
        board.id,
        authUser.id
      )

      if (!userIsOwner && !userIsMember) {
        throw new ForbiddenError(
          'You are not authorized to view lists for this board.'
        )
      }

      const lists = await repos.listRepository.findByBoardId(boardId)
      return lists
    }
  )
