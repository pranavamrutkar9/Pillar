import { getModuleByIdAction, getModuleProgressAction } from "../../../../../actions/moduleActions";
import { getProjectByIdAction } from "../../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import ClientIssuesPage from "../../../../../components/ClientIssuesPage";
import { ProjectStoreProvider } from "../../../../../components/ProjectStore";
import Link from "next/link";
import { ArrowLeft, Box } from "lucide-react";

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
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-4">
        <Link 
          href={`/projects/${projectId}/modules`} 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#181920] border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Modules
        </Link>
      </div>
      
      <div className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white p-6 shadow-neo">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C084FC] text-black border border-black text-[10px] font-black uppercase tracking-wider">
              <Box className="w-3.5 h-3.5 text-black" />
              Module Specification
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">{mod.name}</h1>
            {mod.description && (
              <p className="text-xs font-medium text-black/70 dark:text-white/70 leading-relaxed max-w-2xl">
                {mod.description}
              </p>
            )}
          </div>
          
          {progress && (
            <div className="w-full sm:w-64 p-4 bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white shadow-neo-sm shrink-0">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider mb-2">
                <span>Progress</span>
                <span className="font-mono">{progress.completed} / {progress.total} Tasks</span>
              </div>
              <div className="w-full bg-white dark:bg-black border-2 border-black dark:border-white h-4 overflow-hidden">
                <div 
                  className="bg-[#4ADE80] h-full border-r-2 border-black transition-all duration-500" 
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="mt-2 text-right text-xs font-mono font-black text-black dark:text-white">
                {progress.percentage}% COMPLETE
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
