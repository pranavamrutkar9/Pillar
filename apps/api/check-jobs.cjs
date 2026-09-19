require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.repositorySyncJob.findMany({ orderBy: { startedAt: 'desc' }, take: 5 })
  .then(jobs => console.log(JSON.stringify(jobs, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
