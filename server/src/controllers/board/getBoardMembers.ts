import { boardMembersSchema } from '@server/entities/boardMember'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { userRepository } from '@server/repositories/userRepository'
import NotFoundError from '@server/utils/errors/NotFound'

export default authenticatedProcedure
  .use(provideRepos({ boardMemberRepository, userRepository }))
  .input(
    boardMembersSchema.pick({
      boardId: true,
    })
  )
  .query(async ({ input: { boardId }, ctx: { repos } }) => {
    const boardMembers =
      await repos.boardMemberRepository.getBoardMembers(boardId)

    if (!boardMembers || boardMembers.length === 0) {
      throw new NotFoundError(`No board members found for board ID ${boardId}`)
    }

    const membersWithDetails = await Promise.all(
      boardMembers.map(async (member) => {
        const user = await repos.userRepository.findById(member.userId)
        return user
          ? {
              userId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            }
          : null
      })
    )

    return membersWithDetails.filter((member) => member !== null)
  })
