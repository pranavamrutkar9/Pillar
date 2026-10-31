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
    <form onSubmit={handleInvite} className="mt-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <UserPlus className="w-3.5 h-3.5 text-zinc-500" />
        <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Invite new member</h4>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-zinc-900 dark:text-zinc-100"
        >
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
        >
          {status === 'loading' ? 'Sending...' : 'Send Invite'}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
