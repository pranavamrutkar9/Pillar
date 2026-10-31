import { getIssuesAction } from "../../../../actions/issueActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import { getCyclesAction } from "../../../../actions/cycleActions";
import { getModulesAction } from "../../../../actions/moduleActions";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ProjectStoreProvider } from "../../../../components/ProjectStore";
import ClientIssuesPage from "../../../../components/ClientIssuesPage";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export default async function IssuesPage(props: { params: Promise<{ projectId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  const issues = await getIssuesAction(projectId, viewerToken);
  const cycles = await getCyclesAction(projectId);
  const modules = await getModulesAction(projectId);
  const statuses = project.issueStatuses || [];
  
  const isViewer = !!viewerToken && !session?.user;

  return (
    <div className="w-full">
      <ProjectStoreProvider project={project} initialIssues={issues} currentUser={session?.user} isViewer={isViewer}>
        <ClientIssuesPage 
          cycles={cycles} 
          modules={modules} 
          statuses={statuses} 
          members={project.workspace?.members || project.members || []} 
          labels={project.issueLabels || []} 
          isViewer={isViewer} 
        />
      </ProjectStoreProvider>
    </div>
  );
}
