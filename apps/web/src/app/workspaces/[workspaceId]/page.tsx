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
  ArrowUpRight, 
  Sparkles
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-[#FAF6EE] font-sans">
        <h1 className="text-xl font-black uppercase mb-2">Workspace Not Found</h1>
        <p className="text-xs uppercase text-neutral-500 mb-6">Structure does not exist or access is restricted.</p>
        <Link href="/workspaces" className="px-5 py-2.5 bg-[#D32F2F] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#121212]">
          Return to Workspaces
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-[#FAF6EE] min-h-screen py-10">
      <main className="w-full max-w-6xl px-6 flex flex-col gap-8">
        
        {/* Workspace Top Navigation Bar */}
        <div className="border-4 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] p-6 shadow-[6px_6px_0px_#121212] overflow-hidden relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute top-0 left-0 right-0 h-2 grid grid-cols-3">
            <div className="bg-[#D32F2F]" />
            <div className="bg-[#1976D2]" />
            <div className="bg-[#FBC02D]" />
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center gap-2">
              <Link href="/workspaces" className="text-xs font-black uppercase text-[#1976D2] hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> <span>ORGANIZATIONS</span>
              </Link>
              <span className="text-neutral-400">/</span>
              <span className="text-xs font-mono font-bold uppercase text-[#D32F2F]">{workspace.slug}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
              {workspace.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch workspaceId={workspace.id} sessionToken={sessionToken} />
            <NotificationCenter sessionToken={sessionToken} />
            <Link 
              href={`/workspaces/${workspace.id}/prd`} 
              className="text-xs font-black uppercase px-3 py-1.5 border-2 border-[#121212] bg-[#FBC02D] hover:bg-[#F9A825] text-[#121212] flex items-center gap-1.5 shadow-[2px_2px_0px_#121212] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRD STUDIO</span>
            </Link>
            <Link 
              href={`/workspaces/${workspace.id}/standups`} 
              className="text-xs font-black uppercase px-3 py-1.5 border-2 border-[#121212] bg-[#1976D2] hover:bg-[#0D47A1] text-white flex items-center gap-1.5 shadow-[2px_2px_0px_#121212] transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>STANDUPS</span>
            </Link>
          </div>
        </div>

        {/* Dashboard 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main 2 Cols: Projects & Tasks */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Projects Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#121212] dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#D32F2F] inline-block" />
                    <span>ACTIVE PROJECTS & REPOSITORIES</span>
                  </h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dashboard?.projectHealth?.length === 0 ? (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-[#121212] dark:border-white p-6 bg-white dark:bg-[#181A20]">
                    <Layers className="w-8 h-8 text-[#1976D2] mx-auto mb-2" />
                    <p className="text-sm font-black uppercase">NO PROJECTS INSTANTIATED</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Use the geometric constructor below to initialize your first project.</p>
                  </div>
                ) : (
                  dashboard?.projectHealth?.map((ph: any, idx: number) => (
                    <Link
                      key={ph.projectId}
                      href={`/projects/${ph.projectId}/issues`}
                      className="p-5 border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[4px_4px_0px_#121212] dark:shadow-[4px_4px_0px_#FFF] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121212] transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#D32F2F]">0{idx + 1} //</span>
                            <h3 className="font-black text-base uppercase tracking-tight text-[#121212] dark:text-white">
                              {ph.name}
                            </h3>
                          </div>
                          {ph.isHackathonMode && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FBC02D] text-[#121212] border border-[#121212]">
                              CRUNCH
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-y-2 border-[#121212] dark:border-white my-2">
                          <div className="text-center">
                            <span className="text-lg font-black">{ph.totalIssues}</span>
                            <span className="block text-[9px] uppercase font-mono text-neutral-500">ISSUES</span>
                          </div>
                          <div className="text-center border-x-2 border-[#121212] dark:border-white">
                            <span className="text-lg font-black text-[#1976D2]">{ph.inProgressIssues}</span>
                            <span className="block text-[9px] uppercase font-mono text-neutral-500">ACTIVE</span>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-black text-[#D32F2F]">{ph.doneIssues}</span>
                            <span className="block text-[9px] uppercase font-mono text-neutral-500">DONE</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs font-black uppercase">
                        <span className={ph.overdue ? "text-[#D32F2F]" : "text-[#1976D2]"}>
                          {ph.overdue ? "OVERDUE" : "ON SCHEDULE"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#121212] dark:text-white group-hover:text-[#D32F2F] transition-colors">
                          OPEN BOARD <ArrowUpRight className="w-3.5 h-3.5" />
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
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#1976D2] inline-block" />
                  <span>ASSIGNED TO OPERATOR</span>
                </h2>
                <span className="text-xs font-mono font-bold text-neutral-500">{dashboard?.myTasks?.length || 0} TICKETS</span>
              </div>
              
              <div className="border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[3px_3px_0px_#121212]">
                {dashboard?.myTasks?.length === 0 ? (
                  <div className="p-8 text-center text-xs font-black uppercase text-neutral-400">
                    No active tasks assigned to operator.
                  </div>
                ) : (
                  <ul className="divide-y-2 divide-[#121212] dark:divide-white">
                    {dashboard?.myTasks?.map((task: any) => (
                      <li key={task.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF6EE] dark:hover:bg-[#202228] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 bg-[#FBC02D] border border-[#121212] shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase text-[#121212] dark:text-white">
                              {task.title}
                            </span>
                            <span className="text-xs font-mono font-bold text-neutral-500">
                              {task.project?.slug}-{task.sequenceId} · {task.project?.name}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-[#121212] text-white dark:bg-white dark:text-[#121212] px-2 py-0.5">
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
              <div className="border-b-2 border-[#121212] pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#FBC02D] inline-block" />
                  <span>TEAM ROSTER</span>
                </h2>
              </div>
              <div className="border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[3px_3px_0px_#121212]">
                <ul className="divide-y-2 divide-[#121212] dark:divide-white">
                  {workspace.members?.map((member: any) => (
                    <li key={member.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#1976D2] text-white border border-[#121212] flex items-center justify-center text-xs font-black uppercase">
                          {member.user.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase text-[#121212] dark:text-white">
                            {member.user.username || member.user.email}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">{member.user.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-[#121212] bg-[#FAF6EE] text-[#121212]">
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
              <div className="border-b-2 border-[#121212] pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D32F2F] inline-block" />
                  <span>CRITICAL TIMELINES</span>
                </h2>
              </div>
              {dashboard?.upcomingDeadlines?.length === 0 ? (
                <div className="p-4 border-2 border-[#121212] bg-white dark:bg-[#181A20] text-xs font-black uppercase text-neutral-400">
                  No upcoming deadlines scheduled.
                </div>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {dashboard?.upcomingDeadlines?.map((item: any) => {
                    const daysLeft = Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const isUrgent = daysLeft <= 3;
                    return (
                      <li key={item.id} className="p-3.5 border-2 border-[#121212] bg-white dark:bg-[#181A20] shadow-[2px_2px_0px_#121212] flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black uppercase text-[#121212] dark:text-white truncate pr-2">
                            {item.title}
                          </span>
                          {item.type === 'PROJECT' && item.isHackathonMode && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#FBC02D] text-[#121212] border border-[#121212] shrink-0">
                              CRUNCH
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-[#121212]">
                          <span className="text-neutral-500">
                            {new Date(item.deadline).toLocaleDateString()}
                          </span>
                          <span className={`font-black uppercase ${isUrgent ? 'text-[#D32F2F]' : 'text-[#1976D2]'}`}>
                            {daysLeft > 0 ? `${daysLeft}D REMAINING` : 'TODAY'}
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
              <div className="border-b-2 border-[#121212] pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1976D2] inline-block" />
                  <span>TRANSACTION LOG</span>
                </h2>
              </div>
              <div className="border-2 border-[#121212] dark:border-white p-4 bg-white dark:bg-[#181A20] shadow-[3px_3px_0px_#121212] max-h-96 overflow-y-auto">
                {dashboard?.recentActivity?.length === 0 ? (
                  <p className="text-xs font-black uppercase text-neutral-400">No activity recorded.</p>
                ) : (
                  <ul className="flex flex-col gap-3 relative border-l-2 border-[#121212] ml-2 pl-3">
                    {dashboard?.recentActivity?.map((event: any) => (
                      <li key={event.id} className="relative">
                        <div className="absolute w-2 h-2 bg-[#D32F2F] -left-[17px] top-1" />
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase text-[#121212] dark:text-white">
                            {event.eventType?.replace(/\./g, ' ')}
                            {event.project?.name ? ` in ${event.project.name}` : ''}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 mt-0.5">
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
