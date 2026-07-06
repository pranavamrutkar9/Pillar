"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createWorkspaceAction(name: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/workspaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error (${res.status}):`, errorText);
    throw new Error("Failed to create workspace");
  }

  // Refresh the home page to show the new workspace
  revalidatePath("/");
}

export async function createInviteAction(workspaceId: string, email: string, role: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/invites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify({ email, role }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create invite");
  }

  const data = await res.json();
  return data;
}

export async function acceptInviteAction(token: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/invites/${token}/accept`, {
    method: "POST",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to accept invite");
  }

  revalidatePath("/");
  return await res.json();
}
