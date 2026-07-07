import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'
import { prisma } from '../db/client.js'

export const activityWorker = new Worker('pillar-activity', async (job) => {
  const eventType = job.name
  const payload = job.data

  console.log(`[ActivityWorker] Processing ${eventType}`)

  const { workspaceId, projectId, actorId, ...rest } = payload

  await prisma.event.create({
    data: {
      eventType,
      workspaceId,
      projectId,
      actorId,
      payload: rest
    }
  })
}, { connection: redis as any })

activityWorker.on('error', (err: any) => {
  if (err.message && err.message.includes('ECONNRESET')) return;
  console.error('[ActivityWorker Error]', err);
})
