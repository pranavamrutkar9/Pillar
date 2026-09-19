import { redirect } from 'next/navigation';

export default async function ProjectRootRedirect({ params }: { params: { projectId: string } }) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/issues`);
}
