import { boardSchema, type BoardPublic } from '@server/entities/board'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardRepository } from '@server/repositories/boardRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'

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

      await repos.boardMemberRepository.addBoardMember({
        boardId: createdBoard.id,
        userId: authUser.id,
      })

      return createdBoard as BoardPublic
    }
  )
