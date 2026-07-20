import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    console.log('Testing with user ID:', user.id);

    await prisma.workspace.create({
      data: {
        name: 'Test',
        slug: 'test-' + Date.now(),
        ownerId: user.id, 
        members: {
          create: {
            userId: user.id,
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
