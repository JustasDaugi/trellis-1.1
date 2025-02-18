import { Redis } from '@upstash/redis'
import config from '@server/config'
import logger from '@server/utils/logger/logger'

const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
})

export const getCache = async <T>(
  key: string,
  extendTTL?: number
): Promise<T | undefined> => {
  try {
    const data = await redis.get(key)
    if (data) {
      if (extendTTL) {
        const currentTTL = await redis.ttl(key)
        if (currentTTL !== undefined && currentTTL < extendTTL) {
          const defaultTTL = extendTTL * 1.25
          await redis.expire(key, defaultTTL)
          logger.info(
            `TTL refreshed for key: ${key}, extended by ${defaultTTL} seconds`
          )
        }
      }
      return JSON.parse(data as string) as T
    }
    return undefined
  } catch (error) {
    logger.error('Error retrieving cache:', error)
    return undefined
  }
}

export const setCache = async (
  key: string,
  value: any,
  ttl: number
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl })
    logger.info(`Cache set for key: ${key} with TTL: ${ttl}`)
  } catch (error) {
    logger.error('Error setting cache:', error)
  }
}
