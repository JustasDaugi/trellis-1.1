import type { Database, List } from '@server/database'
import { type ListPublic, listKeysPublic } from '@server/entities/list'
import { type Insertable } from 'kysely'

export function listRepository(db: Database) {
  return {
    async create(list: Insertable<List>): Promise<ListPublic> {
      return db
        .insertInto('list')
        .values(list)
        .returning(listKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findById(id: number): Promise<ListPublic | undefined> {
      return db
        .selectFrom('list')
        .select(listKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findByBoardId(boardId: number): Promise<ListPublic[]> {
      return db
        .selectFrom('list')
        .select(listKeysPublic)
        .where('boardId', '=', boardId)
        .orderBy('order', 'asc')
        .execute()
    },

    async findUserId(id: number): Promise<number | undefined> {
      const result = await db
        .selectFrom('list')
        .select(['userId'])
        .where('id', '=', id)
        .executeTakeFirst()

      return result?.userId
    },

    async update(
      id: number,
      data: Partial<Insertable<List>>
    ): Promise<ListPublic> {
      return db
        .updateTable('list')
        .set(data)
        .where('id', '=', id)
        .returning(listKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async delete(id: number): Promise<void> {
      await db.deleteFrom('list').where('id', '=', id).executeTakeFirstOrThrow()
    },
  }
}

export type ListRepository = ReturnType<typeof listRepository>
