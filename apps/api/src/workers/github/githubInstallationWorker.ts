import { prisma } from "../../db/client.js";

export async function handleInstallationEvent(eventType: string, payload: any) {
  if (eventType !== "github.installation.created") return;

  const { installationId, accountName, accountType, ownerId, repositories } = payload;

  console.log(`[GithubInstallationWorker] Processing installation ${installationId}`);

  // Create or update the installation
  const installation = await prisma.githubInstallation.upsert({
    where: { installationId },
    update: {
      accountName,
      accountType,
      ownerId,
    },
    create: {
      installationId,
      accountName,
      accountType,
      ownerId,
    },
  });

  // Create or update the repositories
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
          installationId: installation.id,
          githubRepoId,
          ownerId: ownerId,
          owner: owner,
          name: repo.name,
          fullName: fullName,
          visibility: repo.private ? 'private' : 'public',
        },
      });
      console.log(`[GithubInstallationWorker] Saved repository ${fullName}`);
    }
  }
}
