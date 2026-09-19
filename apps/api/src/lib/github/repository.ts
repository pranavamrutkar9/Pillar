import { installation } from "./installation.js";

export const repository = {
  /**
   * Fetch details of a repository
   */
  async get(installationId: string, owner: string, repo: string) {
    const octokit = await installation.getOctokit(installationId);
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return data;
  },
  
  /**
   * List repositories accessible to the installation
   */
  async listAccessible(installationId: string) {
    const octokit = await installation.getOctokit(installationId);
    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
    return data.repositories;
  },

  /**
   * Fetch recent commits for a repository
   */
  async getRecentCommits(installationId: string, owner: string, repo: string, per_page = 200) {
    const octokit = await installation.getOctokit(installationId);
    const { data } = await octokit.rest.repos.listCommits({ owner, repo, per_page });
    return data;
  },
  
  /**
   * Fetch default branch information
   */
  async getBranch(installationId: string, owner: string, repo: string, branch: string) {
    const octokit = await installation.getOctokit(installationId);
    const { data } = await octokit.rest.repos.getBranch({ owner, repo, branch });
    return data;
  }
};
