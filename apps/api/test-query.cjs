const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe("SELECT 1")
  .then(() => console.log("Success!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
