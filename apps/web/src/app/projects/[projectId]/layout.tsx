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
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] text-black dark:text-zinc-100 font-sans flex flex-col transition-colors selection:bg-[#FFE600] selection:text-black">
      
      {/* Sticky Neobrutalist Header */}
      <header className="border-b-2 border-black dark:border-white bg-[#FFFDF8]/90 dark:bg-[#0D0E12]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Breadcrumbs & Utilities */}
          <div className="flex justify-between items-center h-14 border-b-2 border-black/10 dark:border-white/20">
            <div className="flex items-center gap-2 text-xs">
              <Link 
                href={`/workspaces/${project.workspaceId}`} 
                className="text-black dark:text-white px-2.5 py-1 rounded-md border-2 border-black dark:border-white bg-white dark:bg-zinc-800 font-bold transition-all flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <ArrowLeft className="w-3 h-3 stroke-[2.5]" />
                <span>Workspace</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 font-bold" />
              <div className="flex items-center gap-2">
                <span className="font-black text-black dark:text-white text-base tracking-tight">{project.name}</span>
                <span className="text-[11px] font-mono font-black text-black px-2 py-0.5 rounded bg-[#FFE600] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
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
          <div className="py-2">
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
