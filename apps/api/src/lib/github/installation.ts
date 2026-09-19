import { githubApp } from "./index.js";

export const installation = {
  /**
   * Get an authenticated octokit instance for a specific installation ID.
   */
  async getOctokit(installationId: string) {
    return await githubApp.getInstallationOctokit(Number(installationId));
  },
  
  /**
   * List installations for the app (useful for debugging/syncing).
   */
  async list() {
    const octokit = githubApp.octokit;
    const { data } = await octokit.request("GET /app/installations");
    return data;
  }
};
