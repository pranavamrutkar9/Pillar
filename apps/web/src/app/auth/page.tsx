import AuthForms from "@/components/AuthForms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#FAF6EE] dark:bg-[#111215] min-h-screen p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#181A20] border-4 border-[#121212] dark:border-white shadow-[6px_6px_0px_#121212] overflow-hidden">
        
        {/* Color Strip */}
        <div className="grid grid-cols-3 h-2.5 border-b-2 border-[#121212]">
          <div className="bg-[#D32F2F]" />
          <div className="bg-[#1976D2]" />
          <div className="bg-[#FBC02D]" />
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#121212] pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#1976D2]">BAUHAUS // ACCESS</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] inline-block" />
              <span className="w-2.5 h-2.5 bg-[#1976D2] inline-block" />
              <span className="w-2.5 h-2.5 bg-[#FBC02D] inline-block" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#121212] dark:text-white">
              AUTHENTICATE
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Connect to your workspace to manage geometric modules and architecture decisions.
            </p>
          </div>

          <AuthForms />
        </div>
      </div>
    </div>
  );
}
