require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const projectId = 'cmrjbrmp4000b4qfis206ic4g';
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  console.log('project.githubRepositoryId:', project.githubRepositoryId);
  
  if (!project?.githubRepositoryId) throw new Error("No repository linked");

  const repo = await prisma.githubRepository.findUnique({
    where: { id: project.githubRepositoryId }
  });
  
  console.log('repo:', repo);

  if (!repo) throw new Error("Repository not found");
}
main().catch(console.error).finally(() => prisma.$disconnect());
