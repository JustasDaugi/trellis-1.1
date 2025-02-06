import { boardSchema, type BoardPublic } from '@server/entities/board'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import type { InsertableBoardMember } from '@server/repositories/boardMemberRepository'

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

      const boardMember: InsertableBoardMember = {
        boardId: createdBoard.id,
        userId: authUser.id,
      }

      await repos.boardMemberRepository.addBoardMember(boardMember)

      await repos.boardMemberRepository.addOwner(createdBoard.id, authUser.id)

      return createdBoard as BoardPublic
    }
  )
