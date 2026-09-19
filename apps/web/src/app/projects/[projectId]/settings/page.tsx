import { getProjectByIdAction } from "../../../../actions/projectActions";
import ProjectSettings from "../../../../components/ProjectSettings";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SettingsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = await params;
  
  const project = await getProjectByIdAction(projectId);
  if (!project) notFound();

  return (
    <div className="max-w-4xl space-y-8">

      <ProjectSettings project={project} />
    </div>
  );
}
