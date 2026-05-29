import Redis from 'ioredis';

class RedisClient {
  private static instance: Redis;
  private static isConnected = false;

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const redisUrl = process.env.REDIS_URL;

      RedisClient.instance = redisUrl
        ? new Redis(redisUrl, { maxRetriesPerRequest: null })
        : new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: null, // Required by BullMQ
            retryStrategy: (times) => {
              if (times > 5) {
                console.error('❌ Redis: Max retries reached');
                return null; // Stop retrying
              }
              return Math.min(times * 200, 2000); // Exponential backoff
            },
          });

      RedisClient.instance.on('connect', () => {
        RedisClient.isConnected = true;
        console.log('✅ Redis connected');
      });

      RedisClient.instance.on('error', (err) => {
        RedisClient.isConnected = false;
        console.error('❌ Redis error:', err.message);
      });

      RedisClient.instance.on('reconnecting', () => {
        console.warn('⚠️ Redis reconnecting...');
      });
    }

    return RedisClient.instance;
  }

  public static getStatus(): boolean {
    return RedisClient.isConnected;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      console.log('🔌 Redis disconnected');
    }
  }
}

export default RedisClient;