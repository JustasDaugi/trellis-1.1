import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { List } from '@server/database/types'
import { idSchema } from './shared'

export const listSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(500),
  order: z.number().nullable(),
  boardId: idSchema,
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
  userId: idSchema
})

export const listKeysAll = Object.keys(
  listSchema.shape
) as (keyof List)[]

export const listKeysPublic = listKeysAll

export type ListPublic = Pick<
  Selectable<List>,
  (typeof listKeysPublic)[number]
>
