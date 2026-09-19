"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const getApiHeaders = async () => {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  return {
    "Content-Type": "application/json",
    ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
  };
};

export async function getCyclesAction(projectId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/cycles`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function getCycleByIdAction(projectId: string, cycleId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/cycles/${cycleId}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export async function createCycleAction(projectId: string, payload: { name: string; description?: string; startsAt: string; endsAt: string }) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/cycles`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to create cycle");
  }

  revalidatePath(`/projects/${projectId}/cycles`);
  return data.data;
}

export async function updateCycleAction(projectId: string, cycleId: string, payload: any) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/cycles/${cycleId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to update cycle");
  }

  revalidatePath(`/projects/${projectId}/cycles`);
  revalidatePath(`/projects/${projectId}/cycles/${cycleId}`);
  return data.data;
}

export async function startCycleAction(projectId: string, cycleId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/cycles/${cycleId}/start`, {
    method: "POST",
    headers,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to start cycle");
  }

  revalidatePath(`/projects/${projectId}/cycles`);
  revalidatePath(`/projects/${projectId}/cycles/${cycleId}`);
  return data.data;
}

export async function completeCycleAction(projectId: string, cycleId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/cycles/${cycleId}/complete`, {
    method: "POST",
    headers,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to complete cycle");
  }

  revalidatePath(`/projects/${projectId}/cycles`);
  revalidatePath(`/projects/${projectId}/cycles/${cycleId}`);
  return data.data;
}

export async function getCycleAnalyticsAction(projectId: string, cycleId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/cycles/${cycleId}/analytics`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}
