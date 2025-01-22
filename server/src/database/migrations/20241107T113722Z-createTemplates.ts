import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('board_template')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity().notNull()
    )
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('selected_background', 'text')
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createTable('list_template')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity().notNull()
    )
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('order', 'integer')
    .addColumn('board_id', 'integer', (c) =>
      c.references('board_template.id').onDelete('cascade').notNull()
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()


  await db.schema
    .createTable('card_template')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity().notNull()
    )
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('order', 'integer')
    .addColumn('description', 'text')
    .addColumn('list_id', 'integer', (c) =>
      c.references('list_template.id').onDelete('cascade').notNull()
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('idx_list_template_board_id')
    .on('list_template')
    .column('board_id')
    .execute()

  await db.schema
    .createIndex('idx_card_template_list_id')
    .on('card_template')
    .column('list_id')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropIndex('idx_card_template_list_id').on('card_template').execute()
  await db.schema.dropIndex('idx_list_template_board_id').on('list_template').execute()
  await db.schema.dropTable('card_template').execute()
  await db.schema.dropTable('list_template').execute()
  await db.schema.dropTable('board_template').execute()
}
