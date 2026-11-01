"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthForms() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError(res.error);
        } else {
          router.push("/workspaces");
          router.refresh();
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to register user");
        } else {
          const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (signInRes?.error) {
            setError(signInRes.error);
          } else {
            router.push("/workspaces");
            router.refresh();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Linear Pill Tabs */}
      <div className="grid grid-cols-2 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`py-1.5 rounded-md font-medium transition-all cursor-pointer ${
            isLogin ? "bg-white/[0.1] text-white shadow-xs" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`py-1.5 rounded-md font-medium transition-all cursor-pointer ${
            !isLogin ? "bg-white/[0.1] text-white shadow-xs" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-white text-xs outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]"
              placeholder="e.g. prana"
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-white text-xs outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]"
            placeholder="you@domain.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-white text-xs outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]"
            placeholder="••••••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-md bg-gradient-to-b from-[#5E6AD2] to-[#4B55C1] hover:brightness-110 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer mt-1"
        >
          {loading ? "Processing..." : isLogin ? "Continue" : "Create Account"}
        </button>
      </form>

      <div className="pt-2 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/workspaces" })}
          className="w-full py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
