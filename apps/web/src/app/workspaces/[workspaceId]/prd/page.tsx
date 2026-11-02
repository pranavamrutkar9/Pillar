import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientBreakdownFlow from "@/components/breakdown/ClientBreakdownFlow";

export default async function PrdPage(props: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen text-[#EDEDED] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <ClientBreakdownFlow workspaceId={workspaceId} />
      </div>
    </div>
  );
}
