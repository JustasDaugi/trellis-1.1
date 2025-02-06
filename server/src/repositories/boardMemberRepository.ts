import type { Database, BoardMembers } from '@server/database'
import {
  type BoardMembersPublic,
  boardMembersKeysPublic,
} from '@server/entities/boardMember'
import type { Insertable } from 'kysely'

export function boardMemberRepository(db: Database) {
  return {
    async addBoardMember(
      boardMember: Insertable<BoardMembers>
    ): Promise<BoardMembersPublic | undefined> {
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
  }
}

export type BoardMembersRepository = ReturnType<typeof boardMemberRepository>
