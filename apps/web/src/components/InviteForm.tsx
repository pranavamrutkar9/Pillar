'use client';

import { useState } from 'react';
import { createInviteAction } from '@/actions/workspaceActions';
import { UserPlus, Send, Loader2 } from 'lucide-react';

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
    <form onSubmit={handleInvite} className="mt-6 pt-6 border-t border-white/[0.08] flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <UserPlus className="w-3.5 h-3.5 text-[#5E6AD2]" />
        <h4 className="text-xs font-medium text-[#EDEDED] uppercase tracking-wider">Invite new member</h4>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-[#0B0C0E] border border-white/10 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 text-[#EDEDED] placeholder:text-[#626773]"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-[#0B0C0E] border border-white/10 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#5E6AD2] text-[#EDEDED] cursor-pointer"
        >
          <option value="ADMIN" className="bg-[#141519]">Admin</option>
          <option value="MEMBER" className="bg-[#141519]">Member</option>
          <option value="VIEWER" className="bg-[#141519]">Viewer</option>
        </select>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-[#5E6AD2] hover:bg-[#525ec2] text-white px-4 py-1.5 rounded-md text-xs font-medium disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(94,106,210,0.3)] flex items-center justify-center gap-1.5"
        >
          {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>{status === 'loading' ? 'Sending...' : 'Send Invite'}</span>
        </button>
      </div>

      {message && (
        <p className={`text-xs ${status === 'success' ? 'text-emerald-400' : 'text-[#F43F5E]'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
