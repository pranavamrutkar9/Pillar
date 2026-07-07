import { Redis } from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  retryStrategy(times) {
    console.warn(`[Redis] Retrying connection (${times})...`);
    return Math.min(times * 1000, 10000); // Exponential backoff, max 10s
  }
})

redis.on('error', (err: any) => {
  // Suppress ECONNRESET spam from ioredis
  if (err.code === 'ECONNRESET' || err.message.includes('ECONNRESET')) return;
  console.warn('[Redis Socket Error]', err.message);
});
