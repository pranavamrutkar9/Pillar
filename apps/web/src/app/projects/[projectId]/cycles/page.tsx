import { getCyclesAction } from "../../../../actions/cycleActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import ClientCyclesPage from "../../../../components/ClientCyclesPage";

export default async function CyclesPage(props: { params: Promise<{ projectId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  const cycles = await getCyclesAction(projectId);
  const isViewer = !!viewerToken && !session?.user;

  return <ClientCyclesPage project={project} initialCycles={cycles} isViewer={isViewer} />;
}
