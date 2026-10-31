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
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* Top minimal bar */}
      <header className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm flex flex-col items-center">
          
          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-mono font-bold text-lg mb-2 shadow-xs">
              P
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Pillar Workspace
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sign in or create an account to access your projects.
            </p>
          </div>

          <AuthForms />

          <p className="mt-8 text-center text-xs text-zinc-400">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </main>

    </div>
  );
}
