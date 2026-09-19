import { getModulesAction } from "../../../../actions/moduleActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import ClientModulesPage from "../../../../components/ClientModulesPage";

export default async function ModulesPage(props: { params: Promise<{ projectId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  const modules = await getModulesAction(projectId);
  const isViewer = !!viewerToken && !session?.user;

  return <ClientModulesPage project={project} initialModules={modules} isViewer={isViewer} />;
}
