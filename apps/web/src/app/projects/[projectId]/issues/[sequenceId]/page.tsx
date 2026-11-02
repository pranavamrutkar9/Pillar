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
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-6 max-w-6xl">
      <div>
        <Link 
          href={`/projects/${projectId}/issues`} 
          className="text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] inline-flex items-center gap-1.5 transition-colors py-1 px-2 rounded-md hover:bg-white/[0.04]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Issues</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <IssueDetail issue={issue} project={project} cycles={cycles} modules={modules} />
          <CommentThread issueId={issue.id} projectId={projectId} comments={comments} />
        </div>
        
        <div className="bg-[#141519] p-5 rounded-xl border border-white/[0.08] shadow-md h-fit">
          <ActivityLog activities={issue.activities || []} statuses={project.issueStatuses || []} />
        </div>
      </div>
    </div>
  );
}
