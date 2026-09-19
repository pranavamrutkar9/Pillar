import { getModuleByIdAction, getModuleProgressAction } from "../../../../../actions/moduleActions";
import { getProjectByIdAction } from "../../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import ClientIssuesPage from "../../../../../components/ClientIssuesPage";
import { ProjectStoreProvider } from "../../../../../components/ProjectStore";
import Link from "next/link";

export default async function ModuleDetailPage(props: { params: Promise<{ projectId: string, moduleId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId, moduleId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  const mod = await getModuleByIdAction(projectId, moduleId);
  const progress = await getModuleProgressAction(projectId, moduleId);
  
  if (!project || !mod) notFound();

  const isViewer = !!viewerToken && !session?.user;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${projectId}/modules`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          &larr; Back to Modules
        </Link>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{mod.name}</h1>
            {mod.description && <p className="text-zinc-700 dark:text-zinc-300">{mod.description}</p>}
          </div>
          
          {progress && (
            <div className="w-64">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress</span>
                <span className="text-zinc-500">{progress.completed} of {progress.total} issues</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-xs font-bold text-blue-600 dark:text-blue-400">
                {progress.percentage}%
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <ProjectStoreProvider project={project} initialIssues={mod.issues || []} currentUser={session?.user} isViewer={isViewer}>
          <ClientIssuesPage />
        </ProjectStoreProvider>
      </div>
    </div>
  );
}
