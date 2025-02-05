import { hash } from 'bcrypt'
import { publicProcedure } from '@server/trpc'
import config from '@server/config'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import { userSchema } from '@server/entities/user'
import BadRequestError from '@server/utils/errors/BadRequest'
import NotFoundError from '@server/utils/errors/NotFound'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const resetPasswordInput = userSchema
  .pick({
    email: true,
    password: true,
  })
  .extend({
    token: z.string(),
  })

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(resetPasswordInput)
  .mutation(async ({ input: { email, password, token }, ctx: { repos } }) => {
    const user = await repos.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const { tokenKey } = config.auth
    try {
      const decoded = jwt.verify(token, tokenKey) as { email?: string }

      if (!decoded.email || decoded.email !== email) {
        throw new BadRequestError('Invalid token or email')
      }
    } catch (error) {
      throw new BadRequestError('Invalid or expired token')
    }

    const passwordHash = await hash(password, config.auth.passwordCost)

    const passwordUpdated = await repos.userRepository.resetPassword(
      email,
      passwordHash
    )
    if (!passwordUpdated) {
      throw new BadRequestError('Failed to reset password')
    }

    return { success: true }
  })
