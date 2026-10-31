import { getProjectsAction } from "@/actions/projectActions";
import ProjectForm from "@/components/ProjectForm";
import Link from "next/link";
import { FolderGit2, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";

export default async function ProjectsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const projects = await getProjectsAction(workspaceId);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-3 border-black dark:border-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-2">
            <FolderGit2 className="w-4 h-4 text-black" />
            Project Directory
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white">Workspace Projects</h1>
          <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-1">Manage team engineering pipelines, backlogs, and roadmaps.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/workspaces/${workspaceId}/projects/breakdown`}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C084FC] hover:bg-[#a855f7] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>PRD to Project (AI)</span>
          </Link>
          <Link 
            href={`/workspaces/${workspaceId}`} 
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#181920] border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider text-black dark:text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Workspace
          </Link>
        </div>
      </div>

      {/* AI PRD Breakdown Banner Window */}
      <div className="border-3 border-black dark:border-white bg-[#FFE600] text-black shadow-neo p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <span className="inline-block px-2.5 py-0.5 bg-black text-[#FFE600] text-[10px] font-mono font-black uppercase tracking-wider">
            AI Automated Ingestion
          </span>
          <h2 className="text-lg font-black uppercase tracking-tight">
            Turn Any PRD or Spec into a Complete Issue Backlog
          </h2>
          <p className="text-xs font-bold text-black/80 max-w-2xl">
            Gemini analyzes requirements, decomposes architectural boundaries, assigns story points, and configures dependency links in 1 click.
          </p>
        </div>
        <Link
          href={`/workspaces/${workspaceId}/projects/breakdown`}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-neutral-800 border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          <span>Launch Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wider text-black dark:text-white">Active Projects</h2>
            <span className="text-xs font-mono font-bold text-black/60 dark:text-white/60">{projects.length} Total</span>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 border-3 border-dashed border-black dark:border-white bg-white dark:bg-[#181920] text-center">
              <p className="text-xs font-bold text-black/60 dark:text-white/60">No projects found. Create one using the panel on the right or launch the PRD tool.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/issues`}
                  className="block p-5 bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#38BDF8] text-black border border-black">
                      {project.key || "PRJ"}
                    </span>
                    <span className="text-xs font-black text-black dark:text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight text-black dark:text-white group-hover:underline">{project.name}</h3>
                  <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-1 line-clamp-2">{project.description || "No description provided."}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <ProjectForm workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
