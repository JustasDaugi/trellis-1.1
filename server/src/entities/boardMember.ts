import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { BoardMembers } from '@server/database/types'
import { idSchema } from './shared'

export const boardMembersSchema = z.object({
  boardId: idSchema,
  userId: idSchema,
})

export const boardMembersKeysAll = Object.keys(
  boardMembersSchema.shape
) as (keyof BoardMembers)[]

export const boardMembersKeysPublic = boardMembersKeysAll

export type BoardMembersPublic = Pick<
  Selectable<BoardMembers>,
  (typeof boardMembersKeysPublic)[number]
>
