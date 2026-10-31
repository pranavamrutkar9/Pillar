import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForms } from "../../components/AuthForms";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AuthPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] text-black dark:text-zinc-100 transition-colors selection:bg-[#FFE600] selection:text-black">
      
      {/* Top minimal bar */}
      <header className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-black dark:text-white px-3 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md flex flex-col items-center">
          
          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-3 border-black flex items-center justify-center text-black font-mono font-black text-2xl mb-2 shadow-[4px_4px_0px_0px_#000]">
              P
            </div>
            <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">
              Pillar Workspace
            </h1>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Sign in or create an account to access your high-speed projects.
            </p>
          </div>

          <AuthForms />

          <p className="mt-8 text-center text-xs font-medium text-zinc-500">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </main>

    </div>
  );
}
