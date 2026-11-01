import { Worker } from "bullmq";
import { redis, handleRedisError } from "../lib/redis.js";
import { handleLinkEvent } from "./github/githubLinkWorker.js";
import { handleIssueEvent } from "./github/githubIssueWorker.js";
import { handleSyncEvent } from "./github/githubSyncWorker.js";
import { handleInstallationEvent } from "./github/githubInstallationWorker.js";

export const githubWorker = new Worker("pillar-github", async (job) => {
  const eventType = job.name;
  const payload = job.data;
  console.log(`[GithubWorker] Processing ${eventType}`);

  // Route to specific handlers
  await handleLinkEvent(eventType, payload);
  await handleIssueEvent(eventType, payload);
  await handleSyncEvent(eventType, payload);
  await handleInstallationEvent(eventType, payload);
  
}, { connection: redis as any });

githubWorker.on("error", (err: any) => {
  handleRedisError("GithubWorker", err);
});
