// import { createClient } from 'redis';

// const rawHost = process.env.REDIS_HOST

// let redisUrl: string;
// if (rawHost.startsWith('redis://') || rawHost.startsWith('rediss://')) {
//   // Use the host value as-is if it already includes a protocol.
//   redisUrl = rawHost;
// } else {
//   // Otherwise, add the rediss protocol and port.
//   redisUrl = `rediss://${rawHost}:6379`;
// }

// const pubClient = createClient({ url: redisUrl });

// pubClient.on('error', (err) => {
//   console.error('Redis error:', err);
// });

// pubClient.connect().catch(console.error);

// export const getCache = async <T>(key: string): Promise<T | null> => {
//   try {
//     const data = await pubClient.get(key);
//     return data ? (JSON.parse(data) as T) : null;
//   } catch (error) {
//     console.error('Error retrieving cache:', error);
//     return null;
//   }
// };

// export const setCache = async (
//   key: string,
//   value: any,
//   ttl: number
// ): Promise<void> => {
//   try {
//     await pubClient.setEx(key, ttl, JSON.stringify(value));
//   } catch (error) {
//     console.error('Error setting cache:', error);
//   }
// };







import { createClient } from 'redis'

const redisHost = process.env.REDIS_HOST

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: 6379, // non-TLS port
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


