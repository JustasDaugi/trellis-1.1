import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('user')
    .addColumn('board_id', 'integer', (c) =>
      c.references('board.id').onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('user')
    .dropColumn('board_id')
    .execute()
}
