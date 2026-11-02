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
import { ArrowLeft, ChevronRight, Layers } from "lucide-react";

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
    <div className="min-h-screen bg-[#08090A] text-[#F4F4F6] font-sans flex flex-col selection:bg-[#5E6AD2]/35 selection:text-white relative">
      
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[250px] bg-gradient-to-b from-[#5E6AD2]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Linear Hairline Sticky Header */}
      <header className="border-b border-white/[0.08] backdrop-blur-xl bg-[#08090A]/85 sticky top-0 z-30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Breadcrumbs & Utilities */}
          <div className="flex justify-between items-center h-13 border-b border-white/[0.04]">
            <div className="flex items-center gap-2 text-xs">
              <Link 
                href={`/workspaces/${project.workspaceId}`} 
                className="text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.04] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight">{project.name}</span>
                <span className="text-[10px] font-mono font-medium text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                  {project.slug}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <GlobalSearch workspaceId={project.workspaceId} sessionToken={sessionToken} />
              <NotificationCenter sessionToken={sessionToken} />
            </div>
          </div>
          
          {/* Bottom Row: Tab Navigation */}
          <div className="py-1">
            <ProjectNav projectId={projectId} isViewer={isViewer} />
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {props.children}
      </main>
    </div>
  );
}
