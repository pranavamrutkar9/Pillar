"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  return {
    "Content-Type": "application/json",
    ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
  };
}

export async function analyzePrdAction(
  workspaceId: string,
  payload: { prdText: string }
) {
  const apiUrl = process.env.API_URL || "http://localhost:4000";
  const headers = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/ai/breakdown/analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to analyze requirements");
  }

  return data.data;
}

export async function generateBreakdownAction(
  workspaceId: string,
  payload: { prdText: string; answers?: Record<string, string> }
) {
  const apiUrl = process.env.API_URL || "http://localhost:4000";
  const headers = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/ai/breakdown/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to generate project breakdown");
  }

  return data.data;
}

export async function commitBreakdownAction(
  workspaceId: string,
  payload: { breakdown: any; idempotencyKey?: string }
) {
  const apiUrl = process.env.API_URL || "http://localhost:4000";
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(payload.idempotencyKey && { "x-idempotency-key": payload.idempotencyKey }),
  };

  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/ai/breakdown/commit`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to commit project breakdown");
  }

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath(`/workspaces/${workspaceId}/projects`);

  return data.data;
}
