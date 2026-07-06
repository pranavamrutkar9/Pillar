"use server";

export async function registerAction(email: string, password: string, name: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  const res = await fetch(`${apiUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to register");
  }

  const result = await res.json();
  return result;
}
