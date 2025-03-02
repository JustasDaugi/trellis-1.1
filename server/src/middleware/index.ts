import { getCache, setCache, invalidateCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

export const cacheMiddleware = (options: {
  key: ({ input, ctx }: { input: unknown; ctx: any }) => string
  ttl: number
  invalidate?: boolean
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

    if (!options.invalidate) {
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
    }

    const result = await next()

    if (options.invalidate) {
      try {
        logger.info(`Invalidating cache for key ${cacheKey}`)
        await invalidateCache(cacheKey)
        logger.info(`Cache invalidated for key ${cacheKey}`)
      } catch (error: any) {
        logger.error(
          `Error invalidating cache for key ${cacheKey}: ${error?.message || error}`
        )
      }
    } else {
      try {
        logger.info(`Attempting to cache response for key ${cacheKey}`)
        await setCache(cacheKey, result, options.ttl)
        logger.info(
          `Response cached for key ${cacheKey} with TTL ${options.ttl}`
        )
      } catch (error: any) {
        logger.error(
          `Error setting cache for key ${cacheKey}: ${error?.message || error}`
        )
      }
    }

    return result
  }
}
