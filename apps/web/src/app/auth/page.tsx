import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForms } from "../../components/AuthForms";
import Image from "next/image";
import Link from "next/link";

export default async function AuthPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans relative">
      <div className="p-8 absolute top-0 left-0">
        <Link href="/">
          <Image
            className="dark:invert hover:opacity-80 transition-opacity"
            src="/next.svg"
            alt="Pillar Logo"
            width={100}
            height={20}
            priority
          />
        </Link>
      </div>
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-white/5">
          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
              Welcome to Pillar
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to continue to your workspace.
            </p>
          </div>
          <AuthForms />
        </div>
      </main>
    </div>
  );
}
