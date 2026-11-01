"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="px-3.5 py-1.5 rounded-md bg-gradient-to-b from-[#5E6AD2] to-[#4B55C1] hover:brightness-110 text-xs font-medium text-white shadow-sm transition-all cursor-pointer"
    >
      Sign in with GitHub
    </button>
  );
}
