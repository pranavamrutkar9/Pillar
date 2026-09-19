import { getIssueBySequenceIdAction } from "../../../../../actions/issueActions";
import { getCommentsAction } from "../../../../../actions/commentActions";
import { getProjectByIdAction } from "../../../../../actions/projectActions";
import { getCyclesAction } from "../../../../../actions/cycleActions";
import { getModulesAction } from "../../../../../actions/moduleActions";
import IssueDetail from "../../../../../components/IssueDetail";
import CommentThread from "../../../../../components/CommentThread";
import ActivityLog from "../../../../../components/ActivityLog";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function IssueDetailPage({ params }: { params: { projectId: string, sequenceId: string } }) {
  const { projectId, sequenceId } = await params;
  
  const project = await getProjectByIdAction(projectId);
  const cycles = await getCyclesAction(projectId);
  const modules = await getModulesAction(projectId);
  if (!project) notFound();

  const issue = await getIssueBySequenceIdAction(projectId, sequenceId);
  if (!issue) notFound();

  const comments = await getCommentsAction(issue.id);

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/projects/${projectId}/issues`} className="text-blue-500 hover:underline text-sm mb-4 inline-block">
          &larr; Back to Issues
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <IssueDetail issue={issue} project={project} cycles={cycles} modules={modules} />
          <CommentThread issueId={issue.id} projectId={projectId} comments={comments} />
        </div>
        
        <div>
          <ActivityLog activities={issue.activities || []} statuses={project.issueStatuses || []} />
        </div>
      </div>
    </div>
  );
}
