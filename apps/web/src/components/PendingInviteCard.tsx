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
    <div className="p-4 border-2 border-[#121212] dark:border-white bg-white dark:bg-[#181A20] shadow-[3px_3px_0px_#121212] flex items-center justify-between font-sans">
      <div>
        <div className="text-xs font-black uppercase">{invite.workspace?.name}</div>
        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
          INVITED BY {invite.sender?.email || "ADMIN"} · ROLE: {invite.role}
        </div>
      </div>
      <button
        onClick={handleAccept}
        disabled={loading}
        className="px-3.5 py-1.5 bg-[#FBC02D] hover:bg-[#F9A825] text-[#121212] border border-[#121212] font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
      >
        {loading ? "JOINING..." : "ACCEPT [→]"}
      </button>
    </div>
  );
}

export default PendingInviteCard;
