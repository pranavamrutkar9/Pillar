import { emit } from './src/events/eventBus.js'
import { prisma } from './src/db/client.js'
import { redis } from './src/lib/redis.js'
import { activityQueue, realtimeQueue, notificationQueue } from './src/events/eventBus.js'
import './src/workers/activityWorker.js'

async function run() {
  console.log('Emitting test event...')
  
  await emit('IssueCreated', {
    issueId: '123',
    title: 'Test issue'
  })

  console.log('Event emitted. Waiting for workers to process...')
  
  // Wait a bit for the background jobs to process
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  })
  
  console.log('Latest event in DB:', events)
  
  await prisma.$disconnect()
  await activityQueue.close()
  await realtimeQueue.close()
  await notificationQueue.close()
  await redis.quit()
  
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
