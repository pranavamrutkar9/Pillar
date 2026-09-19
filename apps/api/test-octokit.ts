import { prisma } from './src/db/client.js';
import { installation } from './src/lib/github/installation.js';
import { repository } from './src/lib/github/repository.js';
import { pullRequest } from './src/lib/github/pullRequest.js';
import 'dotenv/config';

async function test() {
  const repo = await prisma.githubRepository.findUnique({
    where: { id: 'cmu7ax3fl00021parcpl8xn6r' },
    include: { installation: true }
  });
  console.log('Installation ID:', repo.installation.installationId);
  const actualInstallationId = repo.installation.installationId;
  
  console.log('Getting octokit...');
  const octokit = await installation.getOctokit(actualInstallationId);
  console.log('Got octokit!');

  console.log('Fetching commits...');
  const commits = await repository.getRecentCommits(actualInstallationId, repo.owner, repo.name, 1);
  console.log('Commits:', commits.length);

  console.log('Fetching PRs...');
  const prs = await pullRequest.list(actualInstallationId, repo.owner, repo.name, 'all');
  console.log('PRs:', prs.length);
}
test().catch(console.error).finally(() => prisma.$disconnect());
