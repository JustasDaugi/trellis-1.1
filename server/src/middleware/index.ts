import { getCache, setCache, invalidateCache } from '@server/service/redis'
import logger from '@server/utils/logger/logger'

type CacheMiddlewareOptions = {
  key: ({ input, ctx }: { input: unknown; ctx: any }) => string
  ttl: number
  invalidate?: boolean
  bypass?: boolean
}

const tryCall = async <T>(
  action: () => Promise<T>,
  errorMsg: string
): Promise<T | null> => {
  try {
    return await action()
  } catch (error: any) {
    logger.error(`${errorMsg}: ${error?.message || error}`)
    return null
  }
}

export const cacheMiddleware = (options: CacheMiddlewareOptions) => {
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

    if (!options.invalidate && !options.bypass) {
      const cachedData = await tryCall(
        () => getCache<any>(cacheKey),
        `Error retrieving cache for key ${cacheKey}`
      )
      if (cachedData) {
        logger.info(`Cache hit for key ${cacheKey}`)
        return cachedData
      }
      logger.info(`Cache miss for key ${cacheKey}`)
    }

    const result = await next()

    if (options.invalidate) {
      logger.info(`Invalidating cache for key ${cacheKey}`)
      await tryCall(
        () => invalidateCache(cacheKey),
        `Error invalidating cache for key ${cacheKey}`
      )
      logger.info(`Cache invalidated for key ${cacheKey}`)
    } else {
      logger.info(`Attempting to cache response for key ${cacheKey}`)
      await tryCall(
        () => setCache(cacheKey, result, options.ttl),
        `Error setting cache for key ${cacheKey}`
      )
      logger.info(`Response cached for key ${cacheKey} with TTL ${options.ttl}`)
    }

    return result
  }
}
