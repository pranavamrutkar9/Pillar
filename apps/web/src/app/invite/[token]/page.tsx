import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AcceptInviteForm from '@/components/AcceptInviteForm';
import { UserCheck, ShieldAlert } from 'lucide-react';

async function getInvite(token: string) {
  const apiUrl = process.env.API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/invites/${token}`, {
      cache: 'no-store',
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.invite;
    }
  } catch (err) {
    console.error('Failed to fetch invite:', err);
  }
  return null;
}

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    // Redirect to sign in with callback URL
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const invite = await getInvite(token);

  if (!invite) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#FFFDF8] dark:bg-[#0D0E12] min-h-screen p-6 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-[#FF6B6B] text-black border-2 border-black flex items-center justify-center mx-auto shadow-neo-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">Invalid or Expired Invite</h1>
          <p className="text-xs font-medium text-black/70 dark:text-white/70 leading-relaxed">
            This workspace invitation link is invalid, has expired, or has already been accepted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#FFFDF8] dark:bg-[#0D0E12] min-h-screen p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo p-8 flex flex-col items-center text-center space-y-5">
        <div className="w-14 h-14 bg-[#FFE600] text-black border-2 border-black flex items-center justify-center shadow-neo-sm">
          <UserCheck className="w-7 h-7" />
        </div>
        
        <div>
          <span className="inline-block px-2.5 py-0.5 mb-2 bg-[#4ADE80] text-black border-2 border-black text-[11px] font-black uppercase tracking-wider">
            Workspace Invitation
          </span>
          <h1 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">
            Join {invite.workspace?.name}
          </h1>
        </div>
        
        <p className="text-xs font-medium text-black/75 dark:text-white/75 leading-relaxed bg-[#FFFDF8] dark:bg-[#20222a] border-2 border-black dark:border-white p-4 text-left w-full">
          <strong className="text-black dark:text-white font-black">{invite.sender?.username || invite.sender?.email}</strong> invited you to join the team as an{' '}
          <span className="inline-block px-2 py-0.5 bg-[#C084FC] text-black border border-black font-black uppercase text-[10px]">
            {invite.role}
          </span>.
        </p>

        <p className="text-[11px] font-mono text-black/50 dark:text-white/50">
          Signed in as <span className="font-bold text-black dark:text-white">{session.user?.email}</span>
        </p>

        <AcceptInviteForm token={token} />
      </div>
    </div>
  );
}
