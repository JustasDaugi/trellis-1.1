import { listSchema, type ListPublic } from '@server/entities/list'
import provideRepos from '@server/trpc/provideRepos'
import { listRepository } from '@server/repositories/listRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'
import { cacheMiddleware } from '@server/middleware'

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      listRepository,
      boardMemberRepository,
    })
  )
  .input(
    listSchema.pick({
      boardId: true,
      title: true,
    })
  )
  .use(
    cacheMiddleware({
      key: ({ ctx }) =>
        `boards-allowed:${ctx.authUser.id}:user:${ctx.authUser.id}:limit:10:offset:0`,
      ttl: 0,
      invalidate: true,
    })
  )
  .mutation(
    async ({ input, ctx: { repos, authUser } }): Promise<ListPublic> => {
      const { boardId, title } = input

      const board = await repos.boardRepository.findById(boardId)
      if (!board) {
        throw new NotFoundError(`Board with id ${boardId} not found`)
      }

      const isOwner = board.userId === authUser.id
      const isMember = await repos.boardMemberRepository.isMemberOfBoard(
        board.id,
        authUser.id
      )
      if (!isOwner && !isMember) {
        throw new ForbiddenError(
          'You are not authorized to create a list in this board.'
        )
      }

      const newList = await repos.listRepository.create({
        boardId,
        title,
        userId: authUser.id,
      })

      return newList
    }
  )
