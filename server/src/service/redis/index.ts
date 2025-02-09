import { Redis } from '@upstash/redis'
import config from '@server/config'


const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
})

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key)
    return data ? (JSON.parse(data as string) as T) : null
  } catch (error) {
    console.error('Error retrieving cache:', error)
    return null
  }
}

export const setCache = async (
  key: string,
  value: any,
  ttl: number
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl })
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}
