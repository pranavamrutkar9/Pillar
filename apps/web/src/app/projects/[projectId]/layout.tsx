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
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#111215] text-[#121212] dark:text-[#FAF6EE] font-sans flex flex-col selection:bg-[#FBC02D] selection:text-[#121212]">
      
      {/* Bauhaus Sticky Header */}
      <header className="border-b-3 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Breadcrumbs & Utilities */}
          <div className="flex justify-between items-center h-14 border-b-2 border-[#121212]/15">
            <div className="flex items-center gap-3 text-xs">
              <Link 
                href={`/workspaces/${project.workspaceId}`} 
                className="text-[#121212] dark:text-white px-2.5 py-1 border-2 border-[#121212] dark:border-white bg-[#FAF6EE] dark:bg-[#202022] font-black uppercase tracking-wider transition-all flex items-center gap-1 hover:bg-[#FBC02D] shadow-[2px_2px_0px_#121212]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>WORKSPACE</span>
              </Link>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D32F2F] inline-block" />
                <span className="font-black text-[#121212] dark:text-white text-sm uppercase tracking-tight">{project.name}</span>
                <span className="text-[10px] font-mono font-black text-white bg-[#1976D2] px-2 py-0.5 border border-[#121212]">
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
          <div className="py-2.5">
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
