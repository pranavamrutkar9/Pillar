import { prisma } from "../../db/client.js";
import { repository } from "../../lib/github/repository.js";
import { pullRequest } from "../../lib/github/pullRequest.js";
import { emit as publishToQueue } from "../../events/eventBus.js";

export async function handleSyncEvent(eventType: string, payload: any) {
  if (eventType !== "github.repo.synced" && eventType !== "github.repo.connected") return;

  const { repositoryId, installationId, owner, repo } = payload;
  if (!repositoryId || !installationId || !owner || !repo) return;

  const repoRecord = await prisma.githubRepository.findUnique({
    where: { githubRepoId: repositoryId },
    include: { installation: true }
  });

  if (!repoRecord || !repoRecord.installation) return;

  const actualInstallationId = repoRecord.installation.installationId;

  // Create Sync Job
  const syncJob = await prisma.repositorySyncJob.create({
    data: {
      repositoryId: repoRecord.id,
      type: eventType === "github.repo.connected" ? "INITIAL" : "MANUAL",
      status: "RUNNING"
    }
  });

  await prisma.githubRepository.update({
    where: { id: repoRecord.id },
    data: { syncStatus: "SYNCING" }
  });

  try {
    let prsCount = 0;
    
    // 1. Fetch recent commits (to update lastCommit fields on repository)
    const commits = await repository.getRecentCommits(actualInstallationId, owner, repo, 1);
    if (commits && commits.length > 0) {
      const latestCommit = commits[0];
      await prisma.githubRepository.update({
        where: { id: repoRecord.id },
        data: {
          lastCommitSha: latestCommit.sha,
          lastCommitMessage: latestCommit.commit.message,
          lastCommitAuthor: latestCommit.commit.author?.name || latestCommit.author?.login,
          lastCommitAt: latestCommit.commit.author?.date ? new Date(latestCommit.commit.author.date) : null
        }
      });
    }

    // 2. Fetch all PRs (open and closed)
    const prs = await pullRequest.list(actualInstallationId, owner, repo, "all");
    
    for (const pr of prs) {
      prsCount++;
      // Determine state
      let state = pr.state.toUpperCase() as "OPEN" | "CLOSED" | "MERGED" | "DRAFT" | "READY_FOR_REVIEW";
      if (pr.draft) state = "DRAFT";
      if (pr.merged_at) state = "MERGED";

      const internalPr = await prisma.pullRequest.upsert({
        where: { githubId: pr.id.toString() },
        update: {
          title: pr.title,
          body: pr.body || "",
          state,
          merged: !!pr.merged_at,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          headBranch: pr.head.ref,
          baseBranch: pr.base.ref,
          headSha: pr.head.sha,
          baseSha: pr.base.sha
        },
        create: {
          githubId: pr.id.toString(),
          number: pr.number,
          repositoryId: repoRecord.id,
          title: pr.title,
          body: pr.body || "",
          url: pr.html_url,
          state,
          authorGithubId: pr.user?.id.toString() || "",
          authorGithubLogin: pr.user?.login,
          authorAvatarUrl: pr.user?.avatar_url,
          merged: !!pr.merged_at,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          headBranch: pr.head.ref,
          baseBranch: pr.base.ref,
          headSha: pr.head.sha,
          baseSha: pr.base.sha
        }
      });

      // Manually trigger link worker logic for each PR during sync
      await publishToQueue("github.pr.opened", {
        repositoryId: pr.base.repo.id.toString(),
        pullRequestId: pr.id.toString(),
        title: pr.title,
        body: pr.body
      });
    }

    // Update Sync Job Success
    await prisma.repositorySyncJob.update({
      where: { id: syncJob.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        stats: { prs: prsCount }
      }
    });

    await prisma.githubRepository.update({
      where: { id: repoRecord.id },
      data: { syncStatus: "SUCCESS", lastSyncAt: new Date() }
    });

  } catch (error: any) {
    console.error("[GithubSyncWorker] Error syncing repo", error);
    
    // Update Sync Job Failed
    await prisma.repositorySyncJob.update({
      where: { id: syncJob.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: error.message
      }
    });

    await prisma.githubRepository.update({
      where: { id: repoRecord.id },
      data: { syncStatus: "FAILED" }
    });
  }
}
