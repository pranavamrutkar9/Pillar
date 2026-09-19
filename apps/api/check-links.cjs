require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pullRequestIssue.findMany({ include: { issue: { select: { sequenceId: true } }, pullRequest: { select: { title: true } } } })
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
