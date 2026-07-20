"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createIssueAction(projectId: string, data: any) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/issues`, {
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
    throw new Error(resData.error?.message || "Failed to create issue");
  }

  revalidatePath(`/projects/${projectId}/issues`);
  return resData.data;
}

export async function getIssuesAction(projectId: string, viewerToken?: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const headers: any = {
    ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
  };
  
  if (viewerToken) {
    headers['x-viewer-token'] = viewerToken;
  }
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/issues`, {
    method: "GET",
    headers,
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function getIssueByIdAction(projectId: string, issueId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/issues/${issueId}`, {
    method: "GET",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export async function getIssueBySequenceIdAction(projectId: string, sequenceId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/issues/seq/${sequenceId}`, {
    method: "GET",
    headers: {
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export async function updateIssueAction(projectId: string, issueId: string, data: any) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/issues/${issueId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();

  if (!res.ok || !resData.success) {
    throw new Error(resData.error?.message || "Failed to update issue");
  }

  revalidatePath(`/projects/${projectId}/issues`, 'layout');
  return resData.data;
}

export async function moveIssueAction(projectId: string, issueId: string, data: { statusId: string, position: number }) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;
    
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/projects/${projectId}/issues/${issueId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();

  if (!res.ok || !resData.success) {
    throw new Error(resData.error?.message || "Failed to move issue");
  }

  // Realtime will handle state updates but revalidate to ensure cache is correct on refresh
  // revalidatePath(`/projects/${projectId}/issues`, 'layout');
  return resData.data;
}
