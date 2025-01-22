import { boardRepository } from '@server/repositories/boardRepository'
import { userRepository } from '@server/repositories/userRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { boardSchema } from '@server/entities/board'
import { userSchema } from '@server/entities/user'
import { z } from 'zod'
import NotFoundError from '@server/utils/errors/NotFound'
import InternalServerError from "@server/utils/errors/InternalServerError";
import sendEmail from '@server/service/sendEmail'


const shareBoardInput = z.object({
  boardId: boardSchema.pick({ id: true }).shape.id,
  email: userSchema.pick({ email: true }).shape.email,
})

export default publicProcedure

  .use(
    provideRepos({
      boardRepository,
      userRepository,
    })
  )
  .input(shareBoardInput)
  .mutation(async ({ input, ctx: { repos } }) => {
    const { boardId, email } = input

    const board = await repos.boardRepository.findById(boardId)

    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const user = await repos.userRepository.findByEmail(email)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const boardLink = `${process.env.DOMAIN_LINK}/board/${boardId}`

    try {
      await sendEmail(email, boardLink)
      return { success: true }
    } catch (error) {
      throw new InternalServerError("Failed to send email")
    }
  })
