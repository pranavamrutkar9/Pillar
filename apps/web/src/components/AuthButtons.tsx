"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="rounded-full bg-foreground px-5 py-2 text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
    >
      Sign in with GitHub
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-full border border-solid border-black/[.08] px-5 py-2 hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] transition-colors"
    >
      Sign out
    </button>
  );
}
