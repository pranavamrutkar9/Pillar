import { Queue } from 'bullmq'
import { redis } from '../lib/redis.js'

const redisEnabled = !!process.env.REDIS_URL;

// We create separate queues for each domain so they can be processed independently
export const activityQueue = redisEnabled ? new Queue('pillar-activity', { connection: redis as any }) : null;
export const realtimeQueue = redisEnabled ? new Queue('pillar-realtime', { connection: redis as any }) : null;
export const notificationQueue = redisEnabled ? new Queue('pillar-notification', { connection: redis as any }) : null;

export async function emit(eventType: string, payload: any) {
  if (!redisEnabled) {
    console.log(`[EventBus] Redis disabled, skipping event: ${eventType}`);
    return;
  }

  const jobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  }

  // Fan-out: push the same event data to all queues
  await Promise.all([
    activityQueue!.add(eventType, payload, jobOptions),
    realtimeQueue!.add(eventType, payload, jobOptions),
    notificationQueue!.add(eventType, payload, jobOptions),
  ])
  
  console.log(`[EventBus] Emitted event: ${eventType}`)
}
