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
        console.log('Slack message sent for new/updated log.')
      } catch (slackError) {
        console.error('Error sending Slack message:', slackError)
      }

      if (io) {
        io.emit('logCreated', logEntry)
      }

      return { success: true, message: 'Activity logged successfully' }
    } catch (error) {
      console.error('Error logging activity:', error)
      return { success: false, error: 'Failed to log activity' }
    }
  })
