import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  const [boardTemplate] = await db
    .insertInto('board_template')
    .values({
      title: 'Agile Board',
      selectedBackground: '',
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .returning('id')
    .execute()

  const [doneList, inProgressList] = await db
    .insertInto('list_template')
    .values([
      {
        title: 'Done',
        order: 1,
        boardId: boardTemplate.id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
      {
        title: 'In Progress',
        order: 2,
        boardId: boardTemplate.id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    ])
    .returning(['id'])
    .execute()

  await db
    .insertInto('card_template')
    .values([
      {
        title: 'Review tech partner pages',
        description: 'Review and update technical partnership documentation',
        order: 1,
        listId: doneList.id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
      {
        title: 'Going Live with server deployment',
        description: 'Deploy application to production servers',
        order: 2,
        listId: doneList.id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
      {
        title: 'Android App new landing page',
        description: 'Design and implement new landing page for Android app',
        order: 1,
        listId: inProgressList.id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
      {
        title: 'Analytics',
        description: 'Implement analytics tracking system',
        order: 2,
        listId: inProgressList.id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('card_template').execute()
  await db.deleteFrom('list_template').execute()
  await db.deleteFrom('board_template').execute()
}
