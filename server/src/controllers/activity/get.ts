import { activitySchema } from '@server/entities/activity'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { boardRepository } from '@server/repositories/boardRepository'
import { connectToDatabase } from '@server/database/mongo'
import NotFoundError from '@server/utils/errors/NotFound'
import { z } from 'zod'
import logger from '@server/utils/logger/logger'

export default publicProcedure
  .use(
    provideRepos({
      boardRepository,
    })
  )
  .input(
    activitySchema
      .pick({
        boardId: true,
      })
      .extend({
        limit: z.number().optional(),
      })
  )
  .query(async ({ input, ctx: { repos } }) => {
    const { boardId, limit } = input

    try {
      const board = await repos.boardRepository.findById(boardId)
      if (!board) {
        throw new NotFoundError(`Board with ID ${boardId} not found.`)
      }

      const db = await connectToDatabase('activity_logs')
      const logsCollection = db.logs

      const logs = await logsCollection
        .find({ boardId })
        .limit(limit || 100)
        .toArray()

      return { success: true, logs }
    } catch (error) {
      logger.error('Error retrieving logs:', error)
      return { success: false, error: 'Failed to retrieve logs' }
    }
  })
