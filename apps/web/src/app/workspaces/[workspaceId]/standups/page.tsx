import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClientStandupFeed from "../../../../components/ClientStandupFeed";
import { ArrowLeft, Clock } from "lucide-react";

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
    <div className="flex flex-col flex-1 items-center min-h-screen py-12 px-6">
      <main className="w-full max-w-5xl flex flex-col gap-10">
        <div className="flex justify-between items-center w-full pb-6 border-b border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#5E6AD2]" />
              <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                Team Standups
              </h1>
            </div>
            <p className="text-xs text-[#8A8F98]">
              Automated daily async updates aggregated from git commits, PRs, and resolved issues.
            </p>
          </div>
          <Link
            href={`/workspaces/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.04]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        <ClientStandupFeed workspaceId={workspaceId} sessionToken={sessionToken || ""} />
      </main>
    </div>
  );
}
