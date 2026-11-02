"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, ArrowRight } from "lucide-react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="linear-btn-primary text-xs"
    >
      <span>Sign in with GitHub</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="linear-btn-secondary text-xs flex items-center gap-1.5 hover:text-white"
    >
      <LogOut className="w-3.5 h-3.5 text-zinc-400" />
      <span>Sign out</span>
    </button>
  );
}

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return <SignOutButton />;
  }

  return <SignInButton />;
}
