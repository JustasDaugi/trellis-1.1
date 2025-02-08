import { createClient } from 'redis'

const redisHost = process.env.REDIS_HOST || 'redis'

const pubClient = createClient({
  url: `rediss://${redisHost}:6379`
});


pubClient.on('error', (err) => {
  console.error('Redis error:', err)
})

pubClient.connect().catch(console.error)

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await pubClient.get(key)
    return data ? (JSON.parse(data) as T) : null
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
    await pubClient.setEx(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}
