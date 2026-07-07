import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProjectForm from "../../../components/ProjectForm";

async function getWorkspace(workspaceId: string) {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}`, {
      headers: {
        ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
      },
      cache: "no-store",
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.data; // because we wrapped in successResponse -> { success: true, data: { ... } }
    } else if (res.status === 404 || res.status === 403) {
      return null;
    }
  } catch (err) {
    console.error("Failed to fetch workspace:", err);
  }
  return null;
}

export default async function WorkspacePage(props: { params: Promise<{ workspaceId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  const workspace = await getWorkspace(params.workspaceId);

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <h1 className="text-2xl font-semibold mb-4 text-black dark:text-white">Workspace Not Found</h1>
        <p className="text-zinc-500 mb-8">It might have been deleted or you don't have access.</p>
        <Link href="/" className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md font-medium text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black min-h-screen py-16">
      <main className="w-full max-w-5xl px-8 flex flex-col gap-12">
        <div className="flex justify-between items-center w-full pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {workspace.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                {workspace.slug}
              </span>
              <span className="text-sm text-zinc-500">
                Created {new Date(workspace.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            ← Back to Workspaces
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 flex flex-col gap-10">
            {/* Projects */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black dark:text-white">Projects</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspace.projects?.length === 0 ? (
                  <p className="text-zinc-500 italic text-sm">No projects yet.</p>
                ) : (
                  workspace.projects?.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}/issues`}
                      className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-2 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                    >
                      <h3 className="font-medium text-black dark:text-white group-hover:underline">
                        {project.name}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2">
                        {project.description || "No description provided."}
                      </p>
                    </Link>
                  ))
                )}
              </div>
              
              <div className="mt-4 p-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
                 <ProjectForm workspaceId={workspace.id} />
              </div>
            </section>

            {/* Members */}
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-black dark:text-white">Members</h2>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {workspace.members?.map((member: any) => (
                    <li key={member.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {member.user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-black dark:text-white">
                            {member.user.username || member.user.email}
                          </span>
                          <span className="text-xs text-zinc-500">{member.user.email}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 uppercase">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="md:col-span-1 flex flex-col gap-10">
            {/* Invites */}
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">Pending Invites</h2>
              {workspace.invites?.length === 0 ? (
                <p className="text-zinc-500 text-sm">No pending invites.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {workspace.invites?.map((invite: any) => (
                    <li key={invite.id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-black dark:text-white truncate" title={invite.email}>
                          {invite.email}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                          {invite.role}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">
                        Sent {new Date(invite.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Activity Feed */}
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">Activity</h2>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-950 h-96 overflow-y-auto">
                {workspace.events?.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No recent activity.</p>
                ) : (
                  <ul className="flex flex-col gap-4 relative border-l border-zinc-200 dark:border-zinc-800 ml-2 pl-4">
                    {workspace.events?.map((event: any) => (
                      <li key={event.id} className="relative">
                        <div className="absolute w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 -left-[21px] top-1.5" />
                        <div className="flex flex-col">
                          <span className="text-sm text-black dark:text-white capitalize">
                            {event.eventType?.replace(/\./g, ' ')}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
          
        </div>
      </main>
    </div>
  );
}
