import { prisma } from "../../db/client.js";

export async function handleLinkEvent(eventType: string, payload: any) {
  // Only process PR events
  if (!eventType.startsWith("github.pr.")) return;

  const { repositoryId, pullRequestId, title, body, raw } = payload;
  if (!pullRequestId || !repositoryId) return;

  let internalPrId: string | null = null;

  // Find the internal repository
  const repo = await prisma.githubRepository.findUnique({
    where: { githubRepoId: repositoryId }
  });

  if (repo && raw) {
    let state = raw.state?.toUpperCase() || "OPEN";
    if (raw.draft) state = "DRAFT";
    if (raw.merged_at || raw.merged) state = "MERGED";

    const internalPr = await prisma.pullRequest.upsert({
      where: { githubId: pullRequestId },
      update: {
        title: raw.title,
        body: raw.body || "",
        state,
        merged: !!(raw.merged_at || raw.merged),
        mergedAt: raw.merged_at ? new Date(raw.merged_at) : null,
        headBranch: raw.head?.ref || "",
        baseBranch: raw.base?.ref || "",
        headSha: raw.head?.sha || "",
        baseSha: raw.base?.sha || ""
      },
      create: {
        githubId: pullRequestId,
        number: raw.number,
        repositoryId: repo.id,
        title: raw.title,
        body: raw.body || "",
        url: raw.html_url || "",
        state,
        authorGithubId: raw.user?.id?.toString() || "",
        authorGithubLogin: raw.user?.login || "",
        authorAvatarUrl: raw.user?.avatar_url || "",
        merged: !!(raw.merged_at || raw.merged),
        mergedAt: raw.merged_at ? new Date(raw.merged_at) : null,
        headBranch: raw.head?.ref || "",
        baseBranch: raw.base?.ref || "",
        headSha: raw.head?.sha || "",
        baseSha: raw.base?.sha || ""
      }
    });
    internalPrId = internalPr.id;
  } else {
    // Fallback if raw is missing (e.g. from manual sync trigger)
    const existingPr = await prisma.pullRequest.findUnique({
      where: { githubId: pullRequestId }
    });
    if (existingPr) internalPrId = existingPr.id;
  }

  if (!internalPrId) return;

  const textToParse = `${title || ""} ${body || ""}`;
  
  // Robust case-insensitive regex for finding issue mentions like "Fixes PIL-42"
  const regex = /(?:Fixes|Fix|Closes|Close|Resolves|Resolve|Related to|Related|Refs|Ref)\s+#?([A-Za-z]+-\d+)/gi;
  let match;
  const foundIssueKeys = new Set<string>();

  while ((match = regex.exec(textToParse)) !== null) {
    foundIssueKeys.add(match[1].toUpperCase()); // Standardize to uppercase
  }

  if (foundIssueKeys.size === 0) return;

  // We need to link the PR to these issues
  // The DB uses sequenceId for the second part, and project slug for the first part (e.g. PIL-42)
  for (const key of foundIssueKeys) {
    const [projectSlug, sequenceIdStr] = key.split("-");
    const sequenceId = parseInt(sequenceIdStr, 10);
    if (isNaN(sequenceId)) continue;

    // Find the issue
    const issue = await prisma.issue.findFirst({
      where: {
        sequenceId,
        project: { slug: projectSlug }
      }
    });

    if (issue) {
      // Upsert link
      await prisma.pullRequestIssue.upsert({
        where: {
          pullRequestId_issueId: { pullRequestId: internalPrId, issueId: issue.id }
        },
        update: {},
        create: {
          pullRequestId: internalPrId,
          issueId: issue.id,
          linkedBy: "AUTO"
        }
      });
    }
  }
}
