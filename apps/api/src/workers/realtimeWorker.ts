import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'
import { Emitter } from '@socket.io/redis-emitter'

const io = new Emitter(redis as any);

export const realtimeWorker = new Worker('pillar-realtime', async (job) => {
  const eventType = job.name
  const payload = job.data

  console.log(`[RealtimeWorker] Broadcasting ${eventType} to Socket.io`)
  
  if (payload.projectId) {
    const roomName = `project:${payload.projectId}`
    io.to(roomName).emit(eventType, payload)
  }
}, { connection: redis as any })

realtimeWorker.on('error', (err: any) => {
  if (err.message && err.message.includes('ECONNRESET')) return;
  console.error('[RealtimeWorker Error]', err);
})
