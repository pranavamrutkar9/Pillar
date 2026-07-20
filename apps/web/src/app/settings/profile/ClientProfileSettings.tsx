"use client";

import { useState, useEffect } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ProfileSettingsForm({ sessionToken }: { sessionToken?: string }) {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState(session?.user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/users/me`, {
          credentials: 'include',
          headers: {
            ...(sessionToken && { Authorization: `Bearer ${sessionToken}` })
          }
        });
        if (res.ok) {
          const json = await res.json();
          setProfileData(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, [session, sessionToken]);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const res = await fetch(`${apiUrl}/api/users/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { Authorization: `Bearer ${sessionToken}` })
        },
        body: JSON.stringify({ username, avatarUrl })
      });

      if (res.ok) {
        setMessage("Profile updated successfully.");
        await update({ name: username, image: avatarUrl });
        setIsEditing(false);
        router.refresh();
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-8 bg-zinc-50 dark:bg-black w-full min-h-screen font-sans">
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Your Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Update your personal information.</p>
        </div>

        {!isEditing ? (
          <div className="flex flex-col gap-6 items-start">
            <div className="flex items-center gap-6">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-3xl font-semibold text-zinc-500">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold text-black dark:text-white">
                  {profileData?.username || session?.user?.name || "No name provided"}
                </h2>
                <p className="text-sm text-zinc-500">
                  {session?.user?.email || "No email provided"}
                </p>
                {profileData?.githubUsername && (
                  <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                    </svg>
                    github.com/{profileData.githubUsername}
                  </p>
                )}
              </div>
            </div>

            {profileData && (
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex flex-col gap-1 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</span>
                  <span className="text-lg font-medium text-black dark:text-white">
                    {new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspaces</span>
                  <span className="text-lg font-medium text-black dark:text-white">
                    {profileData._count?.workspaceMembers || 0}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tasks</span>
                  <span className="text-lg font-medium text-black dark:text-white">
                    {profileData._count?.issuesAssigned || 0} Assigned
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Comments</span>
                  <span className="text-lg font-medium text-black dark:text-white">
                    {profileData._count?.comments || 0} Written
                  </span>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium w-full mt-4 ${message.includes('success') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'}`}>
                {message}
              </div>
            )}

            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 mt-4 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Name</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Avatar URL</label>
              <input 
                type="url" 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white"
              />
            </div>
            
            {message && (
              <div className={`p-3 rounded-md text-sm font-medium ${message.includes('success') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ClientProfileSettings({ sessionToken }: { sessionToken?: string }) {
  return (
    <SessionProvider>
      <ProfileSettingsForm sessionToken={sessionToken} />
    </SessionProvider>
  );
}
