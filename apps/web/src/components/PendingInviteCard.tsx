'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInviteAction } from '@/actions/workspaceActions';

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
    <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] rounded-md flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-black dark:text-white font-medium text-sm">
            Workspace Invitation
          </span>
          {error && <span className="text-red-500 text-xs font-medium">{error}</span>}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <strong className="text-black dark:text-white font-semibold">{invite.sender?.username || invite.sender?.email}</strong> has invited you to join <strong className="text-black dark:text-white font-semibold">{invite.workspace?.name}</strong> as a <span className="capitalize">{invite.role.toLowerCase()}</span>.
        </p>
      </div>

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full sm:w-auto shrink-0 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Accepting...' : 'Accept'}
      </button>
    </div>
  );
}
