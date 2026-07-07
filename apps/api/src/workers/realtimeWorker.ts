import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'

export const realtimeWorker = new Worker('pillar-realtime', async (job) => {
  const eventType = job.name
  const payload = job.data

  console.log(`[RealtimeWorker] Stub: would broadcast ${eventType} via websockets/SSE`, payload)
}, { connection: redis as any })

realtimeWorker.on('error', (err: any) => {
  if (err.message && err.message.includes('ECONNRESET')) return;
  console.error('[RealtimeWorker Error]', err);
})
