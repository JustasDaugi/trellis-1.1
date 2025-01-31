import type { Database, Card } from '@server/database'
import { type CardPublic, cardKeysPublic } from '@server/entities/card'
import type { Insertable, Updateable } from 'kysely'

export function cardRepository(db: Database) {
  return {
    async create(card: Insertable<Card>): Promise<CardPublic> {
      return db
        .insertInto('card')
        .values(card)
        .returning(cardKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findById(id: number): Promise<CardPublic | undefined> {
      return db
        .selectFrom('card')
        .select(cardKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findByListId(listId: number): Promise<CardPublic[]> {
      return db
        .selectFrom('card')
        .select(cardKeysPublic)
        .where('listId', '=', listId)
        .orderBy('order', 'asc')
        .execute()
    },

    async update(
      id: number,
      data: Partial<Updateable<Card>>
    ): Promise<CardPublic> {
      return db
        .updateTable('card')
        .set(data)
        .where('id', '=', id)
        .returning(cardKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async updateListId(id: number, listId: number): Promise<CardPublic> {
      return db
        .updateTable('card')
        .set({ listId })
        .where('id', '=', id)
        .returning(cardKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async delete(id: number): Promise<void> {
      await db.deleteFrom('card').where('id', '=', id).execute()
    },

    async addDueDate(id: number, dueDate: Date | null): Promise<CardPublic> {
      return db
        .updateTable('card')
        .set({ dueDate: dueDate ? dueDate.toISOString() : null })
        .where('id', '=', id)
        .returning(cardKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async getDueDate(id: number): Promise<Date | null> {
      const result = await db
        .selectFrom('card')
        .select(['dueDate'])
        .where('id', '=', id)
        .executeTakeFirst()

      return result?.dueDate ? new Date(result.dueDate) : null
    },

    async deleteDueDate(id: number): Promise<CardPublic> {
      return db
        .updateTable('card')
        .set({ dueDate: null })
        .where('id', '=', id)
        .returning(cardKeysPublic)
        .executeTakeFirstOrThrow()
    },
  }
}

export type CardRepository = ReturnType<typeof cardRepository>
