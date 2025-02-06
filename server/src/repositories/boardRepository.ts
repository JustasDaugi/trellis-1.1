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

    /**
     * Return all boards the user owns
     * plus any boards in which the user is a member.
     */
    async findAllByUserId(userId: number): Promise<BoardPublic[]> {
      const [ownedBoards, pivotRows] = await Promise.all([
        db
          .selectFrom('board')
          .select(boardKeysPublic)
          .where('userId', '=', userId)
          .orderBy('id', 'desc')
          .execute(),

        db
          .selectFrom('boardMembers')
          .select('boardId')
          .where('userId', '=', userId)
          .execute(),
      ])

      const pivotBoardIds = pivotRows.map((row) => row.boardId)
      const memberBoards = pivotBoardIds.length
        ? await db
            .selectFrom('board')
            .select(boardKeysPublic)
            .where('id', 'in', pivotBoardIds)
            .orderBy('id', 'desc')
            .execute()
        : []

      const boards = [...ownedBoards, ...memberBoards].reduce(
        (boardMap, board) => boardMap.set(board.id, board),
        new Map<number, BoardPublic>()
      )

      return Array.from(boards.values())
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
