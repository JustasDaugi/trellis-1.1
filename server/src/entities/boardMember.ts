import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { BoardMembers } from '@server/database/types'
import { idSchema } from './shared'

export const boardMembersSchema = z.object({
  boardId: idSchema,
  userId: idSchema,
  boardOwner: idSchema.optional(),
})

export const boardMembersKeysPublic = [
  'boardId',
  'userId',
] as (keyof BoardMembers)[]

export type BoardMembersPublic = Pick<
  Selectable<BoardMembers>,
  (typeof boardMembersKeysPublic)[number]
>
