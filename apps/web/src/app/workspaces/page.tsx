import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkspaceForm } from "../../components/WorkspaceForm";
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
    } else {
      const text = await res.text().catch(() => '');
      console.error(`Failed to fetch workspaces: ${res.status} ${res.statusText}`, text);
    }
  } catch (err) {
    console.error("Failed to fetch workspaces exception:", err);
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

  if (workspaces.length === 1 && pendingInvites.length === 0) {
    redirect(`/workspaces/${workspaces[0].id}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-50 font-sans min-h-screen py-12 px-6">
      
      <main className="flex flex-1 w-full max-w-4xl flex-col items-start">
        
        {/* Header */}
        <header className="w-full flex items-center justify-between pb-8 mb-12 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white mb-1">
              {session.user?.name || session.user?.email?.split('@')[0]}
            </h1>
            <p className="text-zinc-500 text-sm">
              {session.user?.email}
            </p>
          </div>
          <div>
            <SignOutButton />
          </div>
        </header>
        
        {pendingInvites.length > 0 && (
          <div className="w-full mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Pending Invites
            </h2>
            <div className="flex flex-col gap-3">
              {pendingInvites.map((invite: any) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        <div className="w-full mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Your Workspaces
          </h2>

          {workspaces.length === 0 ? (
            <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-md text-center bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">You don't have any workspaces yet.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspaces.map((ws: any) => (
                <li key={ws.id} className="group relative p-5 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4 bg-white dark:bg-[#111] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <Link href={`/workspaces/${ws.id}`} className="absolute inset-0 z-10" />
                  
                  <div className="flex items-start justify-between w-full">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-black dark:text-white">{ws.name}</span>
                      </div>
                      <span className="text-xs font-medium text-zinc-500">
                        {ws.slug}
                      </span>
                    </div>
                    {ws.members?.[0]?.role && (
                      <span className="text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-semibold uppercase tracking-wider">
                        {ws.members[0].role}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full max-w-sm">
          <WorkspaceForm />
        </div>
      </main>
    </div>
  );
}
