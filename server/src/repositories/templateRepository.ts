import type { Database } from '@server/database'
import type {
  BoardTemplatePublic,
  ListTemplatePublic,
  CardTemplatePublic,
} from '@server/entities/template'
import {
  boardTemplateKeysPublic,
  listTemplateKeysPublic,
  cardTemplateKeysPublic,
} from '@server/entities/template'
import { sql } from 'kysely'

export function templateRepository(db: Database) {
  return {
    async findCopiedBoard(
      id: number
    ): Promise<BoardTemplatePublic | undefined> {
      return db
        .selectFrom('board')
        .select(boardTemplateKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findAll(): Promise<BoardTemplatePublic[]> {
      return db
        .selectFrom('boardTemplate')
        .select(boardTemplateKeysPublic)
        .orderBy('id', 'desc')
        .execute()
    },

    async findById(id: number): Promise<BoardTemplatePublic | undefined> {
      return db
        .selectFrom('boardTemplate')
        .select(boardTemplateKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findByBoardId(boardId: number): Promise<ListTemplatePublic[]> {
      return db
        .selectFrom('listTemplate')
        .select(listTemplateKeysPublic)
        .where('boardId', '=', boardId)
        .orderBy('order', 'asc')
        .execute()
    },

    async findByListId(listId: number): Promise<CardTemplatePublic[]> {
      return db
        .selectFrom('cardTemplate')
        .select(cardTemplateKeysPublic)
        .where('listId', '=', listId)
        .orderBy('order', 'asc')
        .execute()
    },

    async copyBoard(
      boardTemplateId: number,
      userId: number,
      customTitle?: string,
      selectedBackground?: string
    ) {
      return db
        .insertInto('board')
        .columns(['title', 'userId', 'selectedBackground'])
        .expression(
          db
            .selectFrom('boardTemplate')
            .select([sql`${customTitle || 'title'}`.as('title')])
            .select(sql`${userId}`.as('userId'))
            .select(
              sql`${selectedBackground || 'defaultBackground'}`.as(
                'selectedBackground'
              )
            )
            .where('id', '=', boardTemplateId)
        )
        .returning('id')
        .executeTakeFirst()
    },

    async copyList(listTemplateId: number, boardId: number, userId: number) {
      return db
        .insertInto('list')
        .columns(['title', 'order', 'boardId', 'userId'])
        .expression(
          db
            .selectFrom('listTemplate')
            .select(['title', 'order'])
            .select(sql`${boardId}`.as('boardId'))
            .select(sql`${userId}`.as('userId'))
            .where('id', '=', listTemplateId)
        )
        .returning('id')
        .executeTakeFirst()
    },

    async copyCard(cardTemplateId: number, listId: number, userId: number) {
      return db
        .insertInto('card')
        .columns(['title', 'order', 'description', 'listId', 'userId'])
        .expression(
          db
            .selectFrom('cardTemplate')
            .select(['title', 'order'])
            .select(sql`NULL`.as('description'))
            .select(sql`${listId}`.as('listId'))
            .select(sql`${userId}`.as('userId'))
            .where('id', '=', cardTemplateId)
        )
        .returning('id')
        .executeTakeFirst()
    },
  }
}

export type TemplateRepository = ReturnType<typeof templateRepository>
