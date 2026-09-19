import { prisma } from "../../db/client.js";
import { emit as publishToQueue } from "../../events/eventBus.js";

export async function handleIssueEvent(eventType: string, payload: any) {
  // Only process PR merged events
  if (eventType !== "github.pr.merged") return;

  const { pullRequestId, repositoryId } = payload;
  if (!pullRequestId || !repositoryId) return;

  // Find the internal PR
  const pr = await prisma.pullRequest.findFirst({
    where: { githubId: pullRequestId },
    include: { issues: { include: { issue: { include: { project: true } } } } }
  });

  if (!pr) return;

  // Transition issues if project has githubMergedStatusId set
  for (const link of pr.issues) {
    const issue = link.issue;
    const project = issue.project;

    if (project.githubMergedStatusId && issue.statusId !== project.githubMergedStatusId) {
      // Find the status to ensure it exists
      const targetStatus = await prisma.issueStatus.findUnique({
        where: { id: project.githubMergedStatusId }
      });

      if (targetStatus) {
        // Update issue status
        await prisma.issue.update({
          where: { id: issue.id },
          data: { statusId: targetStatus.id }
        });

        // Add activity record (simulate what issue.service does or directly add to DB)
        // Here we just emit to the event bus so notification/activity worker handles it
        // Or directly create activity:
        await prisma.issueActivity.create({
          data: {
            issueId: issue.id,
            actorId: project.createdBy, // We can use the project creator as the actor, or a system user
            action: "STATUS_UPDATED",
            oldValue: { statusId: issue.statusId },
            newValue: { statusId: targetStatus.id, reason: `PR #${pr.number} merged` }
          }
        });

        console.log(`[GithubIssueWorker] Transitioned issue ${issue.sequenceId} to ${targetStatus.name}`);
      }
    }
  }
}
