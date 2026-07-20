import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkspaceForm } from "../../components/WorkspaceForm";
import { InviteForm } from "../../components/InviteForm";
import { PendingInviteCard } from "../../components/PendingInviteCard";
import { SignOutButton } from "../../components/AuthButtons";

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
      const json = await res.json();
      return json.data || [];
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
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch pending invites:", err);
  }
  return [];
}

export default async function WorkspacesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth");
  }

  const [workspaces, pendingInvites] = await Promise.all([
    getWorkspaces(),
    getPendingInvites()
  ]);

  // Optionally auto-redirect if only 1 workspace and no pending invites
  if (workspaces.length === 1 && pendingInvites.length === 0) {
    redirect(`/workspaces/${workspaces[0].id}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black min-h-screen py-16">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-start px-8">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-2">
          Welcome, {session.user?.name || session.user?.email}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
          You are signed in as {session.user?.email}
        </p>
        
        {pendingInvites.length > 0 && (
          <div className="w-full mb-10">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Pending Invites</h2>
            <div className="flex flex-col gap-3">
              {pendingInvites.map((invite: any) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        <div className="w-full mb-10">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Your Workspaces</h2>
          {workspaces.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-center bg-zinc-50/50 dark:bg-zinc-900/30">
              <p className="text-zinc-500 text-sm">No workspaces found. Create one below to get started.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspaces.map((ws: any) => (
                <li key={ws.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group relative">
                  <Link href={`/workspaces/${ws.id}`} className="absolute inset-0 z-10" />
                  <div className="flex items-start justify-between w-full">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-lg text-black dark:text-white group-hover:underline">{ws.name}</span>
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 w-fit">
                        {ws.slug}
                      </span>
                    </div>
                    {ws.members?.[0]?.role && (
                      <span className="text-[10px] text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-1 rounded font-bold uppercase tracking-widest shrink-0 border border-zinc-200 dark:border-zinc-800">
                        {ws.members[0].role}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center z-20 relative">
                     <span className="text-xs text-zinc-500">
                        Created {new Date(ws.createdAt).toLocaleDateString()}
                      </span>
                      {/* We could put a tiny invite button here if they are admin, but maybe keep it clean */}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full">
          <WorkspaceForm />
        </div>

        <div className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-8 w-full">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
