import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    redisClient.on('error', (err) => {
      // Non-fatal: availability checks degrade gracefully without Redis
      if (!env.isTest) {
        console.warn('[shopping-service] Redis error (non-fatal):', err.message);
      }
    });
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/** Cache-aside helper with automatic JSON serialization. Returns null on any error. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getRedis().get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // silently ignore — Redis is a cache, not the source of truth
  }
}
