import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema.alterTable('user').addColumn('resetId', 'varchar').execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('user').dropColumn('resetId').execute()
}
