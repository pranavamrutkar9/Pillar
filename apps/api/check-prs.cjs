require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pullRequest.count().then(c => console.log('Historical PRs fetched:', c)).catch(console.error).finally(() => prisma.$disconnect());
