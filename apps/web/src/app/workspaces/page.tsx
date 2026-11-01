import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkspaceForm } from "@/components/WorkspaceForm";
import { PendingInviteCard } from "@/components/PendingInviteCard";
import AuthButtons from "@/components/AuthButtons";
import { ArrowRight } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-[#FAF6EE] font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-4 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] p-6 shadow-[6px_6px_0px_#121212] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 grid grid-cols-3">
            <div className="bg-[#D32F2F]" />
            <div className="bg-[#1976D2]" />
            <div className="bg-[#FBC02D]" />
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#1976D2]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] inline-block" />
              <span>BAUHAUS WORKSPACE REGISTRY</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
              ORGANIZATIONS
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Select an active geometric workspace or instantiate a new structure.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/profile"
              className="px-4 py-2 border-2 border-[#121212] dark:border-white text-xs font-black uppercase hover:bg-[#FBC02D] hover:text-[#121212] transition-all shadow-[2px_2px_0px_#121212]"
            >
              PROFILE
            </Link>
            <AuthButtons />
          </div>
        </div>

        {/* Pending Invites */}
        {pendingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-[#D32F2F]">
              PENDING AUTHORIZATIONS ({pendingInvites.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingInvites.map((invite: any) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#121212] dark:border-white pb-2">
              <span className="text-xs font-black uppercase tracking-wider">
                ACTIVE WORKSPACES [{workspaces.length}]
              </span>
              <span className="text-[10px] font-mono text-[#1976D2] font-black uppercase">STATUS: NORMALIZED</span>
            </div>

            {workspaces.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#121212] dark:border-white bg-white dark:bg-[#181A20] text-center space-y-2">
                <p className="text-xs font-black uppercase">NO ACTIVE WORKSPACE NODES FOUND</p>
                <p className="text-xs text-neutral-500">Create a workspace node to begin organizing modules.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspaces.map((ws: any, idx: number) => {
                  const colors = ["#D32F2F", "#1976D2", "#FBC02D"];
                  const accentColor = colors[idx % 3];
                  return (
                    <Link
                      key={ws.id}
                      href={`/workspaces/${ws.id}`}
                      className="p-5 border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[5px_5px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group block"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-[#121212]/20 pb-2">
                        <span className="w-3.5 h-3.5 border border-[#121212]" style={{ backgroundColor: accentColor }} />
                        <ArrowRight className="w-4 h-4 text-[#121212] dark:text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight">{ws.name}</h3>
                      <div className="mt-4 pt-2 border-t border-[#121212]/10 flex items-center justify-between text-xs font-bold text-neutral-500">
                        <span>PROJECTS: {ws._count?.projects || 0}</span>
                        <span>MEMBERS: {ws._count?.members || 1}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="border-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] p-6 shadow-[5px_5px_0px_#D32F2F]">
              <div className="border-b-2 border-[#121212] dark:border-white pb-2 mb-4">
                <h2 className="text-xs font-black uppercase tracking-wider">INSTANTIATE WORKSPACE</h2>
              </div>
              <WorkspaceForm />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
