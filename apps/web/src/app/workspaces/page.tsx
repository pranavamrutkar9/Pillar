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
    <div className="flex flex-col flex-1 items-center bg-[#FFFDF8] dark:bg-[#0D0E12] text-black dark:text-zinc-100 min-h-screen py-12 px-6 transition-colors selection:bg-[#FFE600] selection:text-black">
      
      <main className="flex flex-1 w-full max-w-4xl flex-col items-start">
        
        {/* Header */}
        <header className="w-full flex items-center justify-between pb-8 mb-10 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center font-mono font-black text-lg text-black shadow-[3px_3px_0px_0px_#000]">
              {userInitial}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-black dark:text-white">
                {session.user?.name || session.user?.email?.split('@')[0]}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 font-mono text-xs">
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
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white mb-3">
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
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white">
              Workspaces
            </h2>
            <span className="text-xs text-black dark:text-white font-mono font-bold bg-[#FFE600] px-2 py-0.5 border-2 border-black rounded shadow-[1.5px_1.5px_0px_0px_#000]">
              {workspaces.length} {workspaces.length === 1 ? 'WORKSPACE' : 'WORKSPACES'}
            </span>
          </div>

          {workspaces.length === 0 ? (
            <div className="p-10 border-2 border-black dark:border-white rounded-2xl text-center bg-white dark:bg-zinc-900 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
              <Building2 className="w-10 h-10 text-black dark:text-white mb-3 stroke-[2]" />
              <p className="text-base font-black text-black dark:text-white">No workspaces yet</p>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">Create your first workspace below to begin organizing projects.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {workspaces.map((ws: any) => (
                <li key={ws.id} className="group relative p-5 border-2 border-black dark:border-white rounded-xl flex flex-col justify-between bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] transition-all">
                  <Link href={`/workspaces/${ws.id}`} className="absolute inset-0 z-10" />
                  
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-black dark:text-white group-hover:text-amber-600 transition-colors">
                          {ws.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-500">
                        /{ws.slug}
                      </span>
                    </div>
                    {ws.members?.[0]?.role && (
                      <span className="text-[10px] font-mono font-black text-black bg-[#FFE600] px-2 py-0.5 rounded border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] uppercase">
                        {ws.members[0].role}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 font-bold pt-3 border-t-2 border-black dark:border-white">
                    <span>{ws._count?.projects ?? ws.projects?.length ?? 0} projects</span>
                    <span className="inline-flex items-center gap-1 text-black dark:text-white font-black group-hover:underline">
                      Open <ArrowUpRight className="w-4 h-4 stroke-[3] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create workspace form */}
        <div className="w-full max-w-md p-6 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]">
          <WorkspaceForm />
        </div>

      </main>
    </div>
  );
}
