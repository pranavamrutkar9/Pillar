import { App } from "octokit";
import { env } from "../../config/env.js";

const appId = process.env.GITHUB_APP_ID;
const privateKey = process.env.GITHUB_PRIVATE_KEY;

if (!appId || !privateKey) {
  console.warn("⚠️  GITHUB_APP_ID or GITHUB_PRIVATE_KEY is missing. GitHub App integration will not work properly.");
}

// We use the App class from Octokit which automatically handles JWT generation
// and Installation Access Tokens for GitHub Apps.
export const githubApp = new App({
  appId: appId || "1",
  privateKey: privateKey?.replace(/\\n/g, "\n") || "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----",
  webhooks: {
    secret: process.env.GITHUB_WEBHOOK_SECRET || "dummy",
  },
});

export * from "./installation.js";
export * from "./repository.js";
export * from "./pullRequest.js";
export * from "./checks.js";
export * from "./webhook.js";
