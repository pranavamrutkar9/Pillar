'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInviteAction } from '@/actions/workspaceActions';
import { Loader2 } from 'lucide-react';

export default function AcceptInviteForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    
    try {
      await acceptInviteAction(token);
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
      {error && <p className="text-[#F43F5E] text-xs">{error}</p>}
      <button 
        onClick={handleAccept} 
        disabled={loading}
        className="w-full bg-[#5E6AD2] hover:bg-[#525ec2] text-white font-medium py-2.5 px-4 rounded-md text-xs disabled:opacity-50 transition-all shadow-[0_0_16px_rgba(94,106,210,0.4)] flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>{loading ? 'Joining workspace...' : 'Accept Invitation & Continue'}</span>
      </button>
    </div>
  );
}
