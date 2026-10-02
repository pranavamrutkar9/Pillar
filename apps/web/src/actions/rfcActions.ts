"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const getHeaders = async () => {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  return {
    "Content-Type": "application/json",
    ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
  };
};

const getApiUrl = () => process.env.API_URL || 'http://localhost:4000';

export async function getRfcsAction(projectId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs`, {
    headers: await getHeaders(),
    cache: "no-store",
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to fetch RFCs");

  return resData.data;
}

export async function getRfcAction(projectId: string, rfcId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs/${rfcId}`, {
    headers: await getHeaders(),
    cache: "no-store",
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to fetch RFC");

  return resData.data;
}

export async function createRfcAction(projectId: string, data: { title: string, summary?: string }) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to create RFC");

  revalidatePath(`/projects/${projectId}/rfcs`);
  return resData.data;
}

export async function updateRfcStatusAction(projectId: string, rfcId: string, status: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs/${rfcId}/status`, {
    method: "PATCH",
    headers: await getHeaders(),
    body: JSON.stringify({ status }),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to update RFC status");

  revalidatePath(`/projects/${projectId}/rfcs`);
  revalidatePath(`/projects/${projectId}/rfcs/${rfcId}`);
  return resData.data;
}

export async function castVoteAction(projectId: string, rfcId: string, vote: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs/${rfcId}/vote`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ vote }),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to cast vote");

  revalidatePath(`/projects/${projectId}/rfcs/${rfcId}`);
  return resData.data;
}

export async function addRfcSectionAction(projectId: string, rfcId: string, data: { title: string, content: string, position: number }) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs/${rfcId}/sections`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to add section");

  revalidatePath(`/projects/${projectId}/rfcs/${rfcId}`);
  return resData.data;
}

export async function spawnIssuesAction(projectId: string, rfcId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs/${rfcId}/spawn-issues`, {
    method: "POST",
    headers: await getHeaders(),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to spawn issues");

  revalidatePath(`/projects/${projectId}/rfcs/${rfcId}`);
  revalidatePath(`/projects/${projectId}/issues`);
  return resData.data;
}

export async function addTaskAction(projectId: string, rfcId: string, description: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/rfcs/${rfcId}/tasks`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ description }),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to add task");

  revalidatePath(`/projects/${projectId}/rfcs/${rfcId}`);
  return resData.data;
}
