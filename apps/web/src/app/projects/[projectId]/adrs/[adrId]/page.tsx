import { getAdrAction, getAdrsAction } from "../../../../../actions/adrActions";
import { getProjectByIdAction } from "../../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import ClientAdrDetail from "../../../../../components/ClientAdrDetail";

export async function generateMetadata(props: { params: Promise<{ adrId: string }> }) {
  const { adrId } = await props.params;
  return { title: `ADR ${adrId} | Pillar` };
}

export default async function AdrDetailPage(props: { params: Promise<{ projectId: string, adrId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId, adrId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  try {
    const adr = await getAdrAction(projectId, adrId);
    const allAdrs = await getAdrsAction(projectId);
    const isViewer = !!viewerToken && !session?.user;

    return <ClientAdrDetail project={project} adr={adr} allAdrs={allAdrs} isViewer={isViewer} />;
  } catch (error) {
    notFound();
  }
}
