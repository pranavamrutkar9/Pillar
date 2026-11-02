import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkspaceForm } from "@/components/WorkspaceForm";
import { PendingInviteCard } from "@/components/PendingInviteCard";
import AuthButtons from "@/components/AuthButtons";
import { ArrowRight, User, Plus, Layers, Users, Sparkles, Building2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#08090A] text-[#F4F4F6] font-sans p-6 md:p-10 relative">
      
      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#5E6AD2]/12 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Sleek Linear Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#3B429F] flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                P
              </div>
              <span className="text-xs font-medium text-zinc-400">Organizations</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Workspaces
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/settings/profile"
              className="linear-btn-secondary text-xs"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>{session.user?.name || session.user?.email || "Account"}</span>
            </Link>
            <AuthButtons />
          </div>
        </div>

        {/* Pending Invites Section */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Pending Invitations ({pendingInvites.length})</span>
            </h2>
            <div className="space-y-2">
              {pendingInvites.map((invite: any) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        {/* Workspaces Grid + Creation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Workspaces List (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">
                Your Workspaces ({workspaces.length})
              </h2>
            </div>

            {workspaces.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-white/[0.08] bg-[#0E0F12] space-y-3">
                <Building2 className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-300">No workspaces yet</p>
                  <p className="text-xs text-zinc-500">Create your first engineering workspace using the form to start tracking cycles.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {workspaces.map((ws: any) => {
                  const initial = (ws.name || "W")[0].toUpperCase();
                  const projectCount = ws.projects?.length ?? ws._count?.projects ?? 0;
                  const memberCount = ws.members?.length ?? ws._count?.members ?? 1;

                  return (
                    <Link
                      key={ws.id}
                      href={`/workspaces/${ws.id}`}
                      className="p-5 rounded-xl border border-white/[0.08] bg-[#111215] hover:border-white/[0.18] hover:bg-[#15171D] transition-all group relative overflow-hidden flex flex-col justify-between h-36 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5E6AD2]/30 to-[#3B429F]/20 border border-[#5E6AD2]/40 flex items-center justify-center font-bold text-sm text-[#818CF8] group-hover:scale-105 transition-transform">
                            {initial}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-white group-hover:text-zinc-100 transition-colors">
                              {ws.name}
                            </h3>
                            <span className="text-[11px] font-mono text-zinc-500">
                              /{ws.slug}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-3 border-t border-white/[0.04]">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-zinc-500" />
                          <span>{projectCount} {projectCount === 1 ? 'project' : 'projects'}</span>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-zinc-500" />
                          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Creation Sidebar Card */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-300">
              Create Organization
            </h2>
            <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111215] space-y-4 shadow-linear-card">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white">New Workspace</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  A shared space for your engineering team, repositories, sprint cycles, and technical decisions.
                </p>
              </div>

              <WorkspaceForm />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
