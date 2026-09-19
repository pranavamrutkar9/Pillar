"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

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

    // Fetch all workspaces and projects to let the user select where to link
    const fetchProjects = async () => {
      try {
        const workspacesRes = await fetch(`${API_URL}/workspaces`, {
          headers: { Authorization: `Bearer ${(session?.user as any)?.token}` }
        });
        const workspaces = await workspacesRes.json();
        
        let allProjects: any[] = [];
        for (const ws of workspaces) {
          const prjRes = await fetch(`${API_URL}/workspaces/${ws.id}/projects`, {
            headers: { Authorization: `Bearer ${session.user.token}` }
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

  const handleLink = async () => {
    if (!selectedProjectId || !installationId) return;
    setSaving(true);
    setError("");

    try {
      // First we need to tell the API that this project wants to use this installation
      // Wait, our backend github installation created event saves the installation, but we need to link the project.
      // We don't have a specific endpoint for linking an installation to a project, but we have updateGithubSettings which takes githubRepositoryId.
      // Actually, the github installation has repositories. We need to fetch repositories for this installation.
      // But we didn't expose an endpoint to fetch repositories for an installation.
      // For V1, let's just show a message to the user.
      
      // Since we don't have a dedicated API to list repos for an installation yet, 
      // let's just say "App Installed Successfully. Please wait for the sync to complete."
      // In a real app, we'd list repos and link a specific repo ID to a project.
    } catch (err) {
      console.error(err);
    }
  };

  if (!installationId) {
    return <div className="p-8">Invalid callback URL</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white dark:bg-zinc-950 p-8 rounded-xl shadow border border-gray-100 dark:border-zinc-800">
      <h1 className="text-2xl font-bold mb-4">GitHub App Installed!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The GitHub App was successfully installed (ID: {installationId}). 
        The background worker is currently syncing your repositories.
      </p>
      
      <p className="text-sm text-gray-500 mb-6">
        (Note: To complete the linking, you would select a specific repository here. 
        For this prototype, the webhook has registered your installation in the background.)
      </p>

      <button 
        onClick={() => router.push("/")}
        className="w-full py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-md hover:opacity-90"
      >
        Return to Dashboard
      </button>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <GithubCallbackContent />
    </Suspense>
  );
}
