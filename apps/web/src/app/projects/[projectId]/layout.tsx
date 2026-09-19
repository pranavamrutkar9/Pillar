import { ReactNode } from "react";
import Link from "next/link";
import { getProjectByIdAction } from "../../../actions/projectActions";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import NotificationCenter from "../../../components/NotificationCenter";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={`/workspaces/${project.workspaceId}/projects`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                &larr; Projects
              </Link>
              <h1 className="text-xl font-bold truncate">{project.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter sessionToken={sessionToken} />
            </div>
          </div>
          
          <nav className="flex space-x-6 overflow-x-auto no-scrollbar">
            <Link href={`/projects/${projectId}/issues`} className="pb-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border-b-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              Issues
            </Link>
            <Link href={`/projects/${projectId}/cycles`} className="pb-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border-b-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              Cycles
            </Link>
            <Link href={`/projects/${projectId}/modules`} className="pb-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border-b-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              Modules
            </Link>
            {!isViewer && (
              <Link href={`/projects/${projectId}/settings`} className="pb-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border-b-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                Settings
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {props.children}
      </main>
    </div>
  );
}
