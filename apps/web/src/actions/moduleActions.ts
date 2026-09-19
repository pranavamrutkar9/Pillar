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

export async function getModulesAction(projectId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/modules`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function getModuleByIdAction(projectId: string, moduleId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/modules/${moduleId}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export async function createModuleAction(projectId: string, payload: { name: string; description?: string }) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/modules`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to create module");
  }

  revalidatePath(`/projects/${projectId}/modules`);
  return data.data;
}

export async function updateModuleAction(projectId: string, moduleId: string, payload: any) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/modules/${moduleId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to update module");
  }

  revalidatePath(`/projects/${projectId}/modules`);
  revalidatePath(`/projects/${projectId}/modules/${moduleId}`);
  return data.data;
}

export async function getModuleProgressAction(projectId: string, moduleId: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  const headers = await getApiHeaders();
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/modules/${moduleId}/progress`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}
