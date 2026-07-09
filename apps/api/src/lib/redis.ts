import { Redis } from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
})

redis.on('error', (err: any) => {
  // Suppress ECONNRESET spam from ioredis
  if (err.code === 'ECONNRESET' || err.message.includes('ECONNRESET')) return;
  console.warn('[Redis Socket Error]', err.message);
});
