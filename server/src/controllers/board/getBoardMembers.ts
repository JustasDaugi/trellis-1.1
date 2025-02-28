import { boardMembersSchema } from '@server/entities/boardMember'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { userRepository } from '@server/repositories/userRepository'
import { boardRepository } from '@server/repositories/boardRepository'
import NotFoundError from '@server/utils/errors/NotFound'
import ForbiddenError from '@server/utils/errors/Forbidden'

export default authenticatedProcedure
  .use(provideRepos({ boardMemberRepository, userRepository, boardRepository }))
  .input(
    boardMembersSchema.pick({
      boardId: true,
    })
  )
  .query(async ({ input: { boardId }, ctx: { repos, authUser } }) => {
    const board = await repos.boardRepository.findById(boardId)
    if (!board) {
      throw new NotFoundError(`Board with id ${boardId} not found.`)
    }

    const isOwner = board.userId === authUser.id
    const isMember = await repos.boardMemberRepository.isMemberOfBoard(
      boardId,
      authUser.id
    )
    if (!isOwner && !isMember) {
      throw new ForbiddenError(
        'You are not authorized to view this board’s members.'
      )
    }

    const boardMembers =
      await repos.boardMemberRepository.getBoardMembers(boardId)
    if (!boardMembers || boardMembers.length === 0) {
      throw new NotFoundError(`No board members found for board ID ${boardId}`)
    }

    const memberDetails = await Promise.all(
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

    return memberDetails.filter((member) => member !== null)
  })
