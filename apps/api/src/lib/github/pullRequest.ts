import { installation } from "./installation.js";

export const pullRequest = {
  /**
   * Fetch a single PR by its number
   */
  async get(installationId: string, owner: string, repo: string, pull_number: number) {
    const octokit = await installation.getOctokit(installationId);
    const { data } = await octokit.rest.pulls.get({ owner, repo, pull_number });
    return data;
  },

  /**
   * List PRs for a repository
   */
  async list(installationId: string, owner: string, repo: string, state: "open" | "closed" | "all" = "all") {
    const octokit = await installation.getOctokit(installationId);
    const { data } = await octokit.rest.pulls.list({ owner, repo, state, per_page: 100 });
    return data;
  }
};
