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
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const invite = await getInvite(token);

  if (!invite) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-4 text-[#EDEDED]">
        <div className="max-w-md w-full bg-[#141519] border border-white/[0.08] p-8 rounded-xl shadow-2xl text-center">
          <div className="w-12 h-12 bg-[#F43F5E]/10 text-[#F43F5E] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#F43F5E]/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-[#EDEDED] mb-2">Invalid or Expired Invite</h1>
          <p className="text-xs text-[#8A8F98]">This workspace invitation link is invalid, has expired, or has already been accepted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-4 text-[#EDEDED]">
      <div className="max-w-md w-full bg-[#141519] border border-white/[0.08] p-8 rounded-xl shadow-2xl flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#5E6AD2]/10 text-[#8B96FF] rounded-xl flex items-center justify-center mb-6 border border-[#5E6AD2]/30 shadow-[0_0_16px_rgba(94,106,210,0.3)]">
          <UserCheck className="w-6 h-6" />
        </div>
        
        <h1 className="text-xl font-bold text-[#EDEDED] mb-2 tracking-tight">
          Workspace Invitation
        </h1>
        
        <p className="text-xs text-[#8A8F98] mb-6 leading-relaxed">
          <strong className="text-[#EDEDED]">{invite.sender?.username || invite.sender?.email}</strong> has invited you to join the <strong className="text-[#EDEDED]">{invite.workspace?.name}</strong> workspace as a <span className="inline-block px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8B96FF] border border-white/10 font-medium">{invite.role.toLowerCase()}</span>.
        </p>

        <p className="text-[11px] text-[#626773] font-mono mb-6">
          Signed in as {session.user?.email}
        </p>

        <AcceptInviteForm token={token} />
      </div>
    </div>
  );
}
