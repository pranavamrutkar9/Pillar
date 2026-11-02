"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

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
      
      {/* Linear Segmented Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-lg bg-black/40 border border-white/[0.06]">
        <button
          type="button"
          onClick={() => { setIsLogin(true); setError(""); }}
          className={`py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer ${
            isLogin 
              ? "bg-[#18191E] text-white shadow-xs border border-white/[0.08]" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(false); setError(""); }}
          className={`py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer ${
            !isLogin 
              ? "bg-[#18191E] text-white shadow-xs border border-white/[0.08]" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="linear-input w-full"
              placeholder="e.g. alex"
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-300">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="linear-input w-full"
            placeholder="name@company.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-medium text-zinc-300">Password</label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="linear-input w-full"
            placeholder="••••••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="linear-btn-primary w-full py-2 mt-2 shadow-linear-glow disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Authenticating...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>{isLogin ? "Sign in to Pillar" : "Create Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
      </form>

      <div className="relative py-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <span className="relative px-2 bg-[#0E0F12] text-[10px] uppercase font-mono text-zinc-500">
          or
        </span>
      </div>

      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl: "/workspaces" })}
        className="linear-btn-secondary w-full py-2 flex items-center justify-center gap-2 hover:border-white/[0.2]"
      >
        <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        <span className="text-zinc-200">Continue with GitHub</span>
      </button>

    </div>
  );
}
