"use client";

import { useState, useEffect } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, FolderGit2, CheckSquare, MessageSquare, Edit3, Shield } from "lucide-react";

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
    <div className="flex flex-col flex-1 p-6 md:p-10 bg-[#FFFDF8] dark:bg-[#0D0E12] w-full min-h-screen font-sans">
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
        
        {/* Back Link */}
        <Link 
          href="/workspaces" 
          className="inline-flex items-center gap-2 self-start px-3 py-1.5 bg-white dark:bg-[#181920] border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workspaces
        </Link>

        {/* Card Header Window */}
        <div className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo">
          <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#FFE600] text-black">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-black" />
              <h1 className="text-sm font-black uppercase tracking-wider">User Identity & Profile</h1>
            </div>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full border border-black bg-[#FF6B6B]" />
              <span className="w-3 h-3 rounded-full border border-black bg-white" />
              <span className="w-3 h-3 rounded-full border border-black bg-[#4ADE80]" />
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {!isEditing ? (
              <div className="flex flex-col gap-6 items-start">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-24 h-24 border-3 border-black dark:border-white shadow-neo-sm object-cover bg-white"
                    />
                  ) : (
                    <div className="w-24 h-24 border-3 border-black dark:border-white shadow-neo-sm bg-[#FFE600] text-black flex items-center justify-center text-3xl font-black">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">
                        {profileData?.username || session?.user?.name || "No name provided"}
                      </h2>
                      <span className="px-2 py-0.5 bg-[#4ADE80] text-black border-2 border-black text-[10px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-black/70 dark:text-white/70">
                      {session?.user?.email || "No email provided"}
                    </p>
                    {profileData?.githubUsername && (
                      <p className="text-xs font-mono font-bold text-black/80 dark:text-white/80 flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                        </svg>
                        github.com/{profileData.githubUsername}
                      </p>
                    )}
                  </div>
                </div>

                {profileData && (
                  <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="flex flex-col gap-1 p-3.5 bg-white dark:bg-[#20222a] border-2 border-black dark:border-white shadow-neo-sm">
                      <div className="flex items-center gap-1.5 text-black/60 dark:text-white/60">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Joined</span>
                      </div>
                      <span className="text-base font-black text-black dark:text-white">
                        {new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 p-3.5 bg-[#38BDF8]/20 border-2 border-black dark:border-white shadow-neo-sm">
                      <div className="flex items-center gap-1.5 text-black dark:text-white">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Workspaces</span>
                      </div>
                      <span className="text-base font-black text-black dark:text-white">
                        {profileData._count?.workspaceMembers || 0}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 p-3.5 bg-[#4ADE80]/20 border-2 border-black dark:border-white shadow-neo-sm">
                      <div className="flex items-center gap-1.5 text-black dark:text-white">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Assigned</span>
                      </div>
                      <span className="text-base font-black text-black dark:text-white">
                        {profileData._count?.issuesAssigned || 0} Tasks
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 p-3.5 bg-[#C084FC]/20 border-2 border-black dark:border-white shadow-neo-sm">
                      <div className="flex items-center gap-1.5 text-black dark:text-white">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Comments</span>
                      </div>
                      <span className="text-base font-black text-black dark:text-white">
                        {profileData._count?.comments || 0}
                      </span>
                    </div>
                  </div>
                )}

                {message && (
                  <div className={`p-3 border-2 border-black font-bold text-xs w-full mt-2 ${message.includes('success') ? 'bg-[#4ADE80] text-black' : 'bg-[#FF6B6B] text-black'}`}>
                    {message}
                  </div>
                )}

                <button 
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 mt-2 text-xs font-black uppercase tracking-wider text-black bg-[#FFE600] border-2 border-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Display Name</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#20222a] border-2 border-black dark:border-white font-medium text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Avatar URL</label>
                  <input 
                    type="url" 
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#20222a] border-2 border-black dark:border-white font-medium text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
                  />
                </div>
                
                {message && (
                  <div className={`p-3 border-2 border-black font-bold text-xs ${message.includes('success') ? 'bg-[#4ADE80] text-black' : 'bg-[#FF6B6B] text-black'}`}>
                    {message}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-black dark:border-white">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black dark:text-white border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#FFE600] border-2 border-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

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
