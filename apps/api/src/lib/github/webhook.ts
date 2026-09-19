import { verify } from "@octokit/webhooks-methods";

export const webhook = {
  /**
   * Verify the GitHub Webhook signature.
   */
  async verifySignature(payload: string, signature: string): Promise<boolean> {
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "";
    if (!secret) return false;
    
    try {
      return await verify(secret, payload, signature);
    } catch (e) {
      return false;
    }
  }
};
