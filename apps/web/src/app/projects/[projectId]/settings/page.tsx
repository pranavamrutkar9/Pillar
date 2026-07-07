import { getProjectByIdAction } from "../../../../actions/projectActions";
import ProjectSettings from "../../../../components/ProjectSettings";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SettingsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = await params;
  
  const project = await getProjectByIdAction(projectId);
  if (!project) notFound();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/projects/${project.id}/issues`} className="text-blue-500 hover:underline text-sm mb-2 block">
            &larr; Back to Issues
          </Link>
          <h1 className="text-3xl font-bold">{project.name} Settings</h1>
        </div>
      </div>

      <ProjectSettings project={project} />
    </div>
  );
}
