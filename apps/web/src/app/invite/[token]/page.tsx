import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AcceptInviteForm from '@/components/AcceptInviteForm';

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

export default async function InvitePage({ params }: { params: { token: string } }) {
  // Wait for params in Next.js 15+ if needed, but in 14 it's sync. Next.js 15 requires awaiting params
  // Let's assume standard Next 14 behavior or await params just in case. 
  // Wait, in Next 13/14 `params` is available directly. We'll await it to be safe for Next 15.
  const resolvedParams = await Promise.resolve(params);
  const token = resolvedParams.token;
  
  const session = await getServerSession(authOptions);

  if (!session) {
    // Redirect to sign in with callback URL
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const invite = await getInvite(token);

  if (!invite) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Invalid Invite</h1>
        <p className="text-zinc-500">This invite link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-2">
          You've been invited!
        </h1>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          <strong className="text-black dark:text-white">{invite.sender?.username || invite.sender?.email}</strong> has invited you to join the <strong className="text-black dark:text-white">{invite.workspace?.name}</strong> workspace as a <strong className="text-black dark:text-white">{invite.role.toLowerCase()}</strong>.
        </p>

        <p className="text-sm text-zinc-500 mb-6">
          Signed in as {session.user?.email}
        </p>

        <AcceptInviteForm token={token} />
      </div>
    </div>
  );
}
