import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.workspace.create({
      data: {
        name: 'Test',
        slug: 'test-' + Date.now(),
        ownerId: 'cm5tsu3t40001000000000000', 
        members: {
          create: {
            userId: 'cm5tsu3t40001000000000000',
            role: 'ADMIN',
          },
        },
      },
    });
    console.log('Success!');
  } catch (err: any) {
    console.error('Error message:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
