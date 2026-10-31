'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInviteAction } from '@/actions/workspaceActions';

export default function AcceptInviteForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    
    try {
      await acceptInviteAction(token);
      
      // Force refresh to show new workspace on the dashboard
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while accepting the invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full items-center">
      {error && <p className="text-rose-500 text-xs">{error}</p>}
      <button 
        onClick={handleAccept} 
        disabled={loading}
        className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 px-4 rounded-xl text-xs disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? 'Joining workspace...' : 'Accept Invitation & Continue'}
      </button>
    </div>
  );
}
