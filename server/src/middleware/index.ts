import { getCache, setCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

export const cacheMiddleware = (options: {
  key: ({ input, ctx }: { input: unknown; ctx: any }) => string
  ttl: number
}) => {
  return async ({
    ctx,
    input,
    next,
  }: {
    ctx: any
    input: unknown
    next: () => Promise<any>
  }) => {
    const cacheKey = options.key({ input, ctx })
    logger.info(`Cache middleware triggered for key: ${cacheKey}`)

    try {
      const cachedData = await getCache<any>(cacheKey)
      if (cachedData) {
        logger.info(`Cache hit for key ${cacheKey}`)
        return cachedData
      } else {
        logger.info(`Cache miss for key ${cacheKey}`)
      }
    } catch (error: any) {
      logger.error(
        `Error retrieving cache for key ${cacheKey}: ${error?.message || error}`
      )
    }

    const result = await next()

    try {
      logger.info(`Attempting to cache response for key ${cacheKey}`)
      await setCache(cacheKey, result, options.ttl)
      logger.info(`Response cached for key ${cacheKey} with TTL ${options.ttl}`)
    } catch (error: any) {
      logger.error(
        `Error setting cache for key ${cacheKey}: ${error?.message || error}`
      )
    }

    return result
  }
}
