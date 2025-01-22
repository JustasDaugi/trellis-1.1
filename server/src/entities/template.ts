import { z } from 'zod'
import type { Selectable } from 'kysely'
import type {
  BoardTemplate,
  ListTemplate,
  CardTemplate,
} from '@server/database/types'
import { idSchema } from './shared'

export const boardTemplateSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(500),
  selectedBackground: z.string().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  userId: idSchema.optional(),
})

export const boardTemplateKeysAll = Object.keys(
  boardTemplateSchema.shape
) as (keyof BoardTemplate)[]

export const boardTemplateKeysPublic = boardTemplateKeysAll

export type BoardTemplatePublic = Pick<
  Selectable<BoardTemplate>,
  (typeof boardTemplateKeysPublic)[number]
>

export const listTemplateSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(500),
  order: z.number().nullable(),
  boardId: idSchema,
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const listTemplateKeysAll = Object.keys(
  listTemplateSchema.shape
) as (keyof ListTemplate)[]

export const listTemplateKeysPublic = listTemplateKeysAll

export type ListTemplatePublic = Pick<
  Selectable<ListTemplate>,
  (typeof listTemplateKeysPublic)[number]
>

export const cardTemplateSchema = z.object({
  createdAt: z.date().default(() => new Date()),
  description: z.string().min(1).max(1000),
  id: idSchema,
  listId: idSchema,
  order: z.number().nullable(),
  title: z.string().min(1).max(500),
  updatedAt: z.date().default(() => new Date()),
})

export const cardTemplateKeysAll = Object.keys(
  cardTemplateSchema.shape
) as (keyof CardTemplate)[]

export const cardTemplateKeysPublic = cardTemplateKeysAll

export type CardTemplatePublic = Pick<
  Selectable<CardTemplate>,
  (typeof cardTemplateKeysPublic)[number]
>
