"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const getApiUrl = () => process.env.API_URL || 'http://localhost:4000';

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

export async function createStatusAction(projectId: string, data: any) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/statuses`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error?.message || "Failed to create status");
  revalidatePath(`/projects/${projectId}`, 'layout');
  return resData.data;
}

export async function updateStatusAction(projectId: string, statusId: string, data: any) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/statuses/${statusId}`, {
    method: "PATCH",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error?.message || "Failed to update status");
  revalidatePath(`/projects/${projectId}`, 'layout');
  return resData.data;
}

export async function deleteStatusAction(projectId: string, statusId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/statuses/${statusId}`, {
    method: "DELETE",
    headers: await getHeaders(),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || resData.error?.message || "Failed to delete status");
  revalidatePath(`/projects/${projectId}`, 'layout');
  return resData.data;
}

export async function reorderStatusesAction(projectId: string, statuses: {id: string, position: number}[]) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/statuses/reorder`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify({ statuses }),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error?.message || "Failed to reorder statuses");
  revalidatePath(`/projects/${projectId}`, 'layout');
  return resData.data;
}

export async function createLabelAction(projectId: string, data: any) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/labels`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error?.message || "Failed to create label");
  revalidatePath(`/projects/${projectId}`, 'layout');
  return resData.data;
}

export async function updateLabelAction(projectId: string, labelId: string, data: any) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/labels/${labelId}`, {
    method: "PATCH",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error?.message || "Failed to update label");
  revalidatePath(`/projects/${projectId}`, 'layout');
  return resData.data;
}

export async function deleteLabelAction(projectId: string, labelId: string) {
  const res = await fetch(`${getApiUrl()}/api/projects/${projectId}/labels/${labelId}`, {
    method: "DELETE",
    headers: await getHeaders(),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error?.message || "Failed to delete label");
  revalidatePath(`/projects/${projectId}`, 'layout');
  return resData.data;
}
