import type { Database, Board } from '@server/database'
import { type BoardPublic, boardKeysPublic } from '@server/entities/board'
import type { Insertable, Updateable } from 'kysely'

export function boardRepository(db: Database) {
  return {
    async create(board: Insertable<Board>): Promise<BoardPublic> {
      return db
        .insertInto('board')
        .values(board)
        .returning(boardKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findById(id: number): Promise<BoardPublic | undefined> {
      return db
        .selectFrom('board')
        .select(boardKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findSelectedBackground(
      id: number
    ): Promise<Pick<BoardPublic, 'selectedBackground'> | undefined> {
      return db
        .selectFrom('board')
        .select(['selectedBackground'])
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findAllByUserId(userId: number): Promise<BoardPublic[]> {
      return db
        .selectFrom('board')
        .select(boardKeysPublic)
        .where('userId', '=', userId)
        .orderBy('id', 'desc')
        .execute()
    },

    async update(
      boardId: number,
      data: Partial<Updateable<Board>>
    ): Promise<BoardPublic> {
      return db
        .updateTable('board')
        .set(data)
        .where('id', '=', boardId)
        .returning(boardKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async delete(boardId: number): Promise<void> {
      await db.deleteFrom('board').where('id', '=', boardId).execute()
    },
  }
}

export type BoardRepository = ReturnType<typeof boardRepository>
