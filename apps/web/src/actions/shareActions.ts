"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createProjectShareAction(workspaceId: string, projectId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/projects/${projectId}/shares`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || data.message || "Failed to create share link");
  }

  // we can revalidate the project page if needed
  return data.data;
}

export async function getProjectSharesAction(workspaceId: string, projectId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/projects/${projectId}/shares`, {
    method: "GET",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  const data = await res.json();
  return data.success ? data.data : [];
}

export async function revokeProjectShareAction(workspaceId: string, projectId: string, shareId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/projects/${projectId}/shares/${shareId}`, {
    method: "DELETE",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || data.message || "Failed to revoke share link");
  }

  return true;
}
