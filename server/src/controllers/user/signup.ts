import { hash } from 'bcrypt'
import { publicProcedure } from '@server/trpc'
import config from '@server/config'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import { userSchema } from '@server/entities/user'
import BadRequestError from '@server/utils/errors/BadRequest'

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(
    userSchema.pick({
      email: true,
      password: true,
      firstName: true,
      lastName: true,
    })
  )
  .mutation(async ({ input: user, ctx: { repos } }) => {
    const passwordHash = await hash(user.password, config.auth.passwordCost)

    const existingUser = await repos.userRepository.findByEmail(user.email)

    if (existingUser) {
      throw new BadRequestError('User with this email already exists')
    }

    const userCreated = await repos.userRepository.create({
      ...user,
      password: passwordHash,
    })

    return {
      id: userCreated.id,
    }
  })
