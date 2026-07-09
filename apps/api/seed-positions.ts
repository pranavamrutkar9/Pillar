import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();

  for (const project of projects) {
    const statuses = await prisma.issueStatus.findMany({
      where: { projectId: project.id }
    });

    for (const status of statuses) {
      const issues = await prisma.issue.findMany({
        where: { projectId: project.id, statusId: status.id },
        orderBy: { createdAt: 'asc' }
      });

      for (let i = 0; i < issues.length; i++) {
        const position = (i + 1) * 65536; // Initial gap of 65536 between items
        await prisma.issue.update({
          where: { id: issues[i].id },
          data: { position }
        });
      }
    }
  }

  console.log('Successfully seeded positions');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
