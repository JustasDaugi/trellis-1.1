import { boardRepository } from '@server/repositories/boardRepository'
import { userRepository } from '@server/repositories/userRepository'
import { boardMemberRepository } from '@server/repositories/boardMemberRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { boardSchema } from '@server/entities/board'
import { userSchema } from '@server/entities/user'
import { z } from 'zod'
import NotFoundError from '@server/utils/errors/NotFound'
import InternalServerError from '@server/utils/errors/InternalServerError'
import ForbiddenError from '@server/utils/errors/Forbidden'
import sendEmail from '@server/service/email'

const shareBoardInput = z.object({
  boardId: boardSchema.pick({ id: true }).shape.id,
  email: userSchema.pick({ email: true }).shape.email,
})

export default authenticatedProcedure
  .use(
    provideRepos({
      boardRepository,
      userRepository,
      boardMemberRepository,
    })
  )
  .input(shareBoardInput)
  .mutation(async ({ input, ctx: { repos, authUser } }) => {
    const { boardId, email } = input
    const board = await repos.boardRepository.findById(boardId)
    if (!board) {
      throw new NotFoundError('Board not found')
    }

    if (board.userId !== authUser.id) {
      throw new ForbiddenError('Only the board owner can share this board.')
    }

    const user = await repos.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    await repos.boardMemberRepository.addBoardMember({
      boardId: board.id,
      userId: user.id,
    })

    const boardLink = `${process.env.DOMAIN_LINK}/board/${boardId}`
    try {
      await sendEmail(email, boardLink)
      return { success: true }
    } catch (error) {
      throw new InternalServerError('Failed to send email')
    }
  })
