"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="px-4 py-2 border-2 border-[#121212] dark:border-white text-xs font-black uppercase tracking-wider hover:bg-[#D32F2F] hover:text-white hover:border-[#D32F2F] transition-all cursor-pointer bg-white dark:bg-[#181A20]"
      >
        DISCONNECT
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 bg-[#1976D2] hover:bg-[#0D47A1] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_#121212]"
    >
      GITHUB OAUTH
    </button>
  );
}

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 bg-[#1976D2] hover:bg-[#0D47A1] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_#121212]"
    >
      [AUTH // GITHUB]
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="px-3.5 py-2 border-2 border-[#121212] dark:border-white text-xs font-black uppercase tracking-wider hover:bg-[#D32F2F] hover:text-white hover:border-[#D32F2F] transition-all cursor-pointer bg-white dark:bg-[#181A20]"
    >
      [DISCONNECT]
    </button>
  );
}
