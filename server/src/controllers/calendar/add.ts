import { z } from 'zod'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { cardRepository } from '@server/repositories/cardRepository'
import {
  getAuthUrl,
  exchangeCodeForTokens,
  createCalendarEvent,
} from '@server/service/googleCalendar'

export default publicProcedure
  .use(provideRepos({ cardRepository }))
  .input(
    z.object({
      code: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    if (!input.code) {
      const authUrl = getAuthUrl()
      return { authUrl }
    }

    await exchangeCodeForTokens(input.code)

    if (input.startDate) {
      const startDateTime = new Date(input.startDate)
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)

      await createCalendarEvent({
        title: input.title ?? 'Untitled Event',
        description: input.description,
        startDateTime,
        endDateTime,
      })
    }

    return { redirectUrl: 'https://calendar.google.com/' }
  })
