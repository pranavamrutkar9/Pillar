"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createCommentAction(projectId: string, issueId: string, data: any) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/issues/${issueId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();

  if (!res.ok || !resData.success) {
    console.error(`API Error:`, resData);
    throw new Error(resData.error?.message || "Failed to create comment");
  }

  revalidatePath(`/projects/${projectId}/issues`, 'layout');
  return resData.data;
}

export async function getCommentsAction(issueId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/issues/${issueId}/comments`, {
    method: "GET",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.data : [];
}
