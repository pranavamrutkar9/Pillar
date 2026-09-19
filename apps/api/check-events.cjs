require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.githubWebhookEvent.findMany();
  console.log(JSON.stringify(events.map(x => ({ event: x.event, error: x.error, processedAt: x.processedAt })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
