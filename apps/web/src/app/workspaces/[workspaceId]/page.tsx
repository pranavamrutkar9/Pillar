import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProjectForm from "../../../components/ProjectForm";
import NotificationCenter from "../../../components/NotificationCenter";
import GlobalSearch from "../../../components/Search/GlobalSearch";
import { 
  ArrowLeft, 
  Layers, 
  Clock, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle
} from "lucide-react";

async function getWorkspace(workspaceId: string, sessionToken: string | undefined) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}`, {
      headers: { ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }) },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    } else if (res.status === 404 || res.status === 403) {
      return null;
    }
  } catch (err) {
    console.error("Failed to fetch workspace:", err);
  }
  return null;
}

async function getDashboard(workspaceId: string, sessionToken: string | undefined) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/dashboard`, {
      headers: { ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }) },
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.error("Failed to fetch dashboard:", err);
  }
  return null;
}

export default async function WorkspacePage(props: { params: Promise<{ workspaceId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  const workspace = await getWorkspace(params.workspaceId, sessionToken);
  const dashboard = await getDashboard(params.workspaceId, sessionToken);

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#08090A] text-[#F4F4F6] font-sans p-6">
        <h1 className="text-xl font-semibold mb-2">Workspace Not Found</h1>
        <p className="text-zinc-400 text-sm mb-6">It might have been deleted or you don't have access.</p>
        <Link href="/workspaces" className="linear-btn-primary">
          Return to Workspaces
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-[#08090A] text-[#F4F4F6] min-h-screen py-8 font-sans relative selection:bg-[#5E6AD2]/35 selection:text-white">
      
      {/* Top Ambient Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-[#5E6AD2]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <main className="w-full max-w-6xl px-6 flex flex-col gap-8 relative z-10">
        
        {/* Workspace Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pb-6 border-b border-white/[0.08] gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link href="/workspaces" className="text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Organizations
              </Link>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-mono text-zinc-400">/{workspace.slug}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mt-0.5">
              {workspace.name}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <GlobalSearch workspaceId={workspace.id} sessionToken={sessionToken} />
            <NotificationCenter sessionToken={sessionToken} />
            
            <Link 
              href={`/workspaces/${workspace.id}/prd`} 
              className="linear-btn-secondary text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00C2D1]" />
              <span>AI Studio</span>
            </Link>
            
            <Link 
              href={`/workspaces/${workspace.id}/standups`} 
              className="linear-btn-secondary text-xs flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Standups</span>
            </Link>
          </div>
        </div>

        {/* Dashboard 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main 2 Cols: Projects & Tasks */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Projects Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">Active Projects</h2>
                  <p className="text-xs text-zinc-400">Development repositories, sprints, and cycle tracking.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dashboard?.projectHealth?.length === 0 ? (
                  <div className="col-span-full py-12 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#0E0F12] space-y-2">
                    <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-zinc-300">No projects yet</p>
                    <p className="text-xs text-zinc-500">Create a project using the form to start tracking cycles.</p>
                  </div>
                ) : (
                  dashboard?.projectHealth?.map((ph: any) => (
                    <Link
                      key={ph.projectId}
                      href={`/projects/${ph.projectId}/issues`}
                      className="p-5 border border-white/[0.08] rounded-xl flex flex-col justify-between bg-[#111215] hover:border-white/[0.18] hover:bg-[#15171D] hover:shadow-linear-card transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-sm text-white group-hover:text-zinc-100 transition-colors">
                            {ph.name}
                          </h3>
                          {ph.isHackathonMode && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span>Crunch</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.06]">
                          <div>
                            <span className="text-base font-semibold text-white font-mono">{ph.totalIssues}</span>
                            <span className="block text-[10px] uppercase font-mono text-zinc-500 mt-0.5">Issues</span>
                          </div>
                          <div>
                            <span className="text-base font-semibold text-[#F5A623] font-mono">{ph.inProgressIssues}</span>
                            <span className="block text-[10px] uppercase font-mono text-zinc-500 mt-0.5">Active</span>
                          </div>
                          <div>
                            <span className="text-base font-semibold text-[#5E6AD2] font-mono">{ph.doneIssues}</span>
                            <span className="block text-[10px] uppercase font-mono text-zinc-500 mt-0.5">Done</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                        <span className="text-[11px]">
                          {ph.overdue ? (
                            <span className="text-[#E5484D] font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" /> Behind
                            </span>
                          ) : (
                            <span className="text-[#30A46C] font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#30A46C]" /> Healthy
                            </span>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 text-zinc-400 group-hover:text-white font-medium text-xs transition-colors">
                          Open Board <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* My Tasks Section */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white tracking-tight">Assigned to Me</h2>
                <span className="text-xs text-zinc-500 font-mono">
                  {dashboard?.myTasks?.length || 0} active
                </span>
              </div>

              <div className="border border-white/[0.08] rounded-xl bg-[#111215] overflow-hidden divide-y divide-white/[0.04]">
                {!dashboard?.myTasks || dashboard.myTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">
                    No open tasks currently assigned to you.
                  </div>
                ) : (
                  dashboard.myTasks.map((task: any) => (
                    <Link
                      key={task.id}
                      href={`/projects/${task.projectId}/issues/${task.sequenceId}`}
                      className="p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors group text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full border border-zinc-500 shrink-0" />
                        <span className="font-mono text-[11px] text-zinc-500 group-hover:text-zinc-300">
                          {task.project?.slug || 'PRJ'}-{task.sequenceId}
                        </span>
                        <span className="font-medium text-zinc-200 group-hover:text-white truncate max-w-sm">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        {task.priority && task.priority !== 'NONE' && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            task.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            task.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-white/[0.04] text-zinc-400 border border-white/[0.08]'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                        <span>{task.project?.name}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* Right Col: Create Project Form */}
          <div className="flex flex-col gap-6">
            <ProjectForm workspaceId={workspace.id} />
          </div>

        </div>

      </main>
    </div>
  );
}
