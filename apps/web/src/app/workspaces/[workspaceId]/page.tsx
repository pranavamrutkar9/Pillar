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
  Flame
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] text-black dark:text-zinc-100 font-sans p-6">
        <div className="p-8 border-3 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] text-center max-w-md">
          <h1 className="text-2xl font-black mb-2">Workspace Not Found</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs mb-6 font-medium">It might have been deleted or you don't have access.</p>
          <Link href="/workspaces" className="px-5 py-2.5 bg-[#FFE600] text-black border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
            Return to Workspaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-[#FFFDF8] dark:bg-[#0D0E12] text-black dark:text-zinc-100 min-h-screen py-10 transition-colors selection:bg-[#FFE600] selection:text-black">
      <main className="w-full max-w-6xl px-6 flex flex-col gap-8">
        
        {/* Workspace Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pb-6 border-b-2 border-black dark:border-white gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link href="/workspaces" className="text-black dark:text-white px-2.5 py-1 rounded-md border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
                <ArrowLeft className="w-3.5 h-3.5" /> Workspaces
              </Link>
              <span className="text-zinc-400 font-bold">/</span>
              <span className="text-xs font-mono font-bold bg-[#FFE600] text-black px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                {workspace.slug}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-black dark:text-white mt-1">
              {workspace.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch workspaceId={workspace.id} sessionToken={sessionToken} />
            <NotificationCenter sessionToken={sessionToken} />
            <Link 
              href={`/workspaces/${workspace.id}/prd`} 
              className="text-xs font-black px-3.5 py-2 rounded-xl border-2 border-black bg-[#FFE600] text-black hover:bg-[#FFDE59] transition-all flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>PRD Studio</span>
            </Link>
            <Link 
              href={`/workspaces/${workspace.id}/standups`} 
              className="text-xs font-black px-3.5 py-2 rounded-xl border-2 border-black bg-[#4ADE80] text-black hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Clock className="w-4 h-4 stroke-[2.5]" />
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
                  <h2 className="text-lg font-black text-black dark:text-white uppercase tracking-tight">Projects</h2>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Active development repositories and cycles.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {dashboard?.projectHealth?.length === 0 ? (
                  <div className="col-span-full py-12 text-center border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    <Layers className="w-10 h-10 text-black dark:text-white mx-auto mb-2 stroke-[2]" />
                    <p className="text-sm font-black text-black dark:text-white">No projects yet</p>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">Use the form below to create your first project.</p>
                  </div>
                ) : (
                  dashboard?.projectHealth?.map((ph: any) => (
                    <Link
                      key={ph.projectId}
                      href={`/projects/${ph.projectId}/issues`}
                      className="p-5 border-2 border-black dark:border-white rounded-xl flex flex-col justify-between bg-white dark:bg-zinc-900 hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-black text-base text-black dark:text-white group-hover:text-amber-600 transition-colors">
                            {ph.name}
                          </h3>
                          {ph.isHackathonMode && (
                            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#FF6B6B] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                              CRUNCH
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-y-2 border-black dark:border-white">
                          <div>
                            <span className="text-xl font-black text-black dark:text-white">{ph.totalIssues}</span>
                            <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mt-0.5">Issues</span>
                          </div>
                          <div>
                            <span className="text-xl font-black text-amber-600">{ph.inProgressIssues}</span>
                            <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mt-0.5">Active</span>
                          </div>
                          <div>
                            <span className="text-xl font-black text-emerald-600">{ph.doneIssues}</span>
                            <span className="block text-[10px] uppercase font-mono font-bold text-zinc-500 mt-0.5">Done</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        <span>{ph.overdue ? <span className="bg-[#FF6B6B] text-black px-1.5 py-0.5 rounded border border-black font-black">OVERDUE</span> : <span className="bg-[#4ADE80] text-black px-1.5 py-0.5 rounded border border-black font-black">ON TRACK</span>}</span>
                        <span className="inline-flex items-center gap-1 text-black dark:text-white font-black group-hover:underline">
                          Open Board <ArrowUpRight className="w-4 h-4 stroke-[3] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              
              <div className="mt-3">
                 <ProjectForm workspaceId={workspace.id} />
              </div>
            </section>

            {/* My Tasks */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-black dark:text-white uppercase tracking-tight">Assigned to Me</h2>
                <span className="text-xs font-mono font-black bg-[#FFE600] text-black px-2 py-0.5 rounded border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                  {dashboard?.myTasks?.length || 0} ISSUES
                </span>
              </div>
              
              <div className="border-2 border-black dark:border-white rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                {dashboard?.myTasks?.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs font-bold">
                    No active tasks assigned to you right now.
                  </div>
                ) : (
                  <ul className="divide-y-2 divide-black dark:divide-white">
                    {dashboard?.myTasks?.map((task: any) => (
                      <li key={task.id} className="p-3.5 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0 border border-black" 
                            style={{ backgroundColor: task.status?.color || '#a1a1aa' }} 
                            title={task.status?.name}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-black dark:text-white">
                              {task.title}
                            </span>
                            <span className="text-xs font-mono font-bold text-zinc-500">
                              {task.project?.slug}-{task.sequenceId} · {task.project?.name}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-black bg-[#FFE600] px-2 py-0.5 rounded border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
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
              <h2 className="text-lg font-black text-black dark:text-white uppercase tracking-tight">Workspace Members</h2>
              <div className="border-2 border-black dark:border-white rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                <ul className="divide-y-2 divide-black dark:divide-white">
                  {workspace.members?.map((member: any) => (
                    <li key={member.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt="" className="w-8 h-8 rounded-lg border-2 border-black" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-xs font-mono font-black text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                            {member.user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-black dark:text-white">
                            {member.user.username || member.user.email}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">{member.user.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-black uppercase text-black bg-white dark:bg-zinc-800 px-2.5 py-0.5 rounded border-2 border-black dark:border-white shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
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
              <h2 className="text-base font-black text-black dark:text-white uppercase tracking-tight">Upcoming Deadlines</h2>
              {dashboard?.upcomingDeadlines?.length === 0 ? (
                <div className="p-4 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-500 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
                  No upcoming deadlines scheduled.
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {dashboard?.upcomingDeadlines?.map((item: any) => {
                    const daysLeft = Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const isUrgent = daysLeft <= 3;
                    return (
                      <li key={item.id} className="p-3.5 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-zinc-900 flex flex-col gap-2 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-black dark:text-white truncate pr-2">
                            {item.title}
                          </span>
                          {item.type === 'PROJECT' && item.isHackathonMode && (
                            <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-[#FF6B6B] text-black border border-black shrink-0">
                              Crunch
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold pt-1 border-t-2 border-black dark:border-white">
                          <span className="font-mono text-zinc-600 dark:text-zinc-400">
                            {new Date(item.deadline).toLocaleDateString()}
                          </span>
                          <span className={`font-mono font-black ${isUrgent ? 'text-[#FF6B6B]' : 'text-black dark:text-white'}`}>
                            {daysLeft > 0 ? `${daysLeft}D LEFT` : 'TODAY'}
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
              <h2 className="text-base font-black text-black dark:text-white uppercase tracking-tight">Activity Log</h2>
              <div className="border-2 border-black dark:border-white rounded-xl p-4 bg-white dark:bg-zinc-900 max-h-96 overflow-y-auto shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
                {dashboard?.recentActivity?.length === 0 ? (
                  <p className="text-zinc-500 text-xs font-bold">No recent activity recorded.</p>
                ) : (
                  <ul className="flex flex-col gap-3.5 relative border-l-2 border-black dark:border-white ml-2 pl-3.5">
                    {dashboard?.recentActivity?.map((event: any) => (
                      <li key={event.id} className="relative">
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#FFE600] border-2 border-black -left-[20px] top-1" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-black dark:text-white capitalize">
                            {event.eventType?.replace(/\./g, ' ')}
                            {event.project?.name ? ` in ${event.project.name}` : ''}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-zinc-500 mt-0.5">
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
