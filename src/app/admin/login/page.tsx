'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login-staff');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-300">Redirecting to Prayog Staff Portal...</p>
      </div>
    </div>
  );
}
