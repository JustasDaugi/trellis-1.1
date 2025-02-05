import type { Database } from '@server/database'
import type { User } from '@server/database/types'
import {
  type UserPublic,
  userKeysAll,
  userKeysPublic,
} from '@server/entities/user'
import type { Insertable, Selectable } from 'kysely'

export function userRepository(db: Database) {
  return {
    async create(user: Insertable<User>): Promise<UserPublic> {
      return db
        .insertInto('user')
        .values(user)
        .returning(userKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findByEmail(email: string): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('email', '=', email)
        .executeTakeFirst()

      return user
    },

    async findById(id: number): Promise<Selectable<User> | undefined> {
      return db
        .selectFrom('user')
        .select(userKeysAll)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async resetPassword(email: string, newPassword: string): Promise<boolean> {
      const result = await db
        .updateTable('user')
        .set({ password: newPassword })
        .where('email', '=', email)
        .executeTakeFirst()

      return result.numUpdatedRows > 0
    },
  }
}

export type UserRepository = ReturnType<typeof userRepository>
