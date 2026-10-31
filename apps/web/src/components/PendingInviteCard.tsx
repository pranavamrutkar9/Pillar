'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInviteAction } from '@/actions/workspaceActions';
import { Loader2, Mail } from 'lucide-react';

export function PendingInviteCard({ invite }: { invite: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    setError('');

    try {
      await acceptInviteAction(invite.token);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite');
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-black dark:border-white bg-[#FEF08A] dark:bg-zinc-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 border-2 border-black dark:border-white flex items-center justify-center text-black dark:text-white shrink-0 shadow-[2px_2px_0px_0px_#000]">
          <Mail className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-black dark:text-white font-black text-sm">
              Workspace Invitation
            </span>
            {error && <span className="text-red-600 font-bold text-xs">{error}</span>}
          </div>
          <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
            <strong className="font-bold">{invite.sender?.username || invite.sender?.email}</strong> invited you to join <strong className="font-bold">{invite.workspace?.name}</strong> as <span className="font-bold uppercase">{invite.role.toLowerCase()}</span>.
          </p>
        </div>
      </div>

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full sm:w-auto shrink-0 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded-lg text-xs font-black transition-all border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Accept Invitation'}
      </button>
    </div>
  );
}
