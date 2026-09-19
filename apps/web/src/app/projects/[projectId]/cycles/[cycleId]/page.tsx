import { getCycleByIdAction, getCycleAnalyticsAction } from "../../../../../actions/cycleActions";
import { getProjectByIdAction } from "../../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import ClientIssuesPage from "../../../../../components/ClientIssuesPage";
import { ProjectStoreProvider } from "../../../../../components/ProjectStore";
import Link from "next/link";
import { format } from "date-fns";

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${projectId}/cycles`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          &larr; Back to Cycles
        </Link>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              {cycle.name}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                cycle.status === "ACTIVE" ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                cycle.status === "COMPLETED" ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}>
                {cycle.status}
              </span>
            </h1>
            <div className="text-sm text-zinc-500">
              {format(new Date(cycle.startsAt), 'MMM d, yyyy')} - {format(new Date(cycle.endsAt), 'MMM d, yyyy')}
            </div>
            {cycle.description && <p className="mt-4 text-zinc-700 dark:text-zinc-300">{cycle.description}</p>}
          </div>
          
          {analytics && (
            <div className="flex gap-6 text-right">
              <div>
                <div className="text-sm text-zinc-500">Completion</div>
                <div className="text-xl font-bold">{analytics.summary.completionRate}%</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Velocity</div>
                <div className="text-xl font-bold">{analytics.summary.velocity} pts</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <ProjectStoreProvider project={project} initialIssues={cycle.issues || []} currentUser={session?.user} isViewer={isViewer}>
          <ClientIssuesPage />
        </ProjectStoreProvider>
      </div>
    </div>
  );
}
