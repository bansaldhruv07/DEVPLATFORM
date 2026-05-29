import RedisClient from '../config/redis';

class CacheService {
  private redis = RedisClient.getInstance();
  private defaultTTL = 3600; // 1 hour in seconds

  // Set a value with optional TTL
  async set(key: string, value: any, ttl = this.defaultTTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      // Cache failures should NEVER break the app
      console.error('Cache set error:', error);
    }
  }

  // Get a value (returns null if missing/expired)
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete a key
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const count = await this.redis.exists(key);
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  // Cache-aside pattern: get from cache, or fetch + store
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl = this.defaultTTL
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      console.log(`📦 Cache HIT: ${key}`);
      return cached;
    }

    // Cache miss — fetch from source
    console.log(`🔍 Cache MISS: ${key}`);
    const fresh = await fetchFn();

    // Store in cache (non-blocking)
    this.set(key, fresh, ttl).catch(() => {});

    return fresh;
  }

  // Build consistent cache keys
  static keys = {
    repoAnalysis: (owner: string, repo: string) =>
      `repo:analysis:${owner}:${repo}`,
    repoLanguages: (owner: string, repo: string) =>
      `repo:languages:${owner}:${repo}`,
    repoHealth: (owner: string, repo: string) =>
      `repo:health:${owner}:${repo}`,
    aiJob: (jobId: string) => `ai:job:${jobId}`,
    rateLimitUser: (userId: string) => `ratelimit:user:${userId}`,
  };
}

const cacheServiceInstance = new CacheService();
export { CacheService }; // Named export for static keys
export default cacheServiceInstance;