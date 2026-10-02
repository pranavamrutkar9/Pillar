import { getAdrsAction } from "../../../../actions/adrActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import ClientAdrsPage from "../../../../components/ClientAdrsPage";

export const metadata = {
  title: "ADRs | Pillar",
};

export default async function AdrsPage(props: { params: Promise<{ projectId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  const adrs = await getAdrsAction(projectId);
  const isViewer = !!viewerToken && !session?.user;

  return <ClientAdrsPage project={project} initialAdrs={adrs} isViewer={isViewer} />;
}
