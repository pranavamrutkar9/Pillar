'use client';

import { useState } from 'react';
import { createInviteAction } from '@/actions/workspaceActions';

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
      setMessage('Invite sent successfully!');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleInvite} className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
      <h4 className="text-sm font-medium text-black dark:text-white mb-1">Invite new member</h4>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white"
        >
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : 'Send'}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
