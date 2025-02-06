import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('card')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity().notNull()
    )
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('order', 'integer')
    .addColumn('description', 'text')
    .addColumn('list_id', 'integer', (c) =>
      c.references('list.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'integer', (c) =>
      c.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('idx_card_list_id')
    .on('card')
    .column('list_id')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropIndex('idx_card_list_id').on('card').execute()
  await db.schema.dropTable('card').execute()
}
