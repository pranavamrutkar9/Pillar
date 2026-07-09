import { getIssuesAction } from "../../../../actions/issueActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import IssueForm from "../../../../components/IssueForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectStoreProvider } from "../../../../components/ProjectStore";
import ClientIssuesPage from "../../../../components/ClientIssuesPage";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export default async function IssuesPage({ params }: { params: { projectId: string } }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId);
  if (!project) notFound();

  const issues = await getIssuesAction(projectId);
  const statuses = project.issueStatuses || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/workspaces/${project.workspaceId}/projects`} className="text-blue-500 hover:underline text-sm mb-2 block">
            &larr; Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">{project.name} Issues</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ProjectStoreProvider project={project} initialIssues={issues} currentUser={session?.user}>
            <ClientIssuesPage />
          </ProjectStoreProvider>
        </div>

        <div>
          <IssueForm 
            projectId={projectId} 
            statuses={statuses} 
            members={project.members || []} 
            labels={project.issueLabels || []} 
          />
        </div>
      </div>
    </div>
  );
}
