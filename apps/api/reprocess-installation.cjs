require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Wait, I can't require a TS file directly without ts-node or tsx.
// Let's just execute the logic directly here for the missed events!
async function main() {
  const events = await prisma.githubWebhookEvent.findMany({ where: { event: 'installation' } });
  
  for (const e of events) {
    if (e.payload.action !== 'created') continue;
    const { installation, repositories } = e.payload;
    const installationId = installation.id.toString();
    const accountName = installation.account.login;
    const accountType = installation.account.type;
    const ownerId = installation.account.id.toString();
    
    console.log(`Processing installation ${installationId}`);
    
    const inst = await prisma.githubInstallation.upsert({
      where: { installationId },
      update: { accountName, accountType, ownerId },
      create: { installationId, accountName, accountType, ownerId },
    });

    if (repositories && Array.isArray(repositories)) {
      for (const repo of repositories) {
        const githubRepoId = repo.id.toString();
        const fullName = repo.full_name;
        const owner = fullName.split('/')[0];
        
        await prisma.githubRepository.upsert({
          where: { githubRepoId },
          update: {
            name: repo.name,
            fullName: fullName,
            owner: owner,
            visibility: repo.private ? 'private' : 'public',
          },
          create: {
            installationId: inst.id,
            githubRepoId,
            ownerId: ownerId,
            owner: owner,
            name: repo.name,
            fullName: fullName,
            visibility: repo.private ? 'private' : 'public',
          },
        });
        console.log(`Saved repository ${fullName}`);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
