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
    <div className="flex flex-col gap-4 w-full items-center">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button 
        onClick={handleAccept} 
        disabled={loading}
        className="w-full max-w-xs bg-black dark:bg-white text-white dark:text-black font-semibold py-2 px-4 rounded-md disabled:opacity-50"
      >
        {loading ? 'Accepting...' : 'Accept Invite'}
      </button>
    </div>
  );
}
