import {
  boardMembersSchema,
  type BoardMembersPublic,
} from '@server/entities/boardMember'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(provideRepos({ boardMemberRepository }))
  .input(
    boardMembersSchema.pick({
      boardId: true,
      userId: true,
    })
  )
  .mutation(
    async ({
      input: { boardId, userId },
      ctx: { repos, authUser },
    }): Promise<Partial<BoardMembersPublic>> => {
      const boardMembers =
        await repos.boardMemberRepository.getBoardMembers(boardId)

      if (!boardMembers.some((member) => member.userId === userId)) {
        throw new NotFoundError(`Board member not found`)
      }

      if (authUser.id !== userId) {
        throw new ForbiddenError(
          'You are not authorized to remove this board member'
        )
      }

      await repos.boardMemberRepository.removeBoardMemberById(boardId, userId)

      return { boardId, userId }
    }
  )
