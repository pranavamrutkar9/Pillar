import { Redis } from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
})

redis.on('error', (err: any) => {
  // Suppress ECONNRESET and ECONNABORTED spam from ioredis
  if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED' || (err.message && (err.message.includes('ECONNRESET') || err.message.includes('ECONNABORTED')))) return;
  console.warn('[Redis Socket Error]', err.message);
});
