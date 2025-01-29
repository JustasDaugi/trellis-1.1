import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('card')
    .addColumn('due_date', 'timestamptz')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('card').dropColumn('due_date').execute()
}
