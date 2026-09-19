import { emit as publishToQueue } from "../events/eventBus.js";

// Define the payload structure for internal Github events
export type GithubEventPayload = {
  repositoryId: string;
  pullRequestId?: string;
  issueKeys?: string[];
  author?: string;
  mergedBy?: string;
  mergedAt?: string;
  requestedReviewer?: string;
  checkName?: string;
  state?: string;
  [key: string]: any;
};

export const githubService = {
  /**
   * Process and normalize raw webhook events from GitHub, then emit internally.
   */
  async processWebhookEvent(event: string, payload: any) {
    // Determine internal event name based on GitHub webhook event type and action
    const action = payload.action;
    
    // Default to pushing the raw payload for now if we don't have a specific mapping, 
    // but the workers will be designed to handle the specific ones.
    
    if (event === "pull_request") {
      const repoId = payload.repository.id.toString();
      const prId = payload.pull_request.id.toString();
      const author = payload.pull_request.user.login;
      
      const internalPayload: GithubEventPayload = {
        repositoryId: repoId,
        pullRequestId: prId,
        author,
        title: payload.pull_request.title,
        body: payload.pull_request.body,
        raw: payload.pull_request
      };

      if (action === "opened" || action === "reopened") {
        await publishToQueue("github.pr.opened", internalPayload);
      } else if (action === "closed" && payload.pull_request.merged) {
        internalPayload.mergedBy = payload.sender?.login;
        internalPayload.mergedAt = payload.pull_request.merged_at;
        await publishToQueue("github.pr.merged", internalPayload);
      } else if (action === "closed") {
        await publishToQueue("github.pr.closed", internalPayload);
      } else if (action === "review_requested") {
        internalPayload.requestedReviewer = payload.requested_reviewer?.login;
        await publishToQueue("github.review.requested", internalPayload);
      }
    } else if (event === "pull_request_review") {
      const repoId = payload.repository.id.toString();
      const prId = payload.pull_request.id.toString();
      if (action === "submitted") {
        await publishToQueue("github.review.submitted", {
          repositoryId: repoId,
          pullRequestId: prId,
          author: payload.review.user.login,
          state: payload.review.state,
          raw: payload.review
        });
      }
    } else if (event === "check_run") {
      const repoId = payload.repository.id.toString();
      await publishToQueue("github.check.updated", {
        repositoryId: repoId,
        checkName: payload.check_run.name,
        state: payload.check_run.conclusion || payload.check_run.status,
        raw: payload.check_run
      });
    } else if (event === "push") {
      const repoId = payload.repository.id.toString();
      await publishToQueue("github.push", {
        repositoryId: repoId,
        ref: payload.ref,
        commits: payload.commits,
        author: payload.sender?.login
      });
    } else if (event === "installation") {
      if (action === "created") {
        await publishToQueue("github.installation.created", {
          installationId: payload.installation.id.toString(),
          accountName: payload.installation.account.login,
          accountType: payload.installation.account.type,
          ownerId: payload.installation.account.id.toString(),
          repositories: payload.repositories
        });
      }
    }
  }
};
