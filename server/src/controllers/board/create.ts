import { boardSchema, type BoardPublic } from '@server/entities/board'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import type { InsertableBoardMember } from '@server/repositories/boardMemberRepository'
import { cacheMiddleware } from '@server/middleware'

export default authenticatedProcedure
  .use(provideRepos({ boardRepository, boardMemberRepository }))
  .input(
    boardSchema
      .pick({
        title: true,
        selectedBackground: true,
      })
      .partial({
        selectedBackground: true,
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
    async ({
      input: { title, selectedBackground },
      ctx: { authUser, repos },
    }) => {
      const newBoard = {
        title,
        selectedBackground: selectedBackground || null,
        userId: authUser.id,
      }

      const createdBoard = await repos.boardRepository.create(newBoard)
      if (!createdBoard || !createdBoard.id) {
        throw new Error('Board creation failed: Missing board id')
      }

      const boardMember: InsertableBoardMember = {
        boardId: createdBoard.id,
        userId: authUser.id,
      }

      await repos.boardMemberRepository.addBoardMember(boardMember)
      await repos.boardMemberRepository.addOwner(createdBoard.id, authUser.id)

      return createdBoard as BoardPublic
    }
  )
