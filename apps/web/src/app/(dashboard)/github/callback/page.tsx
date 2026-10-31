"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { GitBranch, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function GithubCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const installationId = searchParams.get("installation_id");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!(session?.user as any)?.token) return;

    const fetchProjects = async () => {
      try {
        const workspacesRes = await fetch(`${API_URL}/workspaces`, {
          headers: { Authorization: `Bearer ${(session?.user as any)?.token}` }
        });
        const workspaces = await workspacesRes.json();
        
        let allProjects: any[] = [];
        for (const ws of workspaces) {
          const prjRes = await fetch(`${API_URL}/workspaces/${ws.id}/projects`, {
            headers: { Authorization: `Bearer ${(session?.user as any)?.token}` }
          });
          const prjs = await prjRes.json();
          allProjects = [...allProjects, ...prjs.map((p: any) => ({ ...p, workspaceName: ws.name }))];
        }
        
        setProjects(allProjects);
        if (allProjects.length > 0) {
          setSelectedProjectId(allProjects[0].id);
        }
      } catch (err: any) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session]);

  if (!installationId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] p-6 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo p-6 text-center">
          <p className="text-sm font-black text-[#DC2626]">Invalid GitHub callback URL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#FFE600] text-black">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <GitBranch className="w-4 h-4 text-black" />
            <span>GitHub App Connection</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full border border-black bg-[#FF6B6B]" />
            <span className="w-3 h-3 rounded-full border border-black bg-white" />
            <span className="w-3 h-3 rounded-full border border-black bg-[#4ADE80]" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#16A34A] dark:text-[#4ADE80]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Installation Successful</span>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
            GitHub App Installed
          </h1>
          
          <p className="text-xs font-medium text-black/70 dark:text-white/70 leading-relaxed">
            The GitHub App was successfully installed (ID: <span className="font-mono font-bold text-black dark:text-white">{installationId}</span>). 
            The background worker is currently syncing repositories and pull request events.
          </p>

          <button 
            onClick={() => router.push("/workspaces")}
            className="w-full py-3 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
          >
            Return to Workspaces →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#FFFDF8] dark:bg-[#0D0E12] font-mono font-bold text-xs">
        LOADING CALLBACK...
      </div>
    }>
      <GithubCallbackContent />
    </Suspense>
  );
}
