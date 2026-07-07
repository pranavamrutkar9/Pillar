import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'

export const notificationWorker = new Worker('pillar-notification', async (job) => {
  const eventType = job.name
  const payload = job.data

  console.log(`[NotificationWorker] Stub: would send email/in-app notification for ${eventType}`, payload)
}, { connection: redis as any })

notificationWorker.on('error', (err: any) => {
  if (err.message && err.message.includes('ECONNRESET')) return;
  console.error('[NotificationWorker Error]', err);
})
