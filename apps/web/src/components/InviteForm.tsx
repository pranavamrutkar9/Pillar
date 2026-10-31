'use client';

import { useState } from 'react';
import { createInviteAction } from '@/actions/workspaceActions';
import { UserPlus } from 'lucide-react';

export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      await createInviteAction(workspaceId, email, role);
      setStatus('success');
      setMessage('Invitation sent successfully.');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleInvite} className="mt-6 pt-6 border-t-2 border-black dark:border-white flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-black dark:text-white stroke-[2.5]" />
        <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-wider">Invite new member</h4>
      </div>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] text-black dark:text-white placeholder:text-zinc-400"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-lg px-3 py-1.5 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
        >
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black px-4 py-1.5 rounded-lg text-xs font-black disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
        >
          {status === 'loading' ? 'Sending...' : 'Send Invite'}
        </button>
      </div>
      {message && (
        <p className={`text-xs font-bold ${status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
