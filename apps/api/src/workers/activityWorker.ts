import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'
import { prisma } from '../db/client.js'

export const activityWorker = new Worker('pillar-activity', async (job) => {
  const eventType = job.name
  const payload = job.data

  console.log(`[ActivityWorker] Processing ${eventType}`)

  // TODO: In the future, this worker can be used to generate specific Audit Log records
  // or aggregate notifications. The raw Event is already persisted synchronously by event.service.ts.
}, { connection: redis as any })

activityWorker.on('error', (err: any) => {
  if (err.message && err.message.includes('ECONNRESET')) return;
  console.error('[ActivityWorker Error]', err);
})
