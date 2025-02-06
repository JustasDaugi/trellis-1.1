import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('list')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity().notNull()
    )
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('order', 'integer')
    .addColumn('board_id', 'integer', (c) =>
      c.references('board.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'integer', (c) =>
      c.references('user.id').onDelete('set null').notNull()
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('idx_list_board_id')
    .on('list')
    .column('board_id')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropIndex('idx_list_board_id').on('list').execute()
  await db.schema.dropTable('list').execute()
}
