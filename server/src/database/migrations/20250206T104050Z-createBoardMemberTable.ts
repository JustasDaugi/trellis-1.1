import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('board_members')
    .addColumn('board_id', 'integer', (col) =>
      col.notNull().references('board.id').onDelete('cascade')
    )
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('board_owner', 'integer', (col) =>
      col.references('user.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('board_members_pkey', ['board_id', 'user_id'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('board_members').execute()
}
