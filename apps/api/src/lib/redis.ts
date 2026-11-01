import { Redis } from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  retryStrategy(times) {
    // Backoff capped at 10s to prevent aggressive spamming when Redis is disconnected
    return Math.min(times * 1000, 10000);
  },
})

let lastConnectionWarnTime = 0;

export function handleRedisError(context: string, err: any) {
  // Suppress connection aborted / reset noise from ioredis
  if (
    err.code === 'ECONNRESET' ||
    err.code === 'ECONNABORTED' ||
    (err.message && (err.message.includes('ECONNRESET') || err.message.includes('ECONNABORTED')))
  ) {
    return;
  }

  // Throttle ECONNREFUSED so it prints at most once every 30 seconds rather than flooding the console
  if (err.code === 'ECONNREFUSED' || (err.message && err.message.includes('ECONNREFUSED'))) {
    const now = Date.now();
    if (now - lastConnectionWarnTime > 30000) {
      lastConnectionWarnTime = now;
      console.warn(`[Redis Connection Warning] Cannot connect to Redis at ${env.REDIS_URL}. Background workers and queue operations are paused until Redis is reachable.`);
    }
    return;
  }

  console.error(`[${context} Error]`, err.message || err);
}

redis.on('error', (err: any) => {
  handleRedisError('Redis Socket', err);
});
