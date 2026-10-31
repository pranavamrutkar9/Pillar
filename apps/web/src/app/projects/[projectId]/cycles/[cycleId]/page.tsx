import { getCycleByIdAction, getCycleAnalyticsAction } from "../../../../../actions/cycleActions";
import { getProjectByIdAction } from "../../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import ClientIssuesPage from "../../../../../components/ClientIssuesPage";
import CycleAnalytics from "../../../../../components/CycleAnalytics";
import { ProjectStoreProvider } from "../../../../../components/ProjectStore";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Repeat } from "lucide-react";

export default async function CycleDetailPage(props: { params: Promise<{ projectId: string, cycleId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId, cycleId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  const cycle = await getCycleByIdAction(projectId, cycleId);
  const analytics = await getCycleAnalyticsAction(projectId, cycleId);
  
  if (!project || !cycle) notFound();

  const isViewer = !!viewerToken && !session?.user;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-4">
        <Link 
          href={`/projects/${projectId}/cycles`} 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#181920] border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cycles
        </Link>
      </div>
      
      <div className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white p-6 shadow-neo">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFE600] text-black border border-black text-[10px] font-black uppercase tracking-wider">
                <Repeat className="w-3.5 h-3.5 text-black" />
                Sprint Cycle
              </span>
              <span className={`text-[10px] px-2 py-0.5 border border-black font-black uppercase tracking-wider ${
                cycle.status === "ACTIVE" ? 'bg-[#4ADE80] text-black' :
                cycle.status === "COMPLETED" ? 'bg-[#38BDF8] text-black' :
                'bg-white dark:bg-[#20222a] text-black dark:text-white'
              }`}>
                {cycle.status}
              </span>
            </div>

            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              {cycle.name}
            </h1>
            
            <div className="text-xs font-mono font-bold text-black/60 dark:text-white/60">
              {format(new Date(cycle.startsAt), 'MMM d, yyyy')} — {format(new Date(cycle.endsAt), 'MMM d, yyyy')}
            </div>
            {cycle.description && (
              <p className="mt-2 text-xs font-medium text-black/70 dark:text-white/70 max-w-2xl">
                {cycle.description}
              </p>
            )}
          </div>
          
          {analytics && (
            <div className="flex gap-4 self-start sm:self-auto">
              <div className="p-3 bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white shadow-neo-sm text-right">
                <div className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-white/60">Completion</div>
                <div className="text-xl font-black text-black dark:text-white">{analytics.summary.completionRate}%</div>
              </div>
              <div className="p-3 bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white shadow-neo-sm text-right">
                <div className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-white/60">Velocity</div>
                <div className="text-xl font-black text-black dark:text-white">{analytics.summary.velocity} pts</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CycleAnalytics summary={analytics?.summary} burndown={analytics?.burndown} />

      <div>
        <ProjectStoreProvider project={project} initialIssues={cycle.issues || []} currentUser={session?.user} isViewer={isViewer}>
          <ClientIssuesPage />
        </ProjectStoreProvider>
      </div>
    </div>
  );
}
