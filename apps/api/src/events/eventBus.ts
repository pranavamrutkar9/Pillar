import { Queue } from 'bullmq'
import { redis } from '../lib/redis.js'

// We create separate queues for each domain so they can be processed independently
export const activityQueue = new Queue('pillar-activity', { connection: redis as any })
export const realtimeQueue = new Queue('pillar-realtime', { connection: redis as any })
export const notificationQueue = new Queue('pillar-notification', { connection: redis as any })

/**
 * Our "Event Bus" abstraction. It takes an event and fans it out 
 * to all the relevant queues.
 */
export async function emit(eventType: string, payload: any) {
  const jobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  }

  // Fan-out: push the same event data to all queues
  await Promise.all([
    activityQueue.add(eventType, payload, jobOptions),
    realtimeQueue.add(eventType, payload, jobOptions),
    notificationQueue.add(eventType, payload, jobOptions),
  ])
  
  console.log(`[EventBus] Emitted event: ${eventType}`)
}
