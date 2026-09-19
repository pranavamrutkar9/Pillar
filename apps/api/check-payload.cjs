require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.githubWebhookEvent.findFirst({ orderBy: { receivedAt: 'desc' } })
  .then(event => {
    if(event.event === 'pull_request') {
      const pr = event.payload.pull_request;
      console.log('Title:', pr.title);
      console.log('Body:', pr.body);
    }
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
