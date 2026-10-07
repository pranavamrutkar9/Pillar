import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClientStandupFeed from "../../../../components/ClientStandupFeed";

export default async function StandupsPage(props: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black min-h-screen py-16">
      <main className="w-full max-w-5xl px-8 flex flex-col gap-12">
        <div className="flex justify-between items-center w-full pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Team Standups
            </h1>
            <p className="text-sm text-zinc-500">
              AI-generated daily async updates.
            </p>
          </div>
          <Link
            href={`/workspaces/${workspaceId}`}
            className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <ClientStandupFeed workspaceId={workspaceId} sessionToken={sessionToken || ""} />
      </main>
    </div>
  );
}
