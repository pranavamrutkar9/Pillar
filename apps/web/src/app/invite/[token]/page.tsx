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
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950 min-h-screen p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-8 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/50 dark:border-amber-800/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Invalid or Expired Invite</h1>
          <p className="text-xs text-zinc-500">This workspace invitation link is invalid, has expired, or has already been accepted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950 min-h-screen p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <UserCheck className="w-6 h-6" />
        </div>
        
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Workspace Invitation
        </h1>
        
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          <strong className="text-zinc-900 dark:text-zinc-200">{invite.sender?.username || invite.sender?.email}</strong> has invited you to join the <strong className="text-zinc-900 dark:text-zinc-200">{invite.workspace?.name}</strong> workspace as a <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">{invite.role.toLowerCase()}</span>.
        </p>

        <p className="text-[11px] text-zinc-400 mb-6">
          Signed in as {session.user?.email}
        </p>

        <AcceptInviteForm token={token} />
      </div>
    </div>
  );
}
