import { getIssuesAction } from "../../../../actions/issueActions";
import { getProjectByIdAction } from "../../../../actions/projectActions";
import IssueForm from "../../../../components/IssueForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function IssuesPage({ params }: { params: { projectId: string } }) {
  const { projectId } = await params;
  
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
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Issues</h2>
          {issues.length === 0 ? (
            <p className="text-gray-500">No issues found. Create one to get started.</p>
          ) : (
            <div className="space-y-4">
              {issues.map((issue: any) => (
                <Link
                  key={issue.id}
                  href={`/projects/${projectId}/issues/${issue.sequenceId}`}
                  className="block p-4 bg-white dark:bg-zinc-950 rounded-lg shadow hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">{project.slug}-{issue.sequenceId}</span>
                      <h3 className="text-lg font-bold mt-1">{issue.title}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-300">
                      {issue.status?.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
