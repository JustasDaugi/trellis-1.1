import type { Database, BoardMembers } from '@server/database'
import {
  type BoardMembersPublic,
  boardMembersKeysPublic,
} from '@server/entities/boardMember'
import type { Insertable } from 'kysely'

export type InsertableBoardMember = Omit<Insertable<BoardMembers>, 'boardOwner'>

export function boardMemberRepository(db: Database) {
  return {
    async addBoardMember(
      boardMember: InsertableBoardMember
    ): Promise<Partial<BoardMembersPublic> | undefined> {
      const existing = await db
        .selectFrom('boardMembers')
        .selectAll()
        .where('boardId', '=', boardMember.boardId)
        .where('userId', '=', boardMember.userId)
        .executeTakeFirst()

      if (existing) {
        return {
          boardId: existing.boardId,
          userId: existing.userId,
        }
      }

      const inserted = await db
        .insertInto('boardMembers')
        .values(boardMember)
        .returning(boardMembersKeysPublic)
        .executeTakeFirstOrThrow()

      return inserted
    },

    async getBoardMembers(boardId: number): Promise<BoardMembersPublic[]> {
      const rows = await db
        .selectFrom('boardMembers')
        .select(boardMembersKeysPublic)
        .where('boardId', '=', boardId)
        .execute()

      return rows
    },

    async removeBoardMemberById(
      boardId: number,
      userId: number
    ): Promise<boolean> {
      const result = await db
        .deleteFrom('boardMembers')
        .where('boardId', '=', boardId)
        .where('userId', '=', userId)
        .executeTakeFirst()

      return result.numDeletedRows > 0
    },

    async addOwner(boardId: number, userId: number): Promise<void> {
      await db
        .updateTable('boardMembers')
        .set({ boardOwner: userId })
        .where('boardId', '=', boardId)
        .execute()
    },

    async getBoardOwner(boardId: number): Promise<number | null> {
      const result = await db
        .selectFrom('boardMembers')
        .select(['boardOwner'])
        .where('boardId', '=', boardId)
        .where('boardOwner', 'is not', null)
        .executeTakeFirst()

      return result?.boardOwner ?? null
    },

    async isMemberOfBoard(boardId: number, userId: number): Promise<boolean> {
      const member = await db
        .selectFrom('boardMembers')
        .select('boardMembers.boardId')
        .where('boardId', '=', boardId)
        .where('userId', '=', userId)
        .executeTakeFirst()

      return !!member
    },
  }
}

export type BoardMembersRepository = ReturnType<typeof boardMemberRepository>
