import AuthForms from "@/components/AuthForms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AuthPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#08090A] min-h-screen p-6 font-sans relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#5E6AD2]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-sm w-full bg-[#0E0F12] border border-white/[0.08] p-8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-[#3B429F] flex items-center justify-center text-white font-bold text-base mx-auto shadow-[0_0_15px_rgba(94,106,210,0.5)]">
            P
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Welcome to Pillar
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to continue to your workspace.
          </p>
        </div>

        <AuthForms />
      </div>
    </div>
  );
}
