"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
    >
      Sign in with GitHub
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-md transition-colors"
    >
      Sign out
    </button>
  );
}
