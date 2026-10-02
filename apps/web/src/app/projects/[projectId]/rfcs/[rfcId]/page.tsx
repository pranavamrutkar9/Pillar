import { getRfcAction } from "../../../../../actions/rfcActions";
import { getProjectByIdAction } from "../../../../../actions/projectActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import ClientRfcDetail from "../../../../../components/ClientRfcDetail";

export async function generateMetadata(props: { params: Promise<{ rfcId: string }> }) {
  const { rfcId } = await props.params;
  return { title: `RFC ${rfcId} | Pillar` };
}

export default async function RfcDetailPage(props: { params: Promise<{ projectId: string, rfcId: string }>, searchParams: Promise<{ viewerToken?: string }> }) {
  const { projectId, rfcId } = await props.params;
  const { viewerToken } = await props.searchParams;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId, viewerToken);
  if (!project) notFound();

  try {
    const rfc = await getRfcAction(projectId, rfcId);
    const isViewer = !!viewerToken && !session?.user;

    return <ClientRfcDetail project={project} rfc={rfc} isViewer={isViewer} currentUser={session?.user} />;
  } catch (error) {
    notFound();
  }
}
