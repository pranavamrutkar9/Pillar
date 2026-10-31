'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/actions/authActions';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export function AuthForms() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerAction(email, password, name);

      // Auto sign in after registration
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Registered successfully, please sign in.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-3 border-black dark:border-white rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden">
      
      {/* Segmented Tab Bar */}
      <div className="p-1.5 m-6 mb-0 bg-zinc-100 dark:bg-zinc-950 rounded-xl flex border-2 border-black dark:border-white gap-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('signin');
            setError('');
          }}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('signup');
            setError('');
          }}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            activeTab === 'signup'
              ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="p-6 pt-5">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] text-black dark:text-white text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#FF6B6B]">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-lg px-3 py-2 text-sm text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase text-black dark:text-white">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-lg px-3 py-2 text-sm text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#FFE600] text-black font-black text-sm py-2.5 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50 mt-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-lg px-3 py-2 text-sm text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-lg px-3 py-2 text-sm text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-zinc-950 border-2 border-black dark:border-white rounded-lg px-3 py-2 text-sm text-black dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] dark:focus:shadow-[3px_3px_0px_0px_#fff] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#FFE600] text-black font-black text-sm py-2.5 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50 mt-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-black dark:border-white" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono font-bold uppercase">
              or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn('github')}
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-2 border-black dark:border-white text-black dark:text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          <span>Continue with GitHub</span>
        </button>
      </div>

    </div>
  );
}
