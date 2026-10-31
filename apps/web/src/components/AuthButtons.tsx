"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-black text-black bg-[#FFE600] border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
    >
      Sign in with GitHub
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-black dark:text-white bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
    >
      Sign out
    </button>
  );
}
