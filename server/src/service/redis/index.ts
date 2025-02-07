import { createClient } from 'redis'

const redisHost = process.env.REDIS_HOST

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: 6379,
  },
})

redisClient.on('error', (err) => {
  console.error('Redis error:', err)
})

redisClient.connect().catch(console.error)

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key)
    return data ? (JSON.parse(data) as T) : null
  } catch (error) {
    console.error('Error retrieving cache:', error)
    return null
  }
}

/**
 * Sets a value in the Redis cache with a given TTL.
 * @param key - Cache key.
 * @param value - Value to cache.
 * @param ttl - Time-to-live in seconds.
 */
export const setCache = async (
  key: string,
  value: any,
  ttl: number
): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}
