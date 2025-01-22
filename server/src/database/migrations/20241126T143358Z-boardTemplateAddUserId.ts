import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('board_template')
    .addColumn('user_id', 'integer', (c) =>
      c.references('user.id').onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('board_template')
    .dropColumn('user_id')
    .execute()
}
