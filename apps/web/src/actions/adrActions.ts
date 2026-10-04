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

export async function createAdrAction(projectId: string, data: { title: string, context: string, decision: string, alternatives?: string, consequences?: string }) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/adrs`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to create ADR");

  revalidatePath(`/projects/${projectId}/adrs`);
  return resData.data;
}

export async function updateAdrStatusAction(projectId: string, adrId: string, status: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/adrs/${adrId}/status`, {
    method: "PATCH",
    headers: await getHeaders(),
    body: JSON.stringify({ status }),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to update ADR status");

  revalidatePath(`/projects/${projectId}/adrs`);
  revalidatePath(`/projects/${projectId}/adrs/${adrId}`);
  return resData.data;
}

export async function supersedeAdrAction(projectId: string, oldAdrId: string, replacementAdrId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/adrs/${oldAdrId}/supersede`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ replacementAdrId }),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to supersede ADR");

  revalidatePath(`/projects/${projectId}/adrs`);
  revalidatePath(`/projects/${projectId}/adrs/${oldAdrId}`);
  revalidatePath(`/projects/${projectId}/adrs/${replacementAdrId}`);
  return resData.data;
}

export async function getAdrsAction(projectId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/adrs`, {
    headers: await getHeaders(),
    cache: "no-store",
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) throw new Error(resData.error?.message || "Failed to fetch ADRs");

  return resData.data;
}

export async function getAdrAction(projectId: string, adrId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/adrs/${adrId}`, {
    headers: await getHeaders(),
    cache: "no-store",
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    console.error("getAdrAction failed:", res.status, resData);
    throw new Error(resData.error?.message || "Failed to fetch ADR");
  }

  return resData.data;
}
