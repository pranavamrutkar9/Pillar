const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching events...');
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'asc' }
  });

  let deletedCount = 0;
  const seen = [];

  for (const event of events) {
    const payloadStr = JSON.stringify(event.payload);
    const key = `${event.eventType}-${event.projectId}-${event.actorId}-${payloadStr}`;
    
    // Check if we have seen this exact event within the last 2 minutes
    const duplicate = seen.find(s => 
      s.key === key && 
      (event.createdAt.getTime() - s.createdAt.getTime()) < 2 * 60 * 1000
    );

    if (duplicate) {
      console.log(`Deleting duplicate event ${event.id} (${event.eventType})`);
      await prisma.event.delete({ where: { id: event.id } });
      deletedCount++;
    } else {
      seen.push({ key, createdAt: event.createdAt });
    }
  }

  console.log(`Successfully deleted ${deletedCount} duplicate events.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
