"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/actions/workspaceActions";
import { Check, Loader2, Users } from "lucide-react";

export function PendingInviteCard({ invite }: { invite: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptInviteAction(invite.token);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-white/[0.08] bg-[#111215] flex items-center justify-between font-sans text-xs hover:border-white/[0.14] transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center text-[#818CF8]">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <div className="font-medium text-white text-sm">{invite.workspace?.name}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Invited by <span className="text-zinc-300 font-mono">{invite.sender?.email || "Workspace Admin"}</span> · Role: <span className="text-zinc-300 font-mono">{invite.role}</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleAccept}
        disabled={loading}
        className="linear-btn-primary text-xs py-1.5 px-3"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Accept Invite</span>
          </span>
        )}
      </button>
    </div>
  );
}

export default PendingInviteCard;
