import { Redis } from '@upstash/redis'
import config from '@server/config'
import logger from '@server/utils/logger/logger'

const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
})

const sanitizeKeyForLog = (key: string): string =>
  key
    .split(':')
    .filter(
      (segment, index, arr) =>
        segment !== 'user' && (index === 0 || arr[index - 1] !== 'user')
    )
    .join(':')

const sensitiveKeys = new Set(['req', 'socket', 'parser', 'server'])

const safeSerialize = (value: any): any => {
  const seen = new WeakSet()
  try {
    return JSON.parse(
      JSON.stringify(value, (key, val) => {
        if (sensitiveKeys.has(key)) {
          return undefined
        }
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            return undefined
          }
          seen.add(val)
        }
        return val
      })
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Error in safeSerialize: ${errorMessage}`)
    throw error
  }
}

export const getCache = async <T>(
  key: string,
  extendTTL?: number
): Promise<T | undefined> => {
  const sanitizedKey = sanitizeKeyForLog(key)
  try {
    logger.info(`Attempting to retrieve cache for key: ${sanitizedKey}`)
    const data = await redis.get(key)
    if (data) {
      logger.info(`Cache found for key: ${sanitizedKey}`)
      if (extendTTL) {
        logger.info(
          `Checking TTL for key: ${sanitizedKey} with extendTTL threshold: ${extendTTL}`
        )
        const currentTTL = await redis.ttl(key)
        logger.info(`Current TTL for key ${sanitizedKey}: ${currentTTL}`)
        if (currentTTL !== undefined && currentTTL < extendTTL) {
          const newTTL = extendTTL * 1.25
          logger.info(
            `TTL for key ${sanitizedKey} is below threshold. Updating TTL to: ${newTTL}`
          )
          await redis.expire(key, newTTL)
          logger.info(
            `TTL refreshed for key: ${sanitizedKey}, extended by ${newTTL} seconds`
          )
        }
      }
      return data as T
    } else {
      logger.info(`No cache entry found for key: ${sanitizedKey}`)
    }
    return undefined
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(
      `Error retrieving cache for key ${sanitizedKey}: ${errorMessage}`
    )
    return undefined
  }
}

export const setCache = async (
  key: string,
  value: any,
  ttl: number
): Promise<void> => {
  const sanitizedKey = sanitizeKeyForLog(key)
  try {
    logger.info(
      `Attempting to set cache for key: ${sanitizedKey} with TTL: ${ttl}. Value type: ${typeof value}`
    )
    const safeValue = safeSerialize(value)
    await redis.set(key, safeValue, { ex: ttl })
    logger.info(
      `Cache successfully set for key: ${sanitizedKey} with TTL: ${ttl}`
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Error setting cache for key ${sanitizedKey}: ${errorMessage}`)
  }
}

export const invalidateCache = async (key: string): Promise<void> => {
  const sanitizedKey = sanitizeKeyForLog(key)
  try {
    logger.info(`Invalidating cache for key: ${sanitizedKey}`)
    await redis.del(key)
    logger.info(`Cache invalidated for key: ${sanitizedKey}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(
      `Error invalidating cache for key ${sanitizedKey}: ${errorMessage}`
    )
  }
}
