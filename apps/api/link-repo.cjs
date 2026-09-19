require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.project.findMany();
  const repos = await prisma.githubRepository.findMany();
  console.log('Projects:', projects.map(p => ({ id: p.id, name: p.name })));
  console.log('Repos:', repos.map(r => ({ id: r.id, name: r.name, fullName: r.fullName })));
  if (projects.length > 0 && repos.length > 0) {
    await prisma.project.update({
      where: { id: projects[0].id },
      data: { githubRepositoryId: repos[0].id }
    });
    console.log('Linked repo', repos[0].fullName, 'to project', projects[0].name);
  } else {
    console.log('Missing project or repository to link.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
