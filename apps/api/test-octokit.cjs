require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { githubApp } = require('./src/lib/github/index.ts'); // Can't require TS again directly.

async function test() {
  const repo = await prisma.githubRepository.findUnique({
    where: { id: 'cmu7ax3fl00021parcpl8xn6r' },
    include: { installation: true }
  });
  console.log('Installation ID:', repo.installation.installationId);
}
test().finally(() => prisma.$disconnect());
