import { z } from 'zod'
import { idSchema } from './shared'

export const activitySchema = z.object({
  cardId: idSchema.optional(),
  listId: idSchema,
  userId: idSchema,
  action: z.enum(['created', 'updated', 'deleted']),
  entityType: z.enum(['card', 'list']),
  boardId: idSchema,
  localTitle: z.string().optional(),
  field: z.string().optional(),
  previousValue: z.any().optional(),
  newValue: z.any().optional(),
  description: z.string(),
  previousDueDate: z.string().nullable().optional(),
  newDueDate: z.string().nullable().optional(),
})

export const activityKeysAll = Object.keys(activitySchema.shape)

export type ActivityInput = z.infer<typeof activitySchema>
