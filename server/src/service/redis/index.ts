import { Redis } from '@upstash/redis';
import config from '@server/config';

const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (data) {
      // eslint-disable-next-line no-console
      console.log(`Cache hit for key: ${key}`);
      return JSON.parse(data as string) as T;
    }
    // eslint-disable-next-line no-console
    console.log(`Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error retrieving cache:', error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: any,
  ttl: number
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
    // eslint-disable-next-line no-console
    console.log(`Cache set for key: ${key} with TTL: ${ttl}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error setting cache:', error);
  }
};
