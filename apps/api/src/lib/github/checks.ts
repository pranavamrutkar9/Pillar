import { installation } from "./installation.js";

export const checks = {
  /**
   * List check runs for a specific ref (branch/commit)
   */
  async listForRef(installationId: string, owner: string, repo: string, ref: string) {
    const octokit = await installation.getOctokit(installationId);
    const { data } = await octokit.rest.checks.listForRef({ owner, repo, ref });
    return data;
  }
};
