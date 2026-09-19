"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get("next-auth.session-token")?.value || 
         cookieStore.get("__Secure-next-auth.session-token")?.value;
}

export async function updateGithubSettingsAction(projectId: string, data: { githubRepositoryId?: string | null, githubMergedStatusId?: string | null }) {
  const sessionToken = await getSessionToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/projects/${projectId}/github`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("updateGithubSettingsAction error response:", res.status, text);
    let errorMsg = "Failed to update github settings";
    try {
      const json = JSON.parse(text);
      errorMsg = json.error?.message || json.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export async function triggerGithubSyncAction(projectId: string) {
  const sessionToken = await getSessionToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/projects/${projectId}/github/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("triggerGithubSyncAction error response:", res.status, text);
    let errorMsg = "Failed to trigger sync";
    try {
      const json = JSON.parse(text);
      errorMsg = json.error?.message || json.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export async function getProjectPullRequestsAction(projectId: string) {
  const sessionToken = await getSessionToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/projects/${projectId}/pull-requests`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch pull requests");
  }

  return res.json();
}
