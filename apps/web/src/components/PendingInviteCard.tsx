"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/actions/workspaceActions";

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
    <div className="p-3.5 rounded-lg border border-white/[0.08] bg-[#0E0F12] flex items-center justify-between font-sans text-xs">
      <div>
        <div className="font-medium text-white">{invite.workspace?.name}</div>
        <div className="text-[11px] text-zinc-400 mt-0.5">
          Invited by {invite.sender?.email || "Admin"} · Role: {invite.role}
        </div>
      </div>
      <button
        onClick={handleAccept}
        disabled={loading}
        className="px-3 py-1.5 rounded-md bg-gradient-to-b from-[#5E6AD2] to-[#4B55C1] hover:brightness-110 text-white font-medium text-xs transition-all cursor-pointer"
      >
        {loading ? "Joining..." : "Accept"}
      </button>
    </div>
  );
}

export default PendingInviteCard;
