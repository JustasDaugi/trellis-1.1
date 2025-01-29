import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Card } from '@server/database/types'
import { idSchema } from './shared'

export const cardSchema = z.object({
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  description: z.string().max(1000).nullable(),
  id: idSchema,
  listId: idSchema,
  order: z.number().nullable(),
  title: z.string().min(1).max(500),
  userId: idSchema,
  dueDate: z.date().nullable(),
})
export const cardKeysAll = Object.keys(cardSchema.shape) as (keyof Card)[]

export const cardKeysPublic = cardKeysAll

export type CardPublic = Pick<Selectable<Card>, (typeof cardKeysPublic)[number]>
