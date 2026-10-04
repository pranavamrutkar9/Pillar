import { getRfcsAction } from "../../../../actions/rfcActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import ClientRfcsPage from "../../../../components/ClientRfcsPage";

export const metadata = {
  title: "RFCs | Pillar",
};

export default async function RfcsPage(props: { params: Promise<{ projectId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  const rfcs = await getRfcsAction(projectId);
  const isViewer = !!viewerToken && !session?.user;

  return <ClientRfcsPage project={project} initialRfcs={rfcs} isViewer={isViewer} />;
}
