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
      {error && (
        <div className="w-full p-2.5 bg-[#FF6B6B] border-2 border-black text-black text-xs font-bold text-center">
          {error}
        </div>
      )}
      <button 
        onClick={handleAccept} 
        disabled={loading}
        className="w-full bg-[#FFE600] hover:bg-[#FACC15] text-black border-2 border-black font-black py-3 px-4 text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Joining workspace...' : 'Accept Invitation & Enter →'}
      </button>
    </div>
  );
}
