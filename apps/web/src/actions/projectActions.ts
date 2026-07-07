"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createProjectAction(workspaceId: string, name: string, slug: string, description?: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify({ name, slug, description }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    console.error(`API Error:`, data);
    throw new Error(data.error?.message || "Failed to create project");
  }

  revalidatePath(`/workspaces/${workspaceId}/projects`);
  return data.data;
}

export async function getProjectsAction(workspaceId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/projects`, {
    method: "GET",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.success ? data.data : [];
}

export async function getProjectByIdAction(projectId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}`, {
    method: "GET",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.success ? data.data : null;
}

