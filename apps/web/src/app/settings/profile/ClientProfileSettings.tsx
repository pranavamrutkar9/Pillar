"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, CheckSquare, MessageSquare, Briefcase, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClientProfileSettings({ sessionToken }: { sessionToken?: string }) {
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
    <div className="flex flex-col flex-1 p-6 sm:p-10 w-full min-h-screen text-[#EDEDED]">
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-8">
        
        <div className="flex items-center gap-3">
          <Link href="/workspaces" className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#8A8F98] hover:text-[#EDEDED] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold text-[#EDEDED] tracking-tight">Your Profile</h1>
            <p className="text-xs text-[#8A8F98]">Manage your developer profile and preferences.</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="flex flex-col gap-6 items-start bg-[#141519] border border-white/[0.08] p-6 sm:p-8 rounded-xl shadow-xl w-full">
            <div className="flex items-center gap-5">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border border-white/10 ring-2 ring-[#5E6AD2]/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1F2027] border border-white/10 flex items-center justify-center text-2xl font-bold text-[#5E6AD2] shadow-inner">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-[#EDEDED]">
                  {profileData?.username || session?.user?.name || "Anonymous Member"}
                </h2>
                <p className="text-xs text-[#8A8F98] flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#626773]" />
                  {session?.user?.email || "No email"}
                </p>
                {profileData?.githubUsername && (
                  <p className="text-xs text-[#8B96FF] flex items-center gap-1.5 font-mono mt-0.5">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    github.com/{profileData.githubUsername}
                  </p>
                )}
              </div>
            </div>

            {profileData && (
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                <div className="flex flex-col gap-1 p-3.5 bg-[#0B0C0E] border border-white/[0.06] rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-[#626773] tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined
                  </span>
                  <span className="text-sm font-medium text-[#EDEDED]">
                    {new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 bg-[#0B0C0E] border border-white/[0.06] rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-[#626773] tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Workspaces
                  </span>
                  <span className="text-sm font-medium text-[#EDEDED]">
                    {profileData._count?.workspaceMembers || 0}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 bg-[#0B0C0E] border border-white/[0.06] rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-[#626773] tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" /> Tasks
                  </span>
                  <span className="text-sm font-medium text-[#EDEDED]">
                    {profileData._count?.issuesAssigned || 0} Assigned
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 bg-[#0B0C0E] border border-white/[0.06] rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-[#626773] tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Comments
                  </span>
                  <span className="text-sm font-medium text-[#EDEDED]">
                    {profileData._count?.comments || 0} Written
                  </span>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-md text-xs font-medium w-full ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20'}`}>
                {message}
              </div>
            )}

            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 mt-2 text-xs font-medium text-white bg-[#5E6AD2] hover:bg-[#525ec2] rounded-md transition-all shadow-[0_0_12px_rgba(94,106,210,0.3)]"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 bg-[#141519] border border-white/[0.08] p-6 sm:p-8 rounded-xl shadow-xl w-full">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#8A8F98]">Display Name</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-white/10 rounded-md focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-all text-xs text-[#EDEDED]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#8A8F98]">Avatar URL</label>
              <input 
                type="url" 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-white/10 rounded-md focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-all text-xs text-[#EDEDED]"
              />
            </div>
            
            {message && (
              <div className={`p-3 rounded-md text-xs font-medium ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#5E6AD2] hover:bg-[#525ec2] rounded-md transition-all shadow-[0_0_12px_rgba(94,106,210,0.3)] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isLoading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
