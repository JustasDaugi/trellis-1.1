import { activitySchema } from '@server/entities/activity'
import { publicProcedure } from '@server/trpc'
import {
  generateDescription,
  buildLog,
  insertLog,
  type LogInput,
} from './utils'

import { io } from '@server/app'
import { slackBot } from '../../service/slackBot'
import logger from '@server/utils//logger/logger'

export default publicProcedure
  .input(activitySchema)
  .mutation(async ({ input }) => {
    try {
      const logInput = input as LogInput
      const description = generateDescription(logInput)
      const logEntry = buildLog(logInput, description)

      await insertLog(logEntry)

      try {
        await slackBot.sendDescription(logInput)
        logger.info('Slack message sent for new/updated log.')
      } catch (slackError) {
        logger.error({ err: slackError }, 'Error sending Slack message')
      }

      if (io) {
        io.emit('logCreated', logEntry)
      }

      return { success: true, message: 'Activity logged successfully' }
    } catch (error) {
      logger.error({ err: error }, 'Error logging activity')
      return { success: false, error: 'Failed to log activity' }
    }
  })
