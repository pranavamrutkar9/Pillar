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
    <div className="p-4 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
            New Invite
          </span>
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <strong className="text-black dark:text-white">{invite.sender?.username || invite.sender?.email}</strong> invited you to join <strong className="text-black dark:text-white">{invite.workspace?.name}</strong> as a <strong className="text-black dark:text-white">{invite.role.toLowerCase()}</strong>.
        </p>
      </div>

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Accepting...' : 'Accept Invite'}
      </button>
    </div>
  );
}
