import { getIssuesAction } from "../../../../actions/issueActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import IssueForm from "../../../../components/IssueForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ProjectStoreProvider } from "../../../../components/ProjectStore";
import ClientIssuesPage from "../../../../components/ClientIssuesPage";
import NotificationCenter from "../../../../components/NotificationCenter";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export default async function IssuesPage(props: { params: Promise<{ projectId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  const issues = await getIssuesAction(projectId, viewerToken);
  const statuses = project.issueStatuses || [];
  
  const isViewer = !!viewerToken && !session?.user;

  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/workspaces/${project.workspaceId}/projects`} className="text-blue-500 hover:underline text-sm mb-2 block">
            &larr; Back to Projects
          </Link>
          <h1 className="text-3xl font-bold">{project.name} Issues</h1>
        </div>
        <div className="flex items-center gap-4">
          {!isViewer && (
            <Link
              href={`/projects/${project.id}/settings`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition-colors"
            >
              Settings
            </Link>
          )}
          <NotificationCenter sessionToken={sessionToken} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ProjectStoreProvider project={project} initialIssues={issues} currentUser={session?.user} isViewer={isViewer}>
            <ClientIssuesPage />
          </ProjectStoreProvider>
        </div>

        <div>
          {!isViewer && (
            <IssueForm 
              projectId={projectId} 
              statuses={statuses} 
              members={project.workspace?.members || project.members || []} 
              labels={project.issueLabels || []} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
