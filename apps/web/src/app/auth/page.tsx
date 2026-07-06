'use client';

import { AuthForms } from '@/components/AuthForms';

export default function AuthPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-4">
      <AuthForms />
    </div>
  );
}
