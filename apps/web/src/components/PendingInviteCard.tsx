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
    <div className="p-4 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5 sm:mt-0">
          <Mail className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-zinc-900 dark:text-zinc-100 font-medium text-sm">
              Workspace Invitation
            </span>
            {error && <span className="text-red-500 text-xs">{error}</span>}
          </div>
          <p className="text-xs text-zinc-500">
            <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{invite.sender?.username || invite.sender?.email}</strong> invited you to join <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{invite.workspace?.name}</strong> as <span className="capitalize">{invite.role.toLowerCase()}</span>.
          </p>
        </div>
      </div>

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full sm:w-auto shrink-0 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Accept Invitation'}
      </button>
    </div>
  );
}
