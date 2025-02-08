import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

(async () => {
  try {
    console.log(`Connecting to Redis at ${redisHost}:${redisPort}`);
    await redisClient.connect();
    console.log('Redis connection established');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.error('Error retrieving cache:', error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

