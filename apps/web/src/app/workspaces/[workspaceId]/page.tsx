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
  FileSpreadsheet
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 font-sans">
        <h1 className="text-xl font-semibold mb-2">Workspace Not Found</h1>
        <p className="text-zinc-500 text-sm mb-6">It might have been deleted or you don't have access.</p>
        <Link href="/workspaces" className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-xs font-medium">
          Return to Workspaces
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 min-h-screen py-10 transition-colors">
      <main className="w-full max-w-6xl px-6 flex flex-col gap-8">
        
        {/* Workspace Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <Link href="/workspaces" className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors text-xs flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Workspaces
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-xs font-mono text-zinc-500">{workspace.slug}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {workspace.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch workspaceId={workspace.id} sessionToken={sessionToken} />
            <NotificationCenter sessionToken={sessionToken} />
            <Link 
              href={`/workspaces/${workspace.id}/prd`} 
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>PRD Studio</span>
            </Link>
            <Link 
              href={`/workspaces/${workspace.id}/standups`} 
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 shadow-2xs"
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
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Projects</h2>
                  <p className="text-xs text-zinc-500">Active development repositories and cycles.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dashboard?.projectHealth?.length === 0 ? (
                  <div className="col-span-full py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-950/50">
                    <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No projects yet</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Use the form below to create your first project.</p>
                  </div>
                ) : (
                  dashboard?.projectHealth?.map((ph: any) => (
                    <Link
                      key={ph.projectId}
                      href={`/projects/${ph.projectId}/issues`}
                      className="p-5 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl flex flex-col justify-between bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-base text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                            {ph.name}
                          </h3>
                          {ph.isHackathonMode && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                              Crunch Mode
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-100 dark:border-zinc-900">
                          <div>
                            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{ph.totalIssues}</span>
                            <span className="block text-[10px] uppercase font-mono text-zinc-400 mt-0.5">Issues</span>
                          </div>
                          <div>
                            <span className="text-lg font-semibold text-amber-600 dark:text-amber-500">{ph.inProgressIssues}</span>
                            <span className="block text-[10px] uppercase font-mono text-zinc-400 mt-0.5">Active</span>
                          </div>
                          <div>
                            <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-500">{ph.doneIssues}</span>
                            <span className="block text-[10px] uppercase font-mono text-zinc-400 mt-0.5">Done</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                        <span>{ph.overdue ? <span className="text-red-500 font-medium">Overdue</span> : 'On Schedule'}</span>
                        <span className="inline-flex items-center gap-1 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 font-medium transition-colors">
                          Open Board <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              
              <div className="mt-2">
                 <ProjectForm workspaceId={workspace.id} />
              </div>
            </section>

            {/* My Tasks */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Assigned to Me</h2>
                <span className="text-xs font-mono text-zinc-400">{dashboard?.myTasks?.length || 0} issues</span>
              </div>
              
              <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xs">
                {dashboard?.myTasks?.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 text-xs">
                    No active tasks assigned to you right now.
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {dashboard?.myTasks?.map((task: any) => (
                      <li key={task.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: task.status?.color || '#a1a1aa' }} 
                            title={task.status?.name}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {task.title}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">
                              {task.project?.slug}-{task.sequenceId} · {task.project?.name}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-800/60">
                          {task.status?.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Members */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Workspace Members</h2>
              <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xs">
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {workspace.members?.map((member: any) => (
                    <li key={member.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt="" className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60">
                            {member.user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                            {member.user.username || member.user.email}
                          </span>
                          <span className="text-[11px] text-zinc-400">{member.user.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-800/60">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Deadlines & Activity */}
          <div className="flex flex-col gap-8">
            
            {/* Upcoming Deadlines */}
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Deadlines</h2>
              {dashboard?.upcomingDeadlines?.length === 0 ? (
                <div className="p-4 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 text-xs text-zinc-400">
                  No upcoming deadlines scheduled.
                </div>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {dashboard?.upcomingDeadlines?.map((item: any) => {
                    const daysLeft = Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const isUrgent = daysLeft <= 3;
                    return (
                      <li key={item.id} className="p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-950 flex flex-col gap-2 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate pr-2">
                            {item.title}
                          </span>
                          {item.type === 'PROJECT' && item.isHackathonMode && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 shrink-0">
                              Crunch
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-zinc-100 dark:border-zinc-900">
                          <span className="text-zinc-400">
                            {new Date(item.deadline).toLocaleDateString()}
                          </span>
                          <span className={`font-mono ${isUrgent ? 'text-red-500 font-medium' : 'text-zinc-500'}`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Today'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Activity Feed */}
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Activity Log</h2>
              <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 bg-white dark:bg-zinc-950 max-h-96 overflow-y-auto shadow-2xs">
                {dashboard?.recentActivity?.length === 0 ? (
                  <p className="text-zinc-400 text-xs">No recent activity recorded.</p>
                ) : (
                  <ul className="flex flex-col gap-3.5 relative border-l border-zinc-200 dark:border-zinc-800 ml-2 pl-3.5">
                    {dashboard?.recentActivity?.map((event: any) => (
                      <li key={event.id} className="relative">
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 -left-[17px] top-1.5" />
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-800 dark:text-zinc-200 capitalize">
                            {event.eventType?.replace(/\./g, ' ')}
                            {event.project?.name ? ` in ${event.project.name}` : ''}
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {new Date(event.createdAt).toLocaleDateString()} · {event.actor?.username || event.actor?.email || 'System'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

          </div>
          
        </div>
      </main>
    </div>
  );
}
