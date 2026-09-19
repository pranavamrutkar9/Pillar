require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.githubWebhookEvent.findMany({ orderBy: { receivedAt: 'desc' }, take: 5 })
  .then(events => console.log(JSON.stringify(events.map(e => ({ id: e.id, event: e.event, action: e.action, receivedAt: e.receivedAt, processedAt: e.processedAt, error: e.error })), null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
