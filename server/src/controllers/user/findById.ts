import { userSchema, type UserPublic } from '@server/entities/user'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import NotFoundError from '@server/utils/errors/NotFound'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(
    userSchema.pick({
      id: true,
    })
  )
  .query(async ({ input: { id }, ctx: { repos } }): Promise<UserPublic> => {
    const user = await repos.userRepository.findById(id)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  })
