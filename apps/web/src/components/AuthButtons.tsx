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

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black dark:border-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-brutal-sm"
    >
      [AUTH // GITHUB]
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="px-3.5 py-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-2 border-black dark:border-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
    >
      [DISCONNECT]
    </button>
  );
}
