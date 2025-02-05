import { userRepository } from '@server/repositories/userRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'
import NotFoundError from '@server/utils/errors/NotFound'
import InternalServerError from '@server/utils/errors/InternalServerError'
import sendResetEmail from '@server/service/passwordReset/index'
import config from '@server/config'
import jwt from 'jsonwebtoken'

const resetPasswordInput = z.object({
  email: z.string().email(),
})

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(resetPasswordInput)
  .mutation(async ({ input, ctx: { repos } }) => {
    const { email } = input

    const user = await repos.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const { resetPasswordExpiresIn, tokenKey } = config.auth
    const resetToken = jwt.sign({ email }, tokenKey, {
      expiresIn: resetPasswordExpiresIn,
    })

    const baseURL = process.env.DOMAIN_LINK || 'http://localhost:5173'
    const resetLink = `${baseURL}/reset-password/confirm?token=${resetToken}&email=${encodeURIComponent(email)}`

    try {
      await sendResetEmail(email, resetLink)
      return { success: true }
    } catch (error) {
      throw new InternalServerError('Failed to send reset email')
    }
  })
