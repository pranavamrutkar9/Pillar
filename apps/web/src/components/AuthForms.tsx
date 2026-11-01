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
    <div className="space-y-6 font-sans">
      {/* Bauhaus Geometric Tabs */}
      <div className="grid grid-cols-2 border-2 border-[#121212]">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
            isLogin ? "bg-[#1976D2] text-white" : "bg-transparent text-[#121212] dark:text-white"
          }`}
        >
          SIGN IN
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-l-2 border-[#121212] ${
            !isLogin ? "bg-[#1976D2] text-white" : "bg-transparent text-[#121212] dark:text-white"
          }`}
        >
          REGISTER
        </button>
      </div>

      {error && (
        <div className="p-3 border-2 border-[#D32F2F] bg-[#D32F2F]/10 text-[#D32F2F] text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-xs font-black uppercase">NAME / COGNOMEN</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-[#181A20] border-2 border-[#121212] dark:border-white text-xs font-bold outline-none focus:border-[#1976D2]"
              placeholder="e.g. Walter Gropius"
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-black uppercase">EMAIL ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-[#181A20] border-2 border-[#121212] dark:border-white text-xs font-bold outline-none focus:border-[#1976D2]"
            placeholder="architect@bauhaus.de"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black uppercase">SECURITY PASSPHRASE</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-[#181A20] border-2 border-[#121212] dark:border-white text-xs font-bold outline-none focus:border-[#1976D2]"
            placeholder="••••••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#FBC02D] hover:bg-[#F9A825] text-[#121212] font-black text-xs uppercase tracking-wider border-2 border-[#121212] shadow-[3px_3px_0px_#121212] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? "PROCESSING..." : isLogin ? "PROCEED TO WORKSPACE [→]" : "INITIALIZE ARCHITECT [→]"}
        </button>
      </form>

      <div className="pt-2 border-t-2 border-[#121212] dark:border-white">
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/workspaces" })}
          className="w-full py-2.5 bg-white text-[#121212] hover:bg-[#121212] hover:text-white dark:bg-[#181A20] dark:text-white border-2 border-[#121212] dark:border-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          AUTHENTICATE WITH GITHUB
        </button>
      </div>
    </div>
  );
}
