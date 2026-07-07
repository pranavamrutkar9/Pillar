import { getProjectsAction } from "@/actions/projectActions";
import ProjectForm from "@/components/ProjectForm";
import Link from "next/link";

export default async function ProjectsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = await params;
  const projects = await getProjectsAction(workspaceId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href={`/workspaces/${workspaceId}`} className="text-blue-500 hover:underline">
          Back to Workspace
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
