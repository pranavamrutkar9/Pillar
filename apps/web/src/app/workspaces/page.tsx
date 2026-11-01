import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkspaceForm } from "@/components/WorkspaceForm";
import { PendingInviteCard } from "@/components/PendingInviteCard";
import AuthButtons from "@/components/AuthButtons";
import { ArrowRight, User, Plus } from "lucide-react";

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
    <div className="min-h-screen bg-[#08090A] text-[#F4F4F5] font-sans p-6 md:p-10 relative">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Sleek Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#3B429F] flex items-center justify-center text-[10px] font-bold text-white">
                P
              </div>
              <span className="text-xs font-medium text-zinc-400">Workspaces</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Your Organizations
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/profile"
              className="px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Profile</span>
            </Link>
            <AuthButtons />
          </div>
        </div>

        {/* Pending Invites */}
        {pendingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <span>Invitations waiting for review ({pendingInvites.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingInvites.map((invite: any) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        {/* Main Workspaces Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                Workspaces ({workspaces.length})
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">Synced</span>
            </div>

            {workspaces.length === 0 ? (
              <div className="p-8 rounded-lg border border-dashed border-white/[0.08] text-center space-y-2">
                <p className="text-xs text-zinc-400">No workspaces found. Create one to begin tracking projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workspaces.map((ws: any) => (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    className="p-4 rounded-lg border border-white/[0.08] bg-[#0E0F12] hover:bg-[#121317] hover:border-white/[0.16] transition-all group block shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-sm font-medium text-white tracking-tight">{ws.name}</h3>
                    <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>{ws._count?.projects || 0} projects</span>
                      <span>{ws._count?.members || 1} members</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="p-5 rounded-lg border border-white/[0.08] bg-[#0E0F12] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Create Workspace</span>
              </div>
              <WorkspaceForm />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
