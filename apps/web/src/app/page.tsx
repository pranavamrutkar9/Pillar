import Image from "next/image";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { SignInButton, SignOutButton } from "../components/AuthButtons";
import { WorkspaceForm } from "../components/WorkspaceForm";
import { InviteForm } from "../components/InviteForm";
import { AuthForms } from "../components/AuthForms";
import { PendingInviteCard } from "../components/PendingInviteCard";

async function getWorkspaces() {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiUrl}/api/workspaces`, {
      headers: {
        ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
      },
      cache: "no-store",
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.workspaces || [];
    }
  } catch (err) {
    console.error("Failed to fetch workspaces:", err);
  }
  return [];
}

async function getPendingInvites() {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiUrl}/api/invites/pending`, {
      headers: {
        ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
      },
      cache: "no-store",
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.invites || [];
    }
  } catch (err) {
    console.error("Failed to fetch pending invites:", err);
  }
  return [];
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  let workspaces = [];
  let pendingInvites = [];
  if (session) {
    const data = await Promise.all([
      getWorkspaces(),
      getPendingInvites()
    ]);
    workspaces = data[0];
    pendingInvites = data[1];
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start text-center sm:text-left">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        {session ? (
          <div className="flex flex-col items-center sm:items-start w-full">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-2">
              Welcome, {session.user?.name || session.user?.email}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
              You are signed in as {session.user?.email}
            </p>
            
            {pendingInvites.length > 0 && (
              <div className="w-full mb-8">
                {pendingInvites.map((invite: any) => (
                  <PendingInviteCard key={invite.id} invite={invite} />
                ))}
              </div>
            )}

            <div className="w-full mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">Your Workspaces</h2>
              {workspaces.length === 0 ? (
                <p className="text-zinc-500 italic">No workspaces found.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {workspaces.map((ws: any) => (
                    <li key={ws.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex flex-col items-start gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-black dark:text-white">{ws.name}</span>
                            <span className="text-sm text-zinc-500">({ws.slug})</span>
                          </div>
                          <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                            Owned by {ws.owner?.username || ws.owner?.email?.split('@')[0]}
                          </span>
                        </div>
                        {ws.members?.[0]?.role && (
                          <span className="text-xs text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 font-semibold uppercase tracking-widest shrink-0">
                            {ws.members[0].role}
                          </span>
                        )}
                      </div>
                      
                      {(ws.members?.[0]?.role === 'ADMIN' || ws.ownerId === session.user?.id) && (
                        <div className="w-full">
                          <InviteForm workspaceId={ws.id} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <WorkspaceForm />

            <div className="mt-12">
              <SignOutButton />
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2 text-center max-w-md">
              <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                Welcome to Pillar
              </h1>
              <p className="text-lg leading-6 text-zinc-600 dark:text-zinc-400">
                Please sign in to continue to your workspace.
              </p>
            </div>
            <AuthForms />
          </div>
        )}
      </main>
    </div>
  );
}
