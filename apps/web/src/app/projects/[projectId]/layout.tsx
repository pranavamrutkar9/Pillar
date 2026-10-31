import { ReactNode } from "react";
import Link from "next/link";
import { getProjectByIdAction } from "../../../actions/projectActions";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import NotificationCenter from "../../../components/NotificationCenter";
import GlobalSearch from "../../../components/Search/GlobalSearch";
import ProjectNav from "../../../components/ProjectNav";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function ProjectLayout(props: { params: Promise<{ projectId: string }>, children: ReactNode }) {
  const { projectId } = await props.params;
  const session = await getServerSession(authOptions);
  
  const project = await getProjectByIdAction(projectId);
  if (!project) notFound();

  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  const isViewer = !session?.user;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 font-sans flex flex-col transition-colors">
      
      {/* Sticky Glass Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Breadcrumbs & Utilities */}
          <div className="flex justify-between items-center h-14 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-2 text-xs">
              <Link 
                href={`/workspaces/${project.workspaceId}`} 
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Workspace</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">{project.name}</span>
                <span className="text-[11px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
                  {project.slug}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GlobalSearch workspaceId={project.workspaceId} sessionToken={sessionToken} />
              <NotificationCenter sessionToken={sessionToken} />
            </div>
          </div>
          
          {/* Bottom Row: Tab Navigation */}
          <div className="py-1.5">
            <ProjectNav projectId={projectId} isViewer={isViewer} />
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {props.children}
      </main>
    </div>
  );
}
