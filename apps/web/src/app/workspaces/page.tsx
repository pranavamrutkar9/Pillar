import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkspaceForm } from "../../components/WorkspaceForm";
import { PendingInviteCard } from "../../components/PendingInviteCard";
import { SignOutButton } from "../../components/AuthButtons";
import { ArrowUpRight, FolderGit2, Building2 } from "lucide-react";

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

  const userInitial = (session.user?.name || session.user?.email || "U")[0].toUpperCase();

  return (
    <div className="flex flex-col flex-1 items-center bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 min-h-screen py-12 px-6 transition-colors">
      
      <main className="flex flex-1 w-full max-w-4xl flex-col items-start">
        
        {/* Header */}
        <header className="w-full flex items-center justify-between pb-8 mb-10 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-mono font-semibold text-sm text-zinc-800 dark:text-zinc-200">
              {userInitial}
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {session.user?.name || session.user?.email?.split('@')[0]}
              </h1>
              <p className="text-zinc-500 text-xs">
                {session.user?.email}
              </p>
            </div>
          </div>
          <div>
            <SignOutButton />
          </div>
        </header>
        
        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="w-full mb-10">
            <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500 mb-3">
              Pending Invites ({pendingInvites.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pendingInvites.map((invite: any) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        {/* Workspaces Section */}
        <div className="w-full mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
              Workspaces
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              {workspaces.length} {workspaces.length === 1 ? 'workspace' : 'workspaces'}
            </span>
          </div>

          {workspaces.length === 0 ? (
            <div className="p-8 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl text-center bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
              <Building2 className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No workspaces yet</p>
              <p className="text-xs text-zinc-500 mt-1">Create your first workspace below to begin organizing projects.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspaces.map((ws: any) => (
                <li key={ws.id} className="group relative p-5 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl flex flex-col justify-between bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all">
                  <Link href={`/workspaces/${ws.id}`} className="absolute inset-0 z-10" />
                  
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-base text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                          {ws.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">
                        /{ws.slug}
                      </span>
                    </div>
                    {ws.members?.[0]?.role && (
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-800/60 uppercase">
                        {ws.members[0].role}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <span>{ws._count?.projects ?? ws.projects?.length ?? 0} projects</span>
                    <span className="inline-flex items-center gap-1 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 font-medium transition-colors">
                      Open <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create workspace form */}
        <div className="w-full max-w-md p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs">
          <WorkspaceForm />
        </div>

      </main>
    </div>
  );
}
