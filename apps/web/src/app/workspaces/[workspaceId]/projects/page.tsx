import { getProjectsAction } from "@/actions/projectActions";
import ProjectForm from "@/components/ProjectForm";
import Link from "next/link";

export default async function ProjectsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const projects = await getProjectsAction(workspaceId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage team projects and modular backlogs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/workspaces/${workspaceId}/projects/breakdown`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm shadow-sm transition-colors"
          >
            <span>✨ PRD to Project (AI)</span>
          </Link>
          <Link href={`/workspaces/${workspaceId}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            Back to Workspace
          </Link>
        </div>
      </div>

      {/* AI PRD Breakdown Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-purple-600/10 border border-violet-200 dark:border-violet-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            AI Feature 2 · The 90-Second Demo
          </span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            Turn any PRD or Notion Doc into a complete project backlog
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Gemini creates modules, issues, Fibonacci estimates, and dependency graphs in 1 click.
          </p>
        </div>
        <Link
          href={`/workspaces/${workspaceId}/projects/breakdown`}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md transition-all"
        >
          Launch PRD Breakdown →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found. Create one to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/issues`}
                  className="block p-6 bg-white dark:bg-zinc-950 rounded-lg shadow hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-800"
                >
                  <h3 className="text-lg font-bold">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.description || "No description provided."}</p>
                  {project.description && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{project.description}</p>
                  )}
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
